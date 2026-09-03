from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas.transaction import TransactionRequest
from app.services.fraud_detector import (
    predict_transaction,
    explain_transaction
)
from app.db.database import (
    initialize_database,
    get_transactions,
    save_transaction
)


initialize_database()


app = FastAPI(
    title="Animus AI",
    description="AI-powered fraud detection and risk management API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "service": "Animus AI",
        "status": "online"
    }


@app.get("/transactions")
def transactions():
    return get_transactions(limit=10)


@app.post("/predict")
def predict(transaction: TransactionRequest):

    transaction_data = transaction.model_dump()

    prediction = predict_transaction(transaction_data)

    explanations = explain_transaction(transaction_data)

    transaction_id = save_transaction(
        created_at=datetime.now(timezone.utc).isoformat(),
        amount=transaction_data["TX_AMOUNT"],
        risk_score=prediction["risk_score"],
        risk_score_percentage=prediction["risk_score_percentage"],
        risk_level=prediction["risk_level"],
        decision=prediction["decision"],
    )

    return {
        **prediction,
        "transaction_id": transaction_id,
        "explanations": explanations
    }