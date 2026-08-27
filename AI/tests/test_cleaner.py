import sys
import os

sys.path.append(
    os.path.abspath("AI")
)

from src.preprocessing.text_cleaner import clean_text

sample = "Water Leakage Near School!!!"

print(clean_text(sample))