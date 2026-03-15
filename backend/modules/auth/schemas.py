from pydantic import BaseModel


class AuthRequest(BaseModel):
    email: str
    username: str


class SignupRequest(AuthRequest):
    password: str


class SigninRequest(BaseModel):
    identifier: str
    password: str


class Token(BaseModel):
    raw_token: str
    hashed_token: str


class JWTTokens(BaseModel):
    access_token: str
    refresh_token: str


class ForgetPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    new_password: str
