import joblib
import pandas as pd


MODEL_PATH = "ml/risk_model.pkl"


# Load trained ML model
model = joblib.load(MODEL_PATH)


def predict_risk(transaction):

    data = pd.DataFrame([
        {
            "amount": transaction.amount,
            "location": transaction.location,
            "transactions_last_hour":
                transaction.transactions_last_hour,
            "is_new_device":
                int(transaction.is_new_device),
            "is_new_location":
                int(transaction.is_new_location)
        }
    ])

    # Prediction
    prediction = model.predict(data)[0]

    # Fraud probability
    probability = model.predict_proba(data)[0][1]

    return {
        "prediction": int(prediction),
        "fraud_probability": round(
            float(probability),
            4
        )
    }
