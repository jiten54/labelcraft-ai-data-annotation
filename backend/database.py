"""
LabelCraft AI - Normalized SQLite Database Model
Database schema initialization for users, datasets, records, annotations,
audit trail, review decisions, and annotation guidelines.
"""

import sqlite3
import os

DB_PATH = os.environ.get("DATABASE_PATH", "labelcraft.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Users / Annotator Profiles
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'annotator', -- 'annotator', 'reviewer', 'admin'
        email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Datasets
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS datasets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        dataset_type TEXT NOT NULL, -- 'text' or 'image'
        record_count INTEGER DEFAULT 0,
        has_gold_standard BOOLEAN DEFAULT 0,
        is_synthetic BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 3. Text Records
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS text_records (
        id TEXT PRIMARY KEY,
        dataset_id TEXT NOT NULL,
        text_content TEXT NOT NULL,
        source_domain TEXT,
        status TEXT NOT NULL DEFAULT 'Unlabeled', -- 'Unlabeled', 'In Progress', 'Annotated', 'Needs Review', 'Approved', 'Rejected'
        FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
    );
    """)

    # 4. Image Records
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS image_records (
        id TEXT PRIMARY KEY,
        dataset_id TEXT NOT NULL,
        image_url TEXT NOT NULL,
        title TEXT,
        status TEXT NOT NULL DEFAULT 'Unlabeled',
        FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
    );
    """)

    # 5. Annotations (Preserves latest state)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS annotations (
        id TEXT PRIMARY KEY,
        record_id TEXT NOT NULL,
        record_type TEXT NOT NULL, -- 'text' or 'image'
        sentiment TEXT, -- 'Positive', 'Negative', 'Neutral', 'Unclear'
        topic TEXT, -- 'Technology', 'Education', 'Healthcare', 'Finance', 'Entertainment', 'Other'
        content_review TEXT, -- 'Relevant', 'Irrelevant', 'Needs Review'
        image_category TEXT,
        image_quality TEXT,
        is_ambiguous BOOLEAN DEFAULT 0,
        is_corrupted BOOLEAN DEFAULT 0,
        bounding_boxes_json TEXT,
        notes TEXT,
        annotated_by TEXT,
        annotated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (annotated_by) REFERENCES users(id)
    );
    """)

    # 6. Annotation History & Audit Trail (Immutable log)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS annotation_history (
        id TEXT PRIMARY KEY,
        record_id TEXT NOT NULL,
        dataset_id TEXT NOT NULL,
        action TEXT NOT NULL,
        operator TEXT NOT NULL,
        previous_val TEXT,
        new_val TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 7. QA Review Decisions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS review_decisions (
        id TEXT PRIMARY KEY,
        record_id TEXT NOT NULL,
        decision TEXT NOT NULL, -- 'Approved', 'Rejected', 'Correction Requested'
        reviewer TEXT NOT NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 8. Gold Standard Reference Labels
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS verified_references (
        record_id TEXT PRIMARY KEY,
        expected_sentiment TEXT,
        expected_topic TEXT,
        expected_review TEXT,
        expected_category TEXT,
        explanation TEXT
    );
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("LabelCraft normalized database initialized successfully.")
