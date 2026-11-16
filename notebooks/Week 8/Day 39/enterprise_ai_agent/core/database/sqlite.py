"""SQLite stores LangChain message JSON; SQL parameters keep values separate from SQL."""
import json
import sqlite3
from contextlib import closing
from langchain_core.messages import messages_from_dict, messages_to_dict
from core import settings


def connect():
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
    return sqlite3.connect(settings.DATABASE_PATH, timeout=30)

def init_database():
    with closing(connect()) as connection, connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                message_json TEXT NOT NULL
            )
        """)
        connection.execute("CREATE INDEX IF NOT EXISTS messages_session ON messages(session_id, id)")
        connection.execute("""
            CREATE TABLE IF NOT EXISTS complaints (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_name TEXT NOT NULL,
                order_id TEXT NOT NULL,
                phone TEXT NOT NULL,
                complaint TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Pending'
            )
        """)

def save_complaint(customer_name, order_id, phone, complaint):
    values = (customer_name, order_id, phone, complaint)
    with closing(connect()) as connection, connection:
        # Retrying the same complaint returns its existing ID.
        connection.execute(
            "INSERT OR IGNORE INTO complaints (customer_name, order_id, phone, complaint) VALUES (?, ?, ?, ?)",
            values,
        )
        row = connection.execute(
            "SELECT id FROM complaints WHERE customer_name=? AND order_id=? AND phone=? AND complaint=?",
            values,
        ).fetchone()
    return {"complaint_id": row[0], "status": "Pending"}








# def connect():
#     settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
#     return sqlite3.connect(settings.DATABASE_PATH, timeout=30)


def load_messages(session_id):
    with closing(connect()) as connection:
        rows = connection.execute(
            "SELECT message_json FROM messages WHERE session_id = ? ORDER BY id",
            (session_id,),
        ).fetchall()
    return messages_from_dict([json.loads(row[0]) for row in rows])


def append_messages(session_id, messages):
    # One transaction: save all messages for a successful turn together.
    rows = [(session_id, json.dumps(message)) for message in messages_to_dict(messages)]
    with closing(connect()) as connection, connection:
        connection.executemany(
            "INSERT INTO messages (session_id, message_json) VALUES (?, ?)", rows
        )


