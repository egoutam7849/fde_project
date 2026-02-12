from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import mysql.connector
import pandas as pd
from datetime import datetime

# MySQL Configuration
DB_CONFIG = {
    'user': 'root',
    'password': '2004',
    'host': 'localhost',
    'database': 'csvtodataset'
}

def get_connection():
    return mysql.connector.connect(**DB_CONFIG)

def init_db():
    conn = get_connection()
    cur = conn.cursor()
    # Metadata table to track uploads
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS __uploads_meta__ (
            id INT AUTO_INCREMENT PRIMARY KEY,
            table_name VARCHAR(255) NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            rows_inserted INT NOT NULL,
            created_at DATETIME NOT NULL
        )
        """
    )
    # Query history table
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS __query_history__ (
            id INT AUTO_INCREMENT PRIMARY KEY,
            query_text TEXT NOT NULL,
            execution_time_ms INT,
            created_at DATETIME NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


app = Flask(__name__)
CORS(app)

# Initialize DB on startup
try:
    init_db()
except Exception as e:
    print(f"Database initialization failed: {e}")


@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "status": "online",
        "message": "Backend API is running (MySQL Reloaded)",
        "endpoints": [
            "/upload",
            "/tables",
            "/stats",
            "/history",
            "/history/queries"
        ]
    })


@app.route("/upload", methods=["POST"])
def upload_csv():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    table_name = os.path.splitext(os.path.basename(file.filename))[0]
    # Normalize table name to avoid invalid characters
    table_name = table_name.replace("-", "_").replace(" ", "_")
    if not table_name:
        return jsonify({"error": "Invalid file name"}), 400

    try:
        df = pd.read_csv(file)
    except Exception as e:
        return jsonify({"error": f"Failed to read CSV: {e}"}), 400

    if df.empty:
        return jsonify({"error": "CSV has no rows"}), 400

    try:
        conn = get_connection()
        # Use pandas to_sql with mysql connector using sqlalchemy engine is better, 
        # but standard to_sql needs sqlalchemy. 
        # For simplicity without sqlalchemy dependency, consistent with previous style:
        # We'll use pandas to_sql if sqlalchemy is present, or manual insert.
        # But 'mysql-connector-python' alone doesn't support to_sql directly without sqlalchemy.
        # Let's use sqlalchemy if possible, or manual.
        # Check if sqlalchemy is available? It should be standard with pandas often, but let's be safe.
        # Actually, let's just use manual insert for now to avoid sqlalchemy dependency issues if not present.
        
        # Create table logic
        cols = ", ".join([f"`{col}` TEXT" for col in df.columns]) # Simplified type inference
        conn.cursor().execute(f"DROP TABLE IF EXISTS `{table_name}`")
        conn.cursor().execute(f"CREATE TABLE `{table_name}` ({cols})")
        
        # Insert data
        cursor = conn.cursor()
        placeholders = ", ".join(["%s"] * len(df.columns))
        sql = f"INSERT INTO `{table_name}` VALUES ({placeholders})"
        
        # Convert df to tuples, handling NaN
        data = [tuple(x) for x in df.where(pd.notnull(df), None).to_numpy()]
        cursor.executemany(sql, data)
        
        rows_inserted = len(df)

        # Record metadata
        cursor.execute(
            """
            INSERT INTO __uploads_meta__ (table_name, file_name, rows_inserted, created_at)
            VALUES (%s, %s, %s, %s)
            """,
            (
                table_name,
                file.filename,
                rows_inserted,
                datetime.now()
            ),
        )
        conn.commit()
        conn.close()
    except Exception as e:
        return jsonify({"error": f"Failed to save to database: {e}"}), 500

    return jsonify({"table": table_name, "rows": rows_inserted})


@app.route("/tables", methods=["GET"])
def list_tables():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SHOW TABLES")
    # Filter out internal tables
    tables = [row[0] for row in cur.fetchall() if not row[0].startswith("__")]
    conn.close()
    return jsonify({"tables": tables})


@app.route("/data/<table_name>", methods=["GET"])
def get_table_data(table_name):
    # ... (keep existing implementation but ensure table name is safe provided it comes from list_tables)
    safe_table = table_name.replace("-", "_").replace(" ", "_")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 100))
    offset = (page - 1) * limit

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        # Get total rows
        cur.execute(f'SELECT COUNT(*) AS count FROM `{safe_table}`')
        total_rows = cur.fetchone()["count"]

        # Get paginated data
        cur.execute(f'SELECT * FROM `{safe_table}` LIMIT %s OFFSET %s', (limit, offset))
        rows = cur.fetchall()
        columns = cur.column_names if rows else []
        if not columns:
             # If no rows, get columns from metadata
             cur.execute(f"SHOW COLUMNS FROM `{safe_table}`")
             columns = [col['Field'] for col in cur.fetchall()]
             
    except Exception as e:
        conn.close()
        return jsonify({"error": f"Failed to fetch data: {e}"}), 400

    conn.close()

    return jsonify({
        "columns": columns,
        "rows": rows,
        "total_rows": total_rows,
        "page": page,
        "limit": limit
    })


@app.route("/query", methods=["POST"])
def run_query():
    body = request.get_json(silent=True) or {}
    sql = body.get("query", "")
    if not isinstance(sql, str) or not sql.strip():
        return jsonify({"error": "Query is required"}), 400

    # Allow only SELECT statements (basic safeguard)
    stripped = sql.strip().lower()
    if not stripped.startswith("select") and not stripped.startswith("show") and not stripped.startswith("desc"):
        return jsonify({"error": "Only SELECT/SHOW/DESC queries are allowed"}), 400

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    start_time = datetime.now()
    try:
        cur.execute(sql)
        rows = cur.fetchall()
        columns = cur.column_names if rows else []
        
        # Log query history
        try:
             duration = (datetime.now() - start_time).total_seconds() * 1000
             # Use a robust way to insert history even if it fails
             hist_conn = get_connection()
             hist_cur = hist_conn.cursor()
             hist_cur.execute(
                """
                INSERT INTO __query_history__ (query_text, execution_time_ms, created_at)
                VALUES (%s, %s, %s)
                """,
                (sql, int(duration), datetime.now())
             )
             hist_conn.commit()
             hist_conn.close()
        except Exception as e:
            print(f"Failed to log query: {e}")

    except Exception as e:
        conn.close()
        return jsonify({"error": f"Query failed: {e}"}), 400

    conn.close()
    return jsonify({"columns": columns, "rows": rows})


@app.route("/stats", methods=["GET"])
def get_stats():
    conn = get_connection()
    cur = conn.cursor()

    # Get all tables
    cur.execute("SHOW TABLES")
    all_tables = [row[0] for row in cur.fetchall()]
    
    # Filter tables
    user_tables = [t for t in all_tables if not t.startswith("__")]
    
    total_tables = len(user_tables)
    table_stats = []
    total_rows = 0
    
    for table in user_tables:
        try:
            cur.execute(f"SELECT COUNT(*) as c FROM `{table}`")
            count = cur.fetchone()[0]
            total_rows += count
            table_stats.append({"name": table, "rows": count})
        except:
            table_stats.append({"name": table, "rows": 0})

    # Recent uploads
    cur.execute(
        """
        SELECT table_name, file_name, rows_inserted, created_at
        FROM __uploads_meta__
        ORDER BY created_at DESC
        LIMIT 10
        """
    )
    # Manual dict conversion for recent_uploads
    columns = [col[0] for col in cur.description]
    recent_uploads = [dict(zip(columns, row)) for row in cur.fetchall()]
    
    # Upload trends (grouped by date)
    cur.execute(
        """
        SELECT DATE(created_at) as upload_date, COUNT(*) as count
        FROM __uploads_meta__
        GROUP BY upload_date
        ORDER BY upload_date DESC
        LIMIT 30
        """
    )
    columns = [col[0] for col in cur.description]
    upload_trends = [dict(zip(columns, row)) for row in cur.fetchall()]

    # Get DB info
    cur.execute("SELECT DATABASE()")
    current_db = cur.fetchone()[0]

    conn.close()

    return jsonify(
        {
            "total_tables": total_tables,
            "total_rows": total_rows,
            "recent_uploads": recent_uploads,
            "upload_trends": upload_trends,
            "total_files_uploaded": len(recent_uploads), # Approximate
            "table_stats": table_stats,
            "system_info": {
                "db_type": "MySQL",
                "python_version": "3.12", 
                "server_status": "Online"
            }
        }
    )


@app.route("/tables/<table_name>", methods=["DELETE"])
def delete_table(table_name):
    safe_table = table_name.replace("-", "_").replace(" ", "_")
    conn = get_connection()
    try:
        conn.cursor().execute(f'DROP TABLE IF EXISTS `{safe_table}`')
        # Cleanup metadata
        conn.cursor().execute('DELETE FROM __uploads_meta__ WHERE table_name = %s', (table_name,))
        conn.commit()
    except Exception as e:
        conn.close()
        return jsonify({"error": f"Failed to delete table: {e}"}), 400
    
    conn.close()
    return jsonify({"message": f"Table {table_name} deleted successfully"})


@app.route("/export/<table_name>", methods=["GET"])
def export_table(table_name):
    safe_table = table_name.replace("-", "_").replace(" ", "_")
    conn = get_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(f"SELECT * FROM `{safe_table}`")
        rows = cur.fetchall()
        df = pd.DataFrame(rows)
        conn.close()
        
        csv_data = df.to_csv(index=False)
        
        return csv_data, 200, {
            "Content-Type": "text/csv",
            "Content-Disposition": f"attachment; filename={table_name}.csv"
        }
    except Exception as e:
        conn.close()
        return jsonify({"error": f"Failed to export table: {e}"}), 400


@app.route("/history", methods=["GET"])
def get_history():
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute(
        """
        SELECT id, table_name, file_name, rows_inserted, created_at
        FROM __uploads_meta__
        ORDER BY created_at DESC
        """
    )
    history = cur.fetchall()
    conn.close()
    return jsonify({"history": history})


@app.route("/history/queries", methods=["GET"])
def get_query_history():
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute(
        """
        SELECT id, query_text, execution_time_ms, created_at
        FROM __query_history__
        ORDER BY created_at DESC
        LIMIT 50
        """
    )
    history = cur.fetchall()
    conn.close()
    return jsonify({"history": history})


@app.route("/quality/<table_name>", methods=["GET"])
def get_data_quality(table_name):
    safe_table = table_name.replace("-", "_").replace(" ", "_")
    conn = get_connection()
    try:
        cur = conn.cursor(dictionary=True)
        # Load data manually to avoid pd.read_sql needing sqlalchemy
        cur.execute(f'SELECT * FROM `{safe_table}`')
        rows = cur.fetchall()
        df = pd.DataFrame(rows)
        conn.close()

        total_rows = len(df)
        columns_info = []

        for col in df.columns:
            null_count = int(df[col].isnull().sum())
            unique_count = int(df[col].nunique())
            dtype = str(df[col].dtype)
            
            # Simple sample
            sample_values = df[col].dropna().head(3).tolist()

            col_data = {
                "name": col,
                "type": dtype,
                "null_count": null_count,
                "null_percentage": round((null_count / total_rows * 100), 2) if total_rows > 0 else 0,
                "unique_count": unique_count,
                "samples": sample_values
            }
            columns_info.append(col_data)

        return jsonify({
            "table": table_name,
            "total_rows": total_rows,
            "columns": columns_info
        })

    except Exception as e:
        conn.close()
        return jsonify({"error": f"Failed to analyze table: {e}"}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
