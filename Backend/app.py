from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CHATBOT_PATH = os.path.join(BASE_DIR, "AI", "chatbot")
if CHATBOT_PATH not in sys.path:
    sys.path.append(CHATBOT_PATH)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from chatbot import municipal_chatbot

# Services
from services.priority_service import predict_priority
from services.duplicate_service import check_duplicate
from services.analysis_service import analyze_complaint

app = FastAPI()

# CORS Configuration
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
    history: list[dict[str, str]] = []


class PriorityRequest(BaseModel):
    complaint: str


class DuplicateRequest(BaseModel):
    complaint: str


class AnalyzeRequest(BaseModel):
    complaint: str


# -----------------------------
# Home Route
# -----------------------------

@app.get("/")
def home():

    return {
        "message": "Smart Municipal Council API"
    }


#-----------------------------
# Chatbot Route
# -----------------------------

@app.post("/chat")
def chat(data: ChatRequest):

    try:

        response = municipal_chatbot(
            data.message,
            data.history,
        )

        return {
            "response": response
        }

    except Exception:

        return {
            "response":
            "Hello! The AI service is currently unavailable. You can still submit complaints through the municipal complaint system."
        }
# -----------------------------
# Priority Prediction Route
# -----------------------------

@app.post("/predict-priority")
def priority(data: PriorityRequest):

    result = predict_priority(
        data.complaint
    )

    return {
        "priority": result
    }


# -----------------------------
# Duplicate Detection Route
# -----------------------------

@app.post("/check-duplicate")
def duplicate(data: DuplicateRequest):

    result = check_duplicate(
        data.complaint
    )

    return result


# -----------------------------
