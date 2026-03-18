import os
from slowapi import Limiter
from slowapi.util import get_remote_address
from dotenv import load_dotenv

load_dotenv()

# Build Redis URL for Limiter
# Format: redis://[:password]@host:port/db or rediss:// for SSL
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")
REDIS_USERNAME = os.getenv("REDIS_USERNAME")

# Cloud providers usually need rediss:// (SSL)
protocol = "rediss" if os.getenv("REDIS_SSL", "true").lower() == "true" else "redis"

if REDIS_PASSWORD:
    if REDIS_USERNAME:
        storage_uri = f"{protocol}://{REDIS_USERNAME}:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}"
    else:
        storage_uri = f"{protocol}://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}"
else:
    storage_uri = f"{protocol}://{REDIS_HOST}:{REDIS_PORT}"

# Create the limiter instance
# Using Redis as storage ensure rate limits persist and work across workers
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=storage_uri,
    strategy="fixed-window"
)
