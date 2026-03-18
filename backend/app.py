from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from utils import APIException
from utils.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", None)],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from modules.auth import auth_router
from modules.profile import profile_router
from modules.achievements import achievement_router
from modules.experiences import experience_router
from modules.projects import project_router
from modules.public import public_router
from modules.cp_profile.controller import cp_profile_router

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(achievement_router)
app.include_router(experience_router)
app.include_router(project_router)
app.include_router(public_router)
app.include_router(cp_profile_router)


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
