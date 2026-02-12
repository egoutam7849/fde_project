from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sqlite3
import pandas as pd
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cur = conn.cursor()
    # Metadata table to track uploads
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS __uploads_meta__ (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_name TEXT NOT NULL,
            file_name TEXT NOT NULL,
            rows_inserted INTEGER NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


app = Flask(__name__)
CORS(app)
init_db()


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
        df.to_sql(table_name, conn, if_exists="replace", index=False)
        rows_inserted = len(df)

        # Record metadata
        conn.execute(
            """
            INSERT INTO __uploads_meta__ (table_name, file_name, rows_inserted, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (
                table_name,
                file.filename,
                rows_inserted,
                datetime.utcnow().isoformat() + "Z",
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
    cur.execute(
        """
        SELECT name FROM sqlite_master
        WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '__uploads_meta__'
        ORDER BY name
        """
    )
    tables = [row["name"] for row in cur.fetchall()]
    conn.close()
    return jsonify({"tables": tables})


@app.route("/data/<table_name>", methods=["GET"])
def get_table_data(table_name):
    safe_table = table_name.replace("-", "_").replace(" ", "_")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 100))
    offset = (page - 1) * limit

    conn = get_connection()
    cur = conn.cursor()
    try:
        # Get total rows
        cur.execute(f'SELECT COUNT(*) AS count FROM "{safe_table}"')
        total_rows = cur.fetchone()["count"]

        # Get paginated data
        cur.execute(f'SELECT * FROM "{safe_table}" LIMIT ? OFFSET ?', (limit, offset))
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description] if cur.description else []
    except Exception as e:
        conn.close()
        return jsonify({"error": f"Failed to fetch data: {e}"}), 400

    conn.close()

    data = [dict(zip(columns, row)) for row in rows]
    return jsonify({
        "columns": columns,
        "rows": data,
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
    if not stripped.startswith("select"):
        return jsonify({"error": "Only SELECT queries are allowed"}), 400

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(sql)
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description] if cur.description else []
    except Exception as e:
        conn.close()
        return jsonify({"error": f"Query failed: {e}"}), 400

    conn.close()
    data = [dict(zip(columns, row)) for row in rows]
    return jsonify({"columns": columns, "rows": data})


@app.route("/stats", methods=["GET"])
def get_stats():
    conn = get_connection()
    cur = conn.cursor()

    # Total tables (excluding internal)
    cur.execute(
        """
        SELECT COUNT(*) AS count FROM sqlite_master
        WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '__uploads_meta__'
        """
    )
    total_tables = cur.fetchone()["count"]

    # Total rows across all user tables
    cur.execute(
        """
        SELECT name FROM sqlite_master
        WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '__uploads_meta__'
        """
    )
    table_names = [row["name"] for row in cur.fetchall()]

    table_stats = []
    total_rows = 0
    for name in table_names:
        try:
            cur.execute(f'SELECT COUNT(*) AS c FROM "{name}"')
            count = cur.fetchone()["c"]
            total_rows += count
            table_stats.append({"name": name, "rows": count})
        except Exception:
            continue

    # Recent uploads from metadata table
    cur.execute(
        """
        SELECT table_name, file_name, rows_inserted, created_at
        FROM __uploads_meta__
        ORDER BY datetime(created_at) DESC
        LIMIT 10
        """
    )
    recent_uploads = [dict(row) for row in cur.fetchall()]

    conn.close()

    return jsonify(
        {
            "total_tables": total_tables,
            "total_rows": total_rows,
            "recent_uploads": recent_uploads,
            "total_files_uploaded": len(
                {
                    (u["table_name"], u["file_name"])
                    for u in recent_uploads
                }
            ),
            "table_stats": table_stats,
        }
    )


@app.route("/tables/<table_name>", methods=["DELETE"])
def delete_table(table_name):
    safe_table = table_name.replace("-", "_").replace(" ", "_")
    conn = get_connection()
    try:
        conn.execute(f'DROP TABLE IF EXISTS "{safe_table}"')
        # Optional: Clean up metadata if you want strict consistency
        conn.execute('DELETE FROM __uploads_meta__ WHERE table_name = ?', (table_name,))
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
        df = pd.read_sql(f'SELECT * FROM "{safe_table}"', conn)
        conn.close()
        
        # Convert to CSV string
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
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, table_name, file_name, rows_inserted, created_at
        FROM __uploads_meta__
        ORDER BY datetime(created_at) DESC
        """
    )
    history = [dict(row) for row in cur.fetchall()]
    conn.close()
    return jsonify({"history": history})


@app.route("/quality/<table_name>", methods=["GET"])
def get_data_quality(table_name):
    safe_table = table_name.replace("-", "_").replace(" ", "_")
    conn = get_connection()
    try:
        # Load data into pandas for analysis
        df = pd.read_sql(f'SELECT * FROM "{safe_table}"', conn)
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
    # Default Flask dev server
    app.run(host="0.0.0.0", port=5000, debug=True)

