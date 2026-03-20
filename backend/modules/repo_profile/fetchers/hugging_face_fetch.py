import asyncio
import logging
import time
import httpx
from pydantic import BaseModel, Field, ConfigDict
from utils import APIException
from typing import List, Optional

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


async def _throttle_hf_request(redis_client, cooldown=1.0):
    """Distributed throttle using Redis to space out requests globally."""
    if not redis_client:
        return

    key = "hf_global_last_request"
    while True:
        last_request = await redis_client.get(key)
        now = time.time()

        if last_request:
            elapsed = now - float(last_request)
            if elapsed < cooldown:
                wait_time = cooldown - elapsed
                logger.info(f"Throttling: Spacing out Hugging Face requests by {wait_time:.2f}s")
                await asyncio.sleep(wait_time)
                continue

        # Atomic set to update the last request time
        await redis_client.set(key, str(time.time()))
        break


class HFModel(BaseModel):
    id: str
    name: str
    likes: int
    downloads: int = 0
    pipeline_tag: Optional[str] = None
    last_modified: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class HFSpace(BaseModel):
    id: str
    name: str
    likes: int
    sdk: Optional[str] = None
    last_modified: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class HFDataset(BaseModel):
    id: str
    name: str
    likes: int
    downloads: int = 0
    last_modified: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class HuggingFaceProfile(BaseModel):
    handle: str
    profile_link: str
    followers_count: int = 0
    likes_count: int = Field(0, description="Total likes across all resources")
    public_repo_count: int = 0
    models: List[HFModel] = []
    spaces: List[HFSpace] = []
    datasets: List[HFDataset] = []

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


HF_API_BASE = "https://huggingface.co/api/users/"


async def fetch_hugging_face_profile(handle: str, redis_client=None):
    if not redis_client:
        return await _fetch_hf_raw(handle)

    # Distributed Lock: Ensures ONLY ONE handle is being fetched from HF at any moment
    async with redis_client.lock("hf_global_fetch_lock", timeout=15):
        try:
            # 1. Wait for global HF cooldown (1 second)
            await _throttle_hf_request(redis_client)
            return await _fetch_hf_raw(handle)
        except Exception as e:
            logger.error(f"Failed to fetch Hugging Face profile: {str(e)}")
            raise APIException(
                status=400,
                message=f"Failed to fetch Hugging Face profile: {str(e)}",
                error_code="FAILED_REQUEST",
            )


async def _fetch_hf_raw(handle: str):
    user_url = f"{HF_API_BASE}{handle}/overview" # HF uses /overview for more detail
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            # Hugging Face usually doesn't require a token for public stats,
            # but we use a User-Agent for safety.
            response = await client.get(
                user_url,
                headers={"User-Agent": "DevAll-Backend"}
            )

            if response.status_code == 404:
                raise APIException(
                    status=404,
                    message="Hugging Face user not found",
                    error_code="NOT_FOUND",
                )
            
            if response.status_code != 200:
                raise APIException(
                    status=400,
                    message="Failed to connect to Hugging Face",
                    error_code="FAILED_REQUEST",
                )

            data = response.json()
            
            # Extract basic stats
            followers = data.get("numFollowers", 0)
            # HF might not give total likes in a simple field, we'll sum them if needed
            total_likes = 0
            
            # 1. Models
            models_list = []
            for m in data.get("models", []):
                hfm = HFModel(
                    id=m.get("id"),
                    name=m.get("id", "").split("/")[-1],
                    likes=m.get("likes", 0),
                    downloads=m.get("downloads", 0),
                    pipeline_tag=m.get("pipeline_tag"),
                    last_modified=m.get("lastModified"),
                )
                models_list.append(hfm)
                total_likes += hfm.likes

            # 2. Spaces
            spaces_list = []
            for s in data.get("spaces", []):
                hfs = HFSpace(
                    id=s.get("id"),
                    name=s.get("id", "").split("/")[-1],
                    likes=s.get("likes", 0),
                    sdk=s.get("sdk"),
                    last_modified=s.get("lastModified"),
                )
                spaces_list.append(hfs)
                total_likes += hfs.likes

            # 3. Datasets
            datasets_list = []
            for d in data.get("datasets", []):
                hfd = HFDataset(
                    id=d.get("id"),
                    name=d.get("id", "").split("/")[-1],
                    likes=d.get("likes", 0),
                    downloads=d.get("downloads", 0),
                    last_modified=d.get("lastModified"),
                )
                datasets_list.append(hfd)
                total_likes += hfd.likes

            total_public_items = len(models_list) + len(spaces_list) + len(datasets_list)

            return HuggingFaceProfile(
                handle=handle,
                profile_link=f"https://huggingface.co/{handle}",
                followers_count=followers,
                likes_count=total_likes,
                public_repo_count=total_public_items,
                models=models_list,
                spaces=spaces_list,
                datasets=datasets_list
            )

        except APIException:
            raise
        except Exception as e:
            logger.error(f"Hugging Face fetch error: {str(e)}")
            raise APIException(
                status=400,
                message=f"Failed to fetch Hugging Face profile: {str(e)}",
                error_code="FAILED_REQUEST",
            )
