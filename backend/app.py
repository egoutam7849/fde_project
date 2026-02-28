from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import mysql.connector
import pandas as pd
from datetime import datetime, timedelta
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from passlib.hash import pbkdf2_sha256
from functools import wraps

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
    # Users table
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS __users__ (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('admin', 'student') NOT NULL DEFAULT 'student',
            created_at DATETIME NOT NULL
        )
        """
    )
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
    # System logs table
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS __system_logs__ (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            action VARCHAR(50) NOT NULL,
            details TEXT,
            created_at DATETIME NOT NULL
        )
        """
    )
    
    # Seed default admin if no users exist
    cur.execute("SELECT COUNT(*) FROM __users__")
    if cur.fetchone()[0] == 0:
        admin_pass = pbkdf2_sha256.hash("admin123")
        cur.execute(
            "INSERT INTO __users__ (username, password_hash, role, created_at) VALUES (%s, %s, %s, %s)",
            ("admin", admin_pass, "admin", datetime.now()),
        )
        # Seed a student for testing
        student_pass = pbkdf2_sha256.hash("student123")
        cur.execute(
            "INSERT INTO __users__ (username, password_hash, role, created_at) VALUES (%s, %s, %s, %s)",
            ("student", student_pass, "student", datetime.now()),
        )
    
    conn.commit()
    conn.close()


app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "super-secret-fde-key" # In production, use env var
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
CORS(app)
jwt = JWTManager(app)

# Role decorator
def admin_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            claims = get_jwt()
            if claims.get("role") != "admin":
                return jsonify({"error": "Admin access required"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def log_activity(username, action, details=None):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO __system_logs__ (username, action, details, created_at) VALUES (%s, %s, %s, %s)",
            (username, action, details, datetime.now())
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Logging failed: {e}")

# Initialize DB on startup
try:
    init_db()
except Exception as e:
    print(f"Database initialization failed: {e}")


@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "status": "online",
        "message": "Backend API is running (Auth Enabled)",
        "endpoints": [
            "/auth/login",
            "/upload",
            "/tables",
            "/stats",
            "/history"
        ]
    })


@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM __users__ WHERE username = %s", (username,))
    user = cur.fetchone()
    conn.close()

    if user and pbkdf2_sha256.verify(password, user["password_hash"]):
        access_token = create_access_token(
            identity=str(user["id"]), 
            additional_claims={"username": user["username"], "role": user["role"]}
        )
        log_activity(user["username"], "Login", f"User logged in from {request.remote_addr}")
        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user["id"],
                "username": user["username"],
                "role": user["role"]
            }
        })

    return jsonify({"error": "Invalid credentials"}), 401


@app.route("/auth/me", methods=["GET"])
@jwt_required()
def get_me():
    claims = get_jwt()
    return jsonify({
        "username": claims.get("username"),
        "role": claims.get("role")
    })


@app.route("/upload", methods=["POST"])
@admin_required()
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
        # Ensure column names are valid strings (handle missing/NaN headers)
        new_cols = []
        for i, col in enumerate(df.columns):
            if pd.isna(col) or str(col).strip() == "":
                new_name = f"col_{i}"
            else:
                new_name = str(col).replace("-", "_").replace(" ", "_")
            new_cols.append(new_name)
        df.columns = new_cols
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
        cur = conn.cursor()
        cur.execute(f"DROP TABLE IF EXISTS `{table_name}`")
        cur.execute(f"CREATE TABLE `{table_name}` ({cols})")

        # Prepare insert
        placeholders = ", ".join(["%s"] * len(df.columns))
        sql = f"INSERT INTO `{table_name}` VALUES ({placeholders})"

        # Convert dataframe to Python-native lists and replace NaN/'nan' with None
        df = df.where(pd.notnull(df), None)

        def _sanitize_cell(v):
            # Handle None
            if v is None:
                return None
            # pandas uses numpy types; convert numpy scalars to native Python
            try:
                # numpy scalar
                if hasattr(v, 'item'):
                    v = v.item()
            except Exception:
                pass
            # floats that are NaN
            try:
                import math
                if isinstance(v, float) and math.isnan(v):
                    return None
            except Exception:
                pass
            # string 'nan' (sometimes appears as literal)
            if isinstance(v, str) and v.strip().lower() == 'nan':
                return None
            return v

        raw_rows = df.values.tolist()
        data = []
        for row in raw_rows:
            data.append(tuple(_sanitize_cell(x) for x in row))

        cur.executemany(sql, data)
        
        rows_inserted = len(df)

        # Record metadata
        cur.execute(
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

    log_activity(get_jwt().get("username"), "Upload", f"Uploaded table '{table_name}' with {rows_inserted} rows")
    return jsonify({"table": table_name, "rows": rows_inserted})


@app.route("/tables", methods=["GET"])
@jwt_required()
def list_tables():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SHOW TABLES")
    # Filter out internal tables
    tables = [row[0] for row in cur.fetchall() if not row[0].startswith("__")]
    conn.close()
    return jsonify({"tables": tables})


@app.route("/data/<table_name>", methods=["GET"])
@jwt_required()
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
@admin_required()
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
@jwt_required()
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
@admin_required()
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
    
    log_activity(get_jwt().get("username"), "Delete Table", f"Deleted table '{table_name}'")
    conn.close()
    return jsonify({"message": f"Table {table_name} deleted successfully"})


@app.route("/export/<table_name>", methods=["GET"])
@jwt_required()
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
@jwt_required()
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
@jwt_required()
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
@jwt_required()
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


@app.route("/admin/users", methods=["GET"])
@admin_required()
def get_users():
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, username, role, created_at FROM __users__ ORDER BY created_at DESC")
    users = cur.fetchall()
    conn.close()
    return jsonify({"users": users})


@app.route("/admin/users", methods=["POST"])
@admin_required()
def add_user():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "student")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    if role not in ["admin", "student"]:
        return jsonify({"error": "Invalid role"}), 400

    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # Check if user already exists
        cur.execute("SELECT id FROM __users__ WHERE username = %s", (username,))
        if cur.fetchone():
            conn.close()
            return jsonify({"error": "Username already exists"}), 400

        password_hash = pbkdf2_sha256.hash(password)
        cur.execute(
            "INSERT INTO __users__ (username, password_hash, role, created_at) VALUES (%s, %s, %s, %s)",
            (username, password_hash, role, datetime.now())
        )
        conn.commit()
        conn.close()
    except Exception as e:
        return jsonify({"error": f"Failed to create user: {e}"}), 500

    log_activity(get_jwt().get("username"), "User Management", f"Created user '{username}' with role '{role}'")
    return jsonify({"message": "User created successfully"})


@app.route("/admin/users/<int:user_id>", methods=["DELETE"])
@admin_required()
def delete_user(user_id):
    # Prevent self-deletion
    current_user_id = int(get_jwt_identity())
    
    if user_id == current_user_id:
        return jsonify({"error": "You cannot delete your own account"}), 400

    conn = get_connection()
    try:
        cur = conn.cursor(dictionary=True)
        # Get username before delete for logging
        cur.execute("SELECT username FROM __users__ WHERE id = %s", (user_id,))
        row = cur.fetchone()
        target_username = row["username"] if row else "Unknown"
        
        cur.execute("DELETE FROM __users__ WHERE id = %s", (user_id,))
        conn.commit()
        log_activity(get_jwt().get("username"), "User Management", f"Deleted user '{target_username}'")
    except Exception as e:
        conn.close()
        return jsonify({"error": f"Failed to delete user: {e}"}), 500
    
    conn.close()
    return jsonify({"message": "User deleted successfully"})


@app.route("/admin/logs", methods=["GET"])
@admin_required()
def get_audit_logs():
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM __system_logs__ ORDER BY created_at DESC LIMIT 100")
    logs = cur.fetchall()
    conn.close()
    return jsonify({"logs": logs})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
