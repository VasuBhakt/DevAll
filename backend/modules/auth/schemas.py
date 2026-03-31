from pydantic import BaseModel
from utils import UserDetails


class SignupRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: str


class SigninRequest(BaseModel):
    identifier: str
    password: str


class Token(BaseModel):
    raw_token: str
    hashed_token: str


class JWTTokens(BaseModel):
    access_token: str
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    new_password: str


class SigninResponse(BaseModel):
    tokens: JWTTokens
    user_details: UserDetails
