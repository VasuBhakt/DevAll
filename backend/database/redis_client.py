import redis.asyncio as redis
import os
from dotenv import load_dotenv

load_dotenv()

is_ssl = (
    os.getenv("REDIS_SSL", "false").lower() in ("true", "1", "yes")
    or "upstash.io" in (os.getenv("REDIS_HOST") or "")
)

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    decode_responses=True,
    username=os.getenv("REDIS_USERNAME", "default"),
    password=os.getenv("REDIS_PASSWORD"),
    ssl=is_ssl,
)


async def get_redis():
    return redis_client
