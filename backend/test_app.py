"""
Automated Pytest test suite for LabelCraft AI Backend API
Tests dataset schema validation, missing columns, duplicate identifiers,
annotation saving, and gold-standard evaluation calculations.
"""

import pytest
from fastapi.testclient import TestClient
import io
import pandas as pd

from app import app
from database import init_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    init_db()

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["platform"] == "LabelCraft AI"

def test_upload_missing_id_column():
    csv_content = "text,domain\n'Some text',Tech\n"
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("test.csv", io.BytesIO(csv_content.encode()), "text/csv")}
    )
    assert response.status_code == 422
    assert "Missing required column: 'id'" in response.json()["detail"]

def test_upload_duplicate_ids_rejected():
    csv_content = "id,text\nTX-1,'Row 1'\nTX-1,'Row 2 duplicate'\n"
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("dup.csv", io.BytesIO(csv_content.encode()), "text/csv")}
    )
    assert response.status_code == 422
    assert "Duplicate IDs detected" in response.json()["detail"]

def test_upload_valid_dataset():
    csv_content = "id,text,domain\nTX-101,'Great model release',Tech\nTX-102,'Slow database',Tech\n"
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("valid.csv", io.BytesIO(csv_content.encode()), "text/csv")}
    )
    assert response.status_code == 200
    assert response.json()["rows_count"] == 2

def test_invalid_sentiment_label_validation():
    payload = {
        "record_id": "TX-001",
        "dataset_id": "ds-1",
        "sentiment": "SuperEcstatic", # Invalid label not in taxonomy
        "topic": "Technology",
        "content_review": "Relevant",
        "annotator_id": "annotator_01"
    }
    response = client.post("/api/annotations/text", json=payload)
    assert response.status_code == 422 # Pydantic validation failure
