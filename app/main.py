from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware

from app.schemas.transaction import TransactionRequest
from app.schemas.auth import (
    SignupRequest,
    SignupResponse,
    LoginRequest,
    LoginResponse
)

from app.services.fraud_detector import (
    predict_transaction,
    explain_transaction
)

from app.db.database import (
    initialize_database,
    get_transactions,
    save_transaction,
    get_analytics,
    create_user,
    get_user_by_email,
)

from app.utils.auth import (
    hash_password,
    verify_password
)

from app.utils.jwt import (
    create_access_token,
    decode_access_token
)


# =========================
# AUTHENTICATION
# =========================

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    return payload


# =========================
# DATABASE
# =========================

initialize_database()


# =========================
# FASTAPI APP
# =========================

app = FastAPI(
    title="Animus AI",
    description="AI-powered fraud detection and risk management API",
    version="1.0.0"
)


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# ROOT
# =========================

@app.get("/")
def root():
    return {
        "service": "Animus AI",
        "status": "online"
    }


# =========================
# TRANSACTIONS
# =========================

@app.get("/transactions")
def transactions(
    current_user=Depends(get_current_user),
):
    user_id = int(current_user["sub"])

    return get_transactions(
        user_id=user_id,
        limit=10,
    )


# =========================
# ANALYTICS
# =========================

@app.get("/analytics")
def analytics(
    current_user=Depends(get_current_user),
):
    user_id = int(current_user["sub"])

    return get_analytics(
        user_id=user_id,
    )


# =========================
# AUTHENTICATION
# =========================

@app.post("/auth/signup", response_model=SignupResponse)
def signup(request: SignupRequest):

    existing_user = get_user_by_email(request.email)

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists."
        )

    password_hash = hash_password(request.password)

    user_id = create_user(
        name=request.name.strip(),
        email=request.email.lower(),
        password_hash=password_hash,
        created_at=datetime.now(timezone.utc).isoformat(),
    )

    return {
        "message": "Account created successfully.",
        "user_id": user_id,
        "name": request.name.strip(),
        "email": request.email.lower(),
    }


@app.post("/auth/login", response_model=LoginResponse)
def login(request: LoginRequest):

    user = get_user_by_email(request.email)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    password_valid = verify_password(
        request.password,
        user["password_hash"]
    )

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    access_token = create_access_token(
        user_id=user["id"],
        email=user["email"]
    )

    return {
        "message": "Login successful.",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user["id"],
        "name": user["name"],
        "email": user["email"],
    }


@app.get("/auth/me")
def get_me(
    current_user=Depends(get_current_user)
):
    return {
        "user_id": int(current_user["sub"]),
        "email": current_user["email"],
    }


# =========================
# FRAUD PREDICTION
# =========================

@app.post("/predict")
def predict(
    transaction: TransactionRequest,
    current_user=Depends(get_current_user),
):

    transaction_data = transaction.model_dump()

    prediction = predict_transaction(
        transaction_data
    )

    explanations = explain_transaction(
        transaction_data
    )

    user_id = int(current_user["sub"])

    transaction_id = save_transaction(
        user_id=user_id,
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