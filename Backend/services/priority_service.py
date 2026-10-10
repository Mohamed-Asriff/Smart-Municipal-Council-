import joblib
from pathlib import Path

# Absolute path, built from this file's own location -- works no matter
# which folder you launch the server from. The old version used
# "../AI/models/..." which only worked if you ran uvicorn from one exact
# directory (Backend/), and silently broke (FileNotFoundError) otherwise.
THIS_DIR = Path(__file__).resolve().parent
MODELS_DIR = THIS_DIR.parent.parent / "AI" / "models"

model = joblib.load(MODELS_DIR / "priority_model.pkl")
vectorizer = joblib.load(MODELS_DIR / "priority_vectorizer.pkl")


def predict_priority(complaint):
    vector = vectorizer.transform([complaint])
    prediction = model.predict(vector)
    return prediction[0]
