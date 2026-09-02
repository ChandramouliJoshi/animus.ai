from fastapi import FastAPI

from app.schemas.transaction import TransactionRequest
from app.services.fraud_detector import (
    predict_transaction,
    explain_transaction
)


app = FastAPI(
    title="Animus AI",
    description="AI-powered fraud detection and risk management API",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "service": "Animus AI",
        "status": "online"
    }


@app.post("/predict")
def predict(transaction: TransactionRequest):

    transaction_data = transaction.model_dump()

    prediction = predict_transaction(transaction_data)

    explanations = explain_transaction(transaction_data)

    return {
        **prediction,
        "explanations": explanations
    }