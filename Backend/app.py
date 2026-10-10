from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

import sys
from pathlib import Path

# Absolute path fix: build the path from this file's own location
THIS_DIR = Path(__file__).resolve().parent
CHATBOT_DIR = THIS_DIR.parent / "AI" / "chatbot"
sys.path.append(str(CHATBOT_DIR))

from chatbot import municipal_chatbot

# Services
from services.priority_service import predict_priority
from services.category_service import predict_category
from services.duplicate_service import check_duplicate
from services.analysis_service import analyze_complaint

# Database
from database.db import (
    save_complaint,
    get_all_complaints,
    get_complaint_by_tracking_id,
    update_complaint_status
)

app = FastAPI(title="Kalmunai Municipal Council API", version="2.0.0")

# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Request Models
# -----------------------------

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"
    history: list[dict] | None = None

class PriorityRequest(BaseModel):
    complaint: str

class CategoryRequest(BaseModel):
    complaint: str

class DuplicateRequest(BaseModel):
    complaint: str

class AnalyzeRequest(BaseModel):
    complaint: str

class ComplaintSubmissionRequest(BaseModel):
    description: str
    location: str
    citizen_name: Optional[str] = "Citizen"
    contact_number: Optional[str] = ""

class StatusUpdateRequest(BaseModel):
    status: str

# -----------------------------
# Home Route
# -----------------------------

@app.get("/")
def home():
    return {
        "message": "Kalmunai Municipal Council API",
        "status": "online",
        "version": "2.0.0"
    }

# -----------------------------
# Chatbot Route
# -----------------------------

@app.post("/chat")
def chat(data: ChatRequest):
    try:
        result = municipal_chatbot(
            data.message,
            session_id=data.session_id,
            history=data.history,
        )

        if isinstance(result, dict):
            reply = result.get("reply") or result.get("response")
            if reply:
                return {
                    "reply": reply,
                    "response": reply,
                    "complaint_filed": result.get("complaint_filed", False),
                    "complaint": result.get("complaint"),
                }

        return {
            "reply": "Welcome to the Kalmunai Municipal Council AI Assistant. How may I help you today?",
            "response": "Welcome to the Kalmunai Municipal Council AI Assistant. How may I help you today?",
            "complaint_filed": False,
            "complaint": None,
        }
    except Exception as e:
        return {
            "reply": "Welcome to the Kalmunai Municipal Council AI Assistant. Please describe your issue and location.",
            "response": "Welcome to the Kalmunai Municipal Council AI Assistant. Please describe your issue and location.",
            "complaint_filed": False,
            "complaint": None,
        }

# -----------------------------
# Priority Prediction Route
# -----------------------------

@app.post("/predict-priority")
def priority(data: PriorityRequest):
    result = predict_priority(data.complaint)
    return {"priority": result}

# -----------------------------
# Category Prediction Route
# -----------------------------

@app.post("/predict-category")
def category(data: CategoryRequest):
    result = predict_category(data.complaint)
    return {"category": result}

# -----------------------------
# Duplicate Detection Route
# -----------------------------

@app.post("/check-duplicate")
def duplicate(data: DuplicateRequest):
    result = check_duplicate(data.complaint)
    return result

# -----------------------------
# Combined AI Route
# -----------------------------

@app.post("/analyze-complaint")
def analyze(data: AnalyzeRequest):
    return analyze_complaint(data.complaint)

# -----------------------------
# Complaint Management Endpoints
# -----------------------------

@app.post("/complaints")
def create_complaint(data: ComplaintSubmissionRequest):
    """Submits a new complaint, runs AI models for classification, duplicate checking, and persists to DB."""
    if not data.description.strip() or not data.location.strip():
        raise HTTPException(status_code=400, detail="Description and location are required.")

    # 1. AI Analysis
    analysis = analyze_complaint(data.description)
    category_val = analysis.get("category", "General")
    priority_val = analysis.get("priority", "MEDIUM")
    is_dup = analysis.get("duplicate", False)
    sim = analysis.get("similarity", 0.0)
    matched = analysis.get("matched_complaint", "")

    # 2. Save to SQLite DB
    record = save_complaint(
        description=data.description,
        location=data.location,
        category=category_val,
        priority=priority_val,
        citizen_name=data.citizen_name or "Citizen",
        contact_number=data.contact_number or "",
        is_duplicate=is_dup,
        similarity=sim,
        matched_complaint=matched
    )

    return {
        "success": True,
        "message": f"Complaint registered successfully under Reference ID: {record['tracking_id']}",
        "complaint": record
    }

@app.get("/complaints")
def list_complaints(
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    """Retrieves all filed complaints with optional filtering."""
    records = get_all_complaints(category_filter=category, priority_filter=priority, status_filter=status)
    return {
        "count": len(records),
        "complaints": records
    }

@app.get("/complaints/{tracking_id}")
def get_complaint(tracking_id: str):
    """Fetches details of a complaint by its unique tracking reference ID."""
    record = get_complaint_by_tracking_id(tracking_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"No complaint found with Tracking ID: {tracking_id}")
    return record

@app.patch("/complaints/{tracking_id}/status")
def update_status(tracking_id: str, data: StatusUpdateRequest):
    """Updates status for a specific complaint."""
    valid_statuses = ["Recorded", "In Progress", "Pending Inspection", "Resolved", "Rejected"]
    if data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    success = update_complaint_status(tracking_id, data.status)
    if not success:
        raise HTTPException(status_code=404, detail=f"Complaint {tracking_id} not found.")

    return {
        "success": True,
        "message": f"Status for complaint {tracking_id} updated to '{data.status}'",
        "tracking_id": tracking_id,
        "new_status": data.status
    }

