from pydantic import BaseModel, EmailStr


# =========================================================
# SIGNUP
# =========================================================


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class SignupResponse(BaseModel):
    message: str
    user_id: int
    name: str
    email: str


# =========================================================
# LOGIN
# =========================================================


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    message: str
    access_token: str
    token_type: str
    user_id: int
    name: str
    email: str