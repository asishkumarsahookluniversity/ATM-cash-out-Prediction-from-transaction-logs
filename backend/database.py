"""
ATM Cash-Out Prediction System
Database Initialization & Session Management
Uses SQLite with structured table definitions. Can be swapped with PostgreSQL.
"""

import sqlite3
import os

DB_PATH = os.environ.get("DATABASE_URL", "atm_system.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. ATMs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS atms (
        atm_id TEXT PRIMARY KEY,
        location TEXT NOT NULL,
        current_balance REAL NOT NULL,
        max_capacity REAL NOT NULL,
        daily_avg_demand REAL NOT NULL,
        status TEXT NOT NULL,
        last_refill_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 2. Transactions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        atm_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        transaction_type TEXT NOT NULL,
        amount REAL NOT NULL,
        balance_after REAL NOT NULL,
        location TEXT,
        FOREIGN KEY (atm_id) REFERENCES atms(atm_id)
    )
    """)
    
    # 3. Refills table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS refills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        atm_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        refill_amount REAL NOT NULL,
        balance_before REAL,
        balance_after REAL,
        technician TEXT,
        FOREIGN KEY (atm_id) REFERENCES atms(atm_id)
    )
    """)
    
    # 4. Predictions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        atm_id TEXT NOT NULL,
        predicted_at TEXT NOT NULL,
        cashout_probability REAL NOT NULL,
        risk_level TEXT NOT NULL,
        predicted_cashout INTEGER NOT NULL,
        estimated_hours_to_empty REAL NOT NULL,
        recommended_action TEXT NOT NULL,
        priority_rank INTEGER,
        FOREIGN KEY (atm_id) REFERENCES atms(atm_id)
    )
    """)
    
    # 5. Model Metrics table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS model_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_name TEXT NOT NULL,
        trained_at TEXT NOT NULL,
        accuracy REAL NOT NULL,
        precision REAL NOT NULL,
        recall REAL NOT NULL,
        f1 REAL NOT NULL,
        roc_auc REAL NOT NULL,
        dataset_size INTEGER NOT NULL
    )
    """)
    
    # 6. Alerts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        atm_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        severity TEXT NOT NULL,
        message TEXT NOT NULL,
        is_resolved INTEGER DEFAULT 0
    )
    """)
    
    conn.commit()
    conn.close()
    print("Database tables initialized successfully.")

if __name__ == "__main__":
    init_db()
