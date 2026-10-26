import pandas as pd
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

THIS_DIR = Path(__file__).resolve().parent

POSSIBLE_PATHS = [
    THIS_DIR / "complaints_realistic_v2_2.csv",
    THIS_DIR / "clean_complaints.csv",
    THIS_DIR.parent / "complaints_realistic_v2_2.csv",
    THIS_DIR.parent / "clean_complaints.csv",
]

df = None
for p in POSSIBLE_PATHS:
    if p.exists():
        try:
            df = pd.read_csv(p)
            break
        except Exception:
            continue

if df is not None and "complaint_text" in df.columns:
    try:
        vectorizer = TfidfVectorizer(ngram_range=(1, 2))
        X = vectorizer.fit_transform(df["complaint_text"].fillna(""))
    except Exception:
        vectorizer = None
        X = None
else:
    vectorizer = None
    X = None

def check_duplicate(complaint: str, threshold: float = 0.60):
    if vectorizer is None or X is None or df is None or len(df) == 0:
        return {
            "duplicate": False,
            "similarity": 0.0,
            "matched_complaint": "",
        }

    try:
        complaint_vector = vectorizer.transform([complaint])
        scores = cosine_similarity(complaint_vector, X).flatten()

        best_idx = scores.argmax()
        best_score = float(scores[best_idx])

        return {
            "duplicate": best_score >= threshold,
            "similarity": round(best_score, 2),
            "matched_complaint": str(df.iloc[best_idx]["complaint_text"]),
        }
    except Exception:
        return {
            "duplicate": False,
            "similarity": 0.0,
            "matched_complaint": "",
        }
