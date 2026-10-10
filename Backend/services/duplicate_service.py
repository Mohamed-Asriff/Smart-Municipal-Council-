import pandas as pd
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Absolute path, same fix as priority_service.py -- see that file's comment
# for why this matters.
THIS_DIR = Path(__file__).resolve().parent
DATA_PATH = THIS_DIR.parent.parent / "AI" / "data" / "processed" / "complaints_realistic_v2_2.csv"

df = pd.read_csv(DATA_PATH)

vectorizer = TfidfVectorizer(ngram_range=(1, 2))
X = vectorizer.fit_transform(df["complaint_text"])


def check_duplicate(complaint, threshold=0.60):
    complaint_vector = vectorizer.transform([complaint])
    scores = cosine_similarity(complaint_vector, X).flatten()

    best_idx = scores.argmax()
    best_score = float(scores[best_idx])

    return {
        "duplicate": best_score >= threshold,
        "similarity": round(best_score, 2),
        "matched_complaint": df.iloc[best_idx]["complaint_text"],
    }
