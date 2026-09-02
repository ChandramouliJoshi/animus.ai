from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


@app.post("/predict")
def predict(transaction: TransactionRequest):

    transaction_data = transaction.model_dump()

    prediction = predict_transaction(transaction_data)

    explanations = explain_transaction(transaction_data)

    return {
        **prediction,
        "explanations": explanations
    }