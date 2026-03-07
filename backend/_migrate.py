"""One-time migration: add tool_calls_json column to messages table."""
import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "notebooklm.db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if column exists
cursor.execute("PRAGMA table_info(messages)")
cols = [row[1] for row in cursor.fetchall()]
print(f"Current columns: {cols}")

if "tool_calls_json" not in cols:
    cursor.execute('ALTER TABLE messages ADD COLUMN tool_calls_json TEXT DEFAULT "[]"')
    conn.commit()
    print("✔ Added tool_calls_json column")
else:
    print("✔ tool_calls_json already exists")

conn.close()
