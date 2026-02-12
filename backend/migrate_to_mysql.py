import sqlite3
import mysql.connector
import os

# Configuration (Matching app.py)
SQLITE_DB = 'database.db'
MYSQL_CONFIG = {
    'user': 'root',
    'password': '2004',
    'host': 'localhost',
    'database': 'csvtodataset'
}

def migrate():
    if not os.path.exists(SQLITE_DB):
        print(f"Error: {SQLITE_DB} not found!")
        return

    # Connect to both databases
    sl_conn = sqlite3.connect(SQLITE_DB)
    sl_cur = sl_conn.cursor()

    my_conn = mysql.connector.connect(**MYSQL_CONFIG)
    my_cur = my_conn.cursor()

    # Get all tables from SQLite
    sl_cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [t[0] for t in sl_cur.fetchall() if t[0] != 'sqlite_sequence']

    print(f"Found {len(tables)} tables to migrate: {tables}")

    for table in tables:
        print(f"Migrating table: {table}...")
        
        # Get column info
        sl_cur.execute(f"PRAGMA table_info('{table}')")
        columns = sl_cur.fetchall()
        
        # Create table in MySQL
        # Map SQLite types to MySQL (Simplified: use TEXT/LONGTEXT for flexibility)
        col_defs = []
        for col in columns:
            name = col[1]
            ctype = col[2]
            # Map common types
            if 'INT' in ctype.upper():
                mtype = 'INT'
            elif 'DATETIME' in ctype.upper():
                mtype = 'DATETIME'
            else:
                mtype = 'LONGTEXT'
            
            # Special case for headers/keys in meta tables
            if table.startswith('__') and name == 'id':
                col_defs.append(f"`{name}` INT AUTO_INCREMENT PRIMARY KEY")
            else:
                col_defs.append(f"`{name}` {mtype}")

        my_cur.execute(f"DROP TABLE IF EXISTS `{table}`")
        my_cur.execute(f"CREATE TABLE `{table}` ({', '.join(col_defs)})")

        # Fetch data from SQLite
        sl_cur.execute(f"SELECT * FROM `{table}`")
        rows = sl_cur.fetchall()

        if rows:
            # Insert into MySQL
            placeholders = ", ".join(["%s"] * len(columns))
            sql = f"INSERT INTO `{table}` VALUES ({placeholders})"
            
            # Chunks for large tables
            chunk_size = 1000
            for i in range(0, len(rows), chunk_size):
                chunk = rows[i:i + chunk_size]
                my_cur.executemany(sql, chunk)
            
            print(f"  Inserted {len(rows)} rows into `{table}`.")
        else:
            print(f"  Table `{table}` is empty.")

    my_conn.commit()
    sl_conn.close()
    my_conn.close()
    print("Migration completed successfully!")

if __name__ == "__main__":
    migrate()
