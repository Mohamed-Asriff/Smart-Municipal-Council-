import sqlite3
import random
import datetime
from pathlib import Path

# Database file location inside Backend/database directory
THIS_DIR = Path(__file__).resolve().parent
DB_PATH = THIS_DIR / "smart_municipal_council.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes SQLite database tables if they do not exist."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS complaints (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tracking_id TEXT UNIQUE NOT NULL,
                citizen_name TEXT DEFAULT 'Citizen',
                contact_number TEXT DEFAULT '',
                description TEXT NOT NULL,
                location TEXT NOT NULL,
                category TEXT NOT NULL,
                priority TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Recorded',
                is_duplicate INTEGER DEFAULT 0,
                similarity REAL DEFAULT 0.0,
                matched_complaint TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

# Ensure tables exist on import
try:
    init_db()
except Exception as e:
    print(f"[DB WARN] Initialization notice: {e}")

def generate_tracking_id():
    """Generates a unique tracking ID like KMC-2026-8492"""
    year = datetime.datetime.now().year
    rand_num = random.randint(1000, 9999)
    return f"KMC-{year}-{rand_num}"

def save_complaint(description: str, location: str, category: str, priority: str, 
                   citizen_name: str = "Citizen", contact_number: str = "",
                   is_duplicate: bool = False, similarity: float = 0.0, matched_complaint: str = "") -> dict:
    """Saves a complaint to the SQLite database and returns the record dict."""
    init_db()
    tracking_id = generate_tracking_id()
    created_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO complaints (
                tracking_id, citizen_name, contact_number, description, location, 
                category, priority, status, is_duplicate, similarity, matched_complaint, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Recorded', ?, ?, ?, ?)
        """, (
            tracking_id, citizen_name, contact_number, description, location,
            category, priority, 1 if is_duplicate else 0, similarity, matched_complaint, created_at
        ))
        conn.commit()

    return {
        "id": tracking_id,
        "tracking_id": tracking_id,
        "citizen_name": citizen_name,
        "contact_number": contact_number,
        "description": description,
        "location": location,
        "category": category,
        "priority": priority,
        "status": "Recorded",
        "is_duplicate": is_duplicate,
        "similarity": similarity,
        "matched_complaint": matched_complaint,
        "created_at": created_at
    }

def get_all_complaints(category_filter: str = None, priority_filter: str = None, status_filter: str = None):
    """Retrieves all complaints from SQLite DB with optional filters."""
    init_db()
    query = "SELECT * FROM complaints WHERE 1=1"
    params = []

    if category_filter:
        query += " AND LOWER(category) = LOWER(?)"
        params.append(category_filter)
    if priority_filter:
        query += " AND LOWER(priority) = LOWER(?)"
        params.append(priority_filter)
    if status_filter:
        query += " AND LOWER(status) = LOWER(?)"
        params.append(status_filter)

    query += " ORDER BY id DESC"

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()

    return [dict(row) for row in rows]

def get_complaint_by_tracking_id(tracking_id: str):
    """Fetches a single complaint by tracking ID."""
    init_db()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM complaints WHERE LOWER(tracking_id) = LOWER(?)", (tracking_id.strip(),))
        row = cursor.fetchone()
        return dict(row) if row else None

def update_complaint_status(tracking_id: str, new_status: str):
    """Updates status for a given complaint."""
    init_db()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE complaints SET status = ? WHERE LOWER(tracking_id) = LOWER(?)", 
                       (new_status, tracking_id.strip()))
        conn.commit()
        return cursor.rowcount > 0