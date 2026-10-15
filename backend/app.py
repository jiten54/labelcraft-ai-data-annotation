"""
LabelCraft AI — Data Annotation & Quality Assurance API
Built with FastAPI, SQLite, Pydantic, and Pandas.
Specifically tailored to the Codefeast Data Annotator requirements.
"""

from fastapi import FastAPI, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import sqlite3
import pandas as pd
import io
import json
import uuid
from datetime import datetime

from database import get_connection, init_db

app = FastAPI(
    title="LabelCraft AI Backend",
    description="REST API for dataset ingestion, labeling, automated QA audits, and gold-standard metrics.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event
@app.on_event("startup")
def startup_event():
    init_db()

# --- Pydantic Request Models ---
class TextAnnotationRequest(BaseModel):
    record_id: str
    dataset_id: str
    sentiment: Optional[str] = Field(None, pattern="^(Positive|Negative|Neutral|Unclear)$")
    topic: Optional[str] = Field(None, pattern="^(Technology|Education|Healthcare|Finance|Entertainment|Other)$")
    content_review: Optional[str] = Field(None, pattern="^(Relevant|Irrelevant|Needs Review)$")
    notes: Optional[str] = None
    is_ambiguous: Optional[bool] = False
    annotator_id: str

class ImageAnnotationRequest(BaseModel):
    record_id: str
    dataset_id: str
    category: Optional[str] = None
    quality: Optional[str] = None
    is_corrupted: Optional[bool] = False
    bounding_boxes: Optional[List[Dict[str, Any]]] = []
    notes: Optional[str] = None
    annotator_id: str

class ReviewDecisionRequest(BaseModel):
    record_id: str
    decision: str = Field(..., pattern="^(Approved|Rejected|Correction Requested)$")
    reviewer: str
    reason: str

# --- Endpoints ---

@app.get("/health")
def health_check():
    return {"status": "healthy", "platform": "LabelCraft AI", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/datasets")
def list_datasets():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM datasets ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/tasks/text")
def get_text_tasks(
    dataset_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    conn = get_connection()
    cursor = conn.cursor()
    query = """
    SELECT t.id, t.dataset_id, t.text_content, t.source_domain, t.status,
           a.sentiment, a.topic, a.content_review, a.is_ambiguous, a.notes, a.annotated_by, a.annotated_at,
           vr.expected_sentiment, vr.expected_topic
    FROM text_records t
    LEFT JOIN annotations a ON t.id = a.record_id AND a.record_type = 'text'
    LEFT JOIN verified_references vr ON t.id = vr.record_id
    WHERE 1=1
    """
    params = []
    if dataset_id:
        query += " AND t.dataset_id = ?"
        params.append(dataset_id)
    if status:
        query += " AND t.status = ?"
        params.append(status)

    query += " LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/api/annotations/text")
def save_text_annotation(req: TextAnnotationRequest):
    conn = get_connection()
    cursor = conn.cursor()

    # Determine status
    is_complete = bool(req.sentiment and req.topic and req.content_review)
    new_status = "Needs Review" if req.is_ambiguous else ("Annotated" if is_complete else "In Progress")

    # Update record status
    cursor.execute("UPDATE text_records SET status = ? WHERE id = ?", (new_status, req.record_id))

    # Insert or update annotation
    cursor.execute("""
    INSERT INTO annotations (id, record_id, record_type, sentiment, topic, content_review, is_ambiguous, notes, annotated_by)
    VALUES (?, ?, 'text', ?, ?, ?, ?, ?, ?)
    ON CONFLICT(record_id) DO UPDATE SET
        sentiment=excluded.sentiment,
        topic=excluded.topic,
        content_review=excluded.content_review,
        is_ambiguous=excluded.is_ambiguous,
        notes=excluded.notes,
        annotated_by=excluded.annotated_by,
        annotated_at=CURRENT_TIMESTAMP
    """, (
        str(uuid.uuid4()), req.record_id, req.sentiment, req.topic, 
        req.content_review, req.is_ambiguous, req.notes, req.annotator_id
    ))

    # Record history
    cursor.execute("""
    INSERT INTO annotation_history (id, record_id, dataset_id, action, operator, new_val, notes)
    VALUES (?, ?, ?, 'Updated Annotation', ?, ?, ?)
    """, (
        str(uuid.uuid4()), req.record_id, req.dataset_id, req.annotator_id,
        f"[{req.sentiment}] - [{req.topic}]", req.notes
    ))

    conn.commit()
    conn.close()
    return {"status": "success", "record_id": req.record_id, "new_status": new_status}

@app.post("/api/qa/review")
def submit_review_decision(req: ReviewDecisionRequest):
    conn = get_connection()
    cursor = conn.cursor()

    new_status = "Approved" if req.decision == "Approved" else ("Rejected" if req.decision == "Rejected" else "Needs Review")
    cursor.execute("UPDATE text_records SET status = ? WHERE id = ?", (new_status, req.record_id))
    cursor.execute("UPDATE image_records SET status = ? WHERE id = ?", (new_status, req.record_id))

    cursor.execute("""
    INSERT INTO review_decisions (id, record_id, decision, reviewer, reason)
    VALUES (?, ?, ?, ?, ?)
    """, (str(uuid.uuid4()), req.record_id, req.decision, req.reviewer, req.reason))

    cursor.execute("""
    INSERT INTO annotation_history (id, record_id, dataset_id, action, operator, new_val, notes)
    VALUES (?, ?, 'system', ?, ?, ?, ?)
    """, (str(uuid.uuid4()), req.record_id, f"QA {req.decision}", req.reviewer, f"Decision: {req.decision}", req.reason))

    conn.commit()
    conn.close()
    return {"status": "success", "decision": req.decision}

@app.get("/api/evaluation/metrics")
def get_evaluation_metrics(dataset_id: Optional[str] = None):
    conn = get_connection()
    query = """
    SELECT a.sentiment AS pred, vr.expected_sentiment AS ground_truth
    FROM annotations a
    INNER JOIN verified_references vr ON a.record_id = vr.record_id
    WHERE a.sentiment IS NOT NULL AND vr.expected_sentiment IS NOT NULL
    """
    df = pd.read_sql_query(query, conn)
    conn.close()

    if df.empty:
        return {"status": "not_evaluated", "message": "No paired reference annotations found."}

    classes = ["Positive", "Negative", "Neutral", "Unclear"]
    total = len(df)
    correct = (df["pred"] == df["ground_truth"]).sum()
    accuracy = float(correct / total) if total > 0 else 0.0

    # Build confusion matrix
    matrix = {}
    for actual in classes:
        matrix[actual] = {}
        for pred in classes:
            cnt = len(df[(df["ground_truth"] == actual) & (df["pred"] == pred)])
            matrix[actual][pred] = cnt

    return {
        "status": "evaluated",
        "total_evaluated": total,
        "accuracy": accuracy,
        "confusion_matrix": matrix
    }

@app.post("/api/datasets/upload")
async def upload_dataset(file: UploadFile = File(...)):
    contents = await file.read()
    filename = file.filename.lower()
    
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        elif filename.endswith(".json"):
            df = pd.read_json(io.StringIO(contents.decode("utf-8")))
        else:
            raise HTTPException(status_code=400, detail="Only CSV and JSON datasets are supported.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    # Check required columns
    cols = [c.lower() for c in df.columns]
    if "id" not in cols:
        raise HTTPException(status_code=422, detail="Missing required column: 'id'")
    if "text" not in cols and "content" not in cols and "image_url" not in cols:
        raise HTTPException(status_code=422, detail="Missing required content column ('text' or 'image_url')")

    # Check duplicate IDs
    id_col = "id" if "id" in df.columns else [c for c in df.columns if c.lower() == "id"][0]
    duplicates = df[df.duplicated(subset=[id_col], keep=False)]
    if not duplicates.empty:
        dup_ids = duplicates[id_col].tolist()
        raise HTTPException(status_code=422, detail=f"Duplicate IDs detected in uploaded dataset: {dup_ids[:5]}")

    return {
        "status": "success",
        "filename": file.filename,
        "rows_count": len(df),
        "columns": list(df.columns)
    }
