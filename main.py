from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.models import Transaction
from ml.risk_model import predict_risk


app = FastAPI(
    title="RiskMind AI",
    description="AI Risk Intelligence Copilot",
    version="1.0.0"
)


# =========================
# CORS CONFIGURATION
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# ROOT
# =========================

@app.get("/")
def home():
    return {
        "message": "RiskMind AI Backend is running",
        "status": "success"
    }


# =========================
# HEALTH CHECK
# =========================

@app.get("/health")
def health_check():
    return {
        "server": "online",
        "ai_system": "ready",
        "ml_engine": "loaded",
        "version": "1.0"
    }


# =========================
# TRANSACTION ANALYSIS
# =========================

@app.post("/analyze")
def analyze_transaction(transaction: Transaction):

    # ML prediction
    result = predict_risk(transaction)

    probability = result["fraud_probability"]

    # Convert probability to score 0-100
    risk_score = round(probability * 100)

    # Determine risk level
    if risk_score >= 70:
        risk_level = "HIGH"
        alert = True
        recommended_action = "BLOCK_TRANSACTION"

    elif risk_score >= 40:
        risk_level = "MEDIUM"
        alert = True
        recommended_action = "REVIEW_TRANSACTION"

    else:
        risk_level = "LOW"
        alert = False
        recommended_action = "ALLOW_TRANSACTION"


    # =========================
    # EXPLAINABLE RISK FACTORS
    # =========================

    reasons = []

    if transaction.amount >= 10000:
        reasons.append("High transaction amount")

    if transaction.transactions_last_hour >= 5:
        reasons.append(
            "Unusually high transaction frequency"
        )

    if transaction.is_new_device:
        reasons.append(
            "New device detected"
        )

    if transaction.is_new_location:
        reasons.append(
            "New location detected"
        )

    if not reasons:
        reasons.append(
            "No major risk indicators detected"
        )


    # =========================
    # RESPONSE
    # =========================

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "fraud_probability": probability,
        "alert": alert,
        "recommended_action": recommended_action,
        "reasons": reasons
    }