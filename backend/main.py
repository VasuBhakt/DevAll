from dotenv import load_dotenv
from contextlib import asynccontextmanager
import os
import sys
import uvicorn
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

load_dotenv()

from app import app
from database import engine

@asynccontextmanager
async def lifespan(app):
    try:
        with engine.connect() as connection:
            logger.info("Successfully connected to NeonDB!")
        yield
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise e

app.router.lifespan_context = lifespan

if __name__ == "__main__":
    port = int(os.getenv("PORT", 4000))
    logger.info(f"Server running on port {port}")
    uvicorn.run(
        "main:app",
        host="localhost",
        port=port,
        reload=True,
        log_level="info"
    )


    