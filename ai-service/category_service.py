import joblib
from pathlib import Path

THIS_DIR = Path(__file__).resolve().parent

# Check potential model directories
POSSIBLE_DIRS = [
    THIS_DIR / "models",
    THIS_DIR.parent / "models",
    THIS_DIR.parent.parent / "models",
]

MODELS_DIR = None
for d in POSSIBLE_DIRS:
    if (d / "category_model_v2.pkl").exists():
        MODELS_DIR = d
        break

if MODELS_DIR is None:
    MODELS_DIR = THIS_DIR / "models"

try:
    model = joblib.load(MODELS_DIR / "category_model_v2.pkl")
    vectorizer = joblib.load(MODELS_DIR / "tfidf_vectorizer_v2.pkl")
except Exception as e:
    model = None
    vectorizer = None
    print(f"[CATEGORY_SERVICE WARN] Could not load model: {e}")

def predict_category(complaint: str) -> str:
    if model is not None and vectorizer is not None:
        try:
            vector = vectorizer.transform([complaint])
            prediction = model.predict(vector)
            return str(prediction[0])
        except Exception:
            pass

    # Heuristic fallback based on keywords
    c = (complaint or "").lower()
    if any(k in c for k in ["water", "pipe", "tap", "leak", "drink"]):
        return "Water"
    if any(k in c for k in ["waste", "garbage", "trash", "dump", "bin"]):
        return "Waste"
    if any(k in c for k in ["road", "pothole", "street", "tar", "path"]):
        return "Road"
    if any(k in c for k in ["light", "lamp", "electric", "power", "wire"]):
        return "Electrical"
    if any(k in c for k in ["drain", "gutter", "canal", "sewer", "flood"]):
        return "Drainage"
    if any(k in c for k in ["bill", "tax", "payment", "rate", "fee"]):
        return "Billing"
    if any(k in c for k in ["boat", "fish", "harbour", "sea"]):
        return "Boat"
    return "Public"
