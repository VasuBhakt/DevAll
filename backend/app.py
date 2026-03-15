from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from utils import APIException
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", None)],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from modules.auth import auth_router
from modules.profile import profile_router

app.include_router(auth_router)
app.include_router(profile_router)


@app.get("/")
async def root():
    return {"message": "API IS UP!"}


@app.exception_handler(APIException)
async def global_exception_handler(request: Request, exc: APIException):
    status = getattr(exc, "status", 500)
    message = getattr(exc, "message", "Internal Server Error")

    return JSONResponse(
        status_code=status,
        content={
            "success": False,
            "status": status,
            "message": message,
            "error_code": exc.error_code,
        },
    )
