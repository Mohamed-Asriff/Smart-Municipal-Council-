import os
from pathlib import Path
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
import joblib

THIS_DIR = Path(__file__).resolve().parent
CSV_PATH = THIS_DIR / "clean_complaints.csv"
if not CSV_PATH.exists():
    CSV_PATH = THIS_DIR / "complaints_realistic_v2_2.csv"

df = pd.read_csv(CSV_PATH)
text_col = "clean_text" if "clean_text" in df.columns else "complaint_text"

print(f"Training on {len(df)} samples from {CSV_PATH.name}...")

# 1. Train Category Model
cat_vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=5000)
X_cat = cat_vectorizer.fit_transform(df[text_col].fillna(""))
cat_model = LogisticRegression(max_iter=1000)
cat_model.fit(X_cat, df["category"])

# 2. Train Priority Model
prio_vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=5000)
X_prio = prio_vectorizer.fit_transform(df[text_col].fillna(""))
prio_model = LogisticRegression(max_iter=1000)
prio_model.fit(X_prio, df["priority"])

# Output directories
target_dirs = [
    THIS_DIR / "models",
    THIS_DIR.parent / "models"
]

for d in target_dirs:
    d.mkdir(parents=True, exist_ok=True)
    joblib.dump(cat_model, d / "category_model_v2.pkl")
    joblib.dump(cat_vectorizer, d / "tfidf_vectorizer_v2.pkl")
    joblib.dump(prio_model, d / "priority_model.pkl")
    joblib.dump(prio_vectorizer, d / "priority_vectorizer.pkl")
    print(f"Saved models to {d}")

# Quick sanity test
test_text = "Fallen tree blocking beach road near post office"
cat = cat_model.predict(cat_vectorizer.transform([test_text]))[0]
prio = prio_model.predict(prio_vectorizer.transform([test_text]))[0]
print(f"Sanity test: '{test_text}' -> Category: {cat}, Priority: {prio}")
