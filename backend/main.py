from pathlib import Path

import joblib
import pandas as pd

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from backend.models import Transaction


# =========================================================
# PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"


# =========================================================
# FIND MODEL
# =========================================================

MODEL_CANDIDATES = [
    BASE_DIR / "ml" / "risk_model.pkl",
    BASE_DIR / "ml " / "risk_model.pkl",
    BASE_DIR / "risk_model.pkl",
]


MODEL_PATH = None

for candidate in MODEL_CANDIDATES:
    if candidate.exists():
        MODEL_PATH = candidate
        break


# =========================================================
# LOAD MODEL
# =========================================================

model = None

if MODEL_PATH is not None:
    model = joblib.load(MODEL_PATH)


# =========================================================
# FASTAPI
# =========================================================

app = FastAPI(
    title="RiskMind AI",
    description="AI Risk Intelligence Copilot",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ROOT
# =========================================================

@app.get("/api")
def api_home():
    return {
        "message": "RiskMind AI Backend is running",
        "status": "success"
    }


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
def health_check():

    return {
        "server": "online",
        "ai_system": "ready",
        "ml_engine": "loaded" if model else "model_not_found",
        "model_path": str(MODEL_PATH) if MODEL_PATH else None,
        "frontend": FRONTEND_DIST.exists(),
        "version": "1.0"
    }


# =========================================================
# ANALYZE TRANSACTION
# =========================================================

@app.post("/analyze")
def analyze_transaction(transaction: Transaction):

    if model is None:
        return {
            "error": "Risk model file was not found."
        }


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


    prediction = model.predict(data)[0]

    probability = model.predict_proba(data)[0][1]

    probability = float(probability)

    risk_score = round(probability * 100)


    # =====================================================
    # RISK LEVEL
    # =====================================================

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


    # =====================================================
    # RISK FACTORS
    # =====================================================

    reasons = []


    if transaction.amount >= 10000:

        reasons.append(
            "High transaction amount"
        )


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


    # =====================================================
    # RESPONSE
    # =====================================================

    return {
        "prediction": int(prediction),
        "risk_score": risk_score,
        "risk_level": risk_level,
        "fraud_probability": round(probability, 4),
        "alert": alert,
        "recommended_action": recommended_action,
        "reasons": reasons
    }


# =========================================================
# SERVE REACT FRONTEND
# =========================================================

@app.get("/")
async def serve_frontend():

    index_file = FRONTEND_DIST / "index.html"

    if index_file.exists():
        return FileResponse(index_file)

    return {
        "message": "RiskMind AI API is running",
        "status": "frontend build not found"
    }


# =========================================================
# FRONTEND FALLBACK
# =========================================================

@app.get("/{path:path}")
async def frontend_routes(path: str):

    if path in ["api", "health"]:
        return {"error": "Not Found"}


    requested_file = FRONTEND_DIST / path

    if requested_file.is_file():
        return FileResponse(requested_file)


    index_file = FRONTEND_DIST / "index.html"

    if index_file.exists():
        return FileResponse(index_file)


    return {
        "message": "RiskMind AI",
        "status": "frontend build not found"
    }
