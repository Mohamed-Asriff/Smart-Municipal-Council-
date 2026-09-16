import joblib

model = joblib.load(
    "../AI/models/priority_model.pkl"
)

vectorizer = joblib.load(
    "../AI/models/priority_vectorizer.pkl"
)

def predict_priority(complaint):

    vector = vectorizer.transform(
        [complaint]
    )

    prediction = model.predict(
        vector
    )

    return prediction[0]