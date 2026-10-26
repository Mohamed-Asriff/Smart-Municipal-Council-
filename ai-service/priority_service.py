import joblib
from pathlib import Path

THIS_DIR = Path(__file__).resolve().parent

POSSIBLE_DIRS = [
    THIS_DIR / "models",
    THIS_DIR.parent / "models",
    THIS_DIR.parent.parent / "models",
]

MODELS_DIR = None
for d in POSSIBLE_DIRS:
    if (d / "priority_model.pkl").exists():
        MODELS_DIR = d
        break

if MODELS_DIR is None:
    MODELS_DIR = THIS_DIR / "models"

try:
    model = joblib.load(MODELS_DIR / "priority_model.pkl")
    vectorizer = joblib.load(MODELS_DIR / "priority_vectorizer.pkl")
except Exception as e:
    model = None
    vectorizer = None
    print(f"[PRIORITY_SERVICE WARN] Could not load model: {e}")

def predict_priority(complaint: str) -> str:
    if model is not None and vectorizer is not None:
        try:
            vector = vectorizer.transform([complaint])
            prediction = model.predict(vector)
            return str(prediction[0])
        except Exception:
            pass

    # Heuristic fallback
    c = (complaint or "").lower()
    if any(k in c for k in ["danger", "emergency", "flood", "fire", "burst", "electric shock", "fallen tree", "block", "urgent"]):
        return "High"
    if any(k in c for k in ["leak", "overflow", "garbage", "dark", "delay", "broken"]):
        return "Medium"
    return "Low"
