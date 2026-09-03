import sys
import os

sys.path.append(
    os.path.abspath("AI")
)

from src.preprocessing.text_cleaner import clean_text

df["clean_text"] = df["complaint_text"].apply(clean_text)

df[
    ["complaint_text", "clean_text"]
].head(10)