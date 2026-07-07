import mysql.connector
from mysql.connector import Error
import os

DB_CONFIG = {
    "host":     os.environ.get("DB_HOST", "localhost"),
    "user":     os.environ.get("DB_USER", "root"),
    "password": os.environ.get("DB_PASSWORD", ""),#in this add sql password

    "database": os.environ.get("DB_NAME", "task_management_system")
}

def get_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"[DB ERROR] {e}")
        raise

def run_query(query, params=None, fetch=False, fetch_one=False):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(query, params or ())
        if fetch_one:
            return cursor.fetchone()
        if fetch:
            return cursor.fetchall()
        conn.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        conn.close()