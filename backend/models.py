from pathlib import Path

import joblib
import pandas as pd


# =========================================================
# MODEL PATH
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "ml" / "risk_model.pkl"


# =========================================================
# LOAD MODEL
# =========================================================

if not MODEL_PATH.exists():

    raise FileNotFoundError(
        f"Risk model not found at: {MODEL_PATH}"
    )


model = joblib.load(MODEL_PATH)


# =========================================================
# PREDICTION
# =========================================================

def predict_risk(transaction):

    data = pd.DataFrame(
        [
            {
                "amount": transaction.amount,

                "location": transaction.location,

                "transactions_last_hour":
                    transaction.transactions_last_hour,

                "is_new_device":
                    int(transaction.is_new_device),

                "is_new_location":
                    int(transaction.is_new_location),
            }
        ]
    )


    prediction = model.predict(data)[0]

    probability = model.predict_proba(data)[0][1]


    return {
        "prediction": int(prediction),

        "fraud_probability":
            round(float(probability), 4)
    }
