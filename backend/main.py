from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from backend.models import Transaction
from ml.risk_model import predict_risk


# =========================================================
# PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"


# =========================================================
# APP
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
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ROOT / API
# =========================================================

@app.get("/api")
def api_home():
    return {
        "message": "RiskMind AI Backend is running",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "server": "online",
        "ai_system": "ready",
        "ml_engine": "loaded",
        "frontend": FRONTEND_DIST.exists(),
        "version": "1.0"
    }


# =========================================================
# TRANSACTION ANALYSIS
# =========================================================

@app.post("/analyze")
def analyze_transaction(transaction: Transaction):

    result = predict_risk(transaction)

    probability = result["fraud_probability"]

    risk_score = round(probability * 100)


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
    # EXPLAINABLE RISK FACTORS
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
        "risk_score": risk_score,
        "risk_level": risk_level,
        "fraud_probability": probability,
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
# REACT ROUTING FALLBACK
# =========================================================

@app.get("/{path:path}")
async def frontend_routes(path: str):

    # Never interfere with API endpoints
    if path.startswith("analyze"):
        return {
            "error": "Not Found"
        }

    if path.startswith("health"):
        return {
            "error": "Not Found"
        }

    requested_file = FRONTEND_DIST / path

    # Serve actual frontend assets/files
    if requested_file.is_file():

        return FileResponse(requested_file)

    # For React routes, return index.html
    index_file = FRONTEND_DIST / "index.html"

    if index_file.exists():

        return FileResponse(index_file)

    return {
        "message": "RiskMind AI",
        "status": "frontend build not found"
    }
