import sqlite3
import os
import sys

db_path = 'database.db'

def describe_table(conn, table_name):
    cur = conn.cursor()
    try:
        cur.execute(f"PRAGMA table_info('{table_name}')")
        columns = cur.fetchall()
        print(f"\nSchema for '{table_name}':")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
        
        cur.execute(f"SELECT COUNT(*) FROM '{table_name}'")
        count = cur.fetchone()[0]
        print(f"Total rows: {count}")
    except Exception as e:
        print(f"Error describing table: {e}")

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [t[0] for t in cur.fetchall()]
    
    if len(sys.argv) > 1:
        target_table = sys.argv[1]
        if target_table in tables:
            describe_table(conn, target_table)
        else:
            print(f"Table '{target_table}' not found.")
    else:
        print("Tables in SQLite:", tables)
        print("\nUsage: python check_sqlite.py [table_name] to see schema/rows")
        
    conn.close()
else:
    print("database.db not found")
