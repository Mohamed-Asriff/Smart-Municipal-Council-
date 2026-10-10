import joblib
from pathlib import Path

# Same absolute-path fix as the other services.
THIS_DIR = Path(__file__).resolve().parent
MODELS_DIR = THIS_DIR.parent.parent / "AI" / "models"

# Using the v2 model + its matching vectorizer -- these must always be
# loaded as a pair, since a vectorizer trained separately from its model
# will produce numbers the model was never trained to understand.
model = joblib.load(MODELS_DIR / "category_model_v2.pkl")
vectorizer = joblib.load(MODELS_DIR / "tfidf_vectorizer_v2.pkl")


def predict_category(complaint):
    vector = vectorizer.transform([complaint])
    prediction = model.predict(vector)
    return prediction[0]
