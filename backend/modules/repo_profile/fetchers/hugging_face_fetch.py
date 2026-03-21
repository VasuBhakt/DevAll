import asyncio
import logging
import time
import httpx
from pydantic import BaseModel, Field, ConfigDict
from utils import APIException
from typing import List, Optional
from dotenv import load_dotenv
import os

load_dotenv()

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
                logger.info(
                    f"Throttling: Spacing out Hugging Face requests by {wait_time:.2f}s"
                )
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

    model_config = ConfigDict(from_attributes=True)


class HFSpace(BaseModel):
    id: str
    name: str
    likes: int
    sdk: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class HFDataset(BaseModel):
    id: str
    name: str
    likes: int
    downloads: int = 0

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


HF_API_BASE = "https://huggingface.co/api"


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

    headers = {
        "User-Agent": "DevAll-Backend",
        "Authorization": f"Bearer {os.getenv('HUGGING_FACE_ACCESS_TOKEN')}",
    }

    # Endpoints as per Hugging Face REST API
    # We fetch the top 6 of each resource type sorted by likes (standard 'top' metric)
    urls = {
        "user": f"{HF_API_BASE}/users/{handle}/overview",
        "models": f"{HF_API_BASE}/models?author={handle}&sort=likes&direction=-1&limit=6",
        "datasets": f"{HF_API_BASE}/datasets?author={handle}&sort=likes&direction=-1&limit=6",
        "spaces": f"{HF_API_BASE}/spaces?author={handle}&sort=likes&direction=-1&limit=6",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # 1. Fetch all concurrently
            keys = ["user", "models", "datasets", "spaces"]
            fetch_tasks = [client.get(urls[k], headers=headers) for k in keys]
            responses = await asyncio.gather(*fetch_tasks, return_exceptions=True)

            # Map responses back to keys
            results = dict(zip(keys, responses))

            # 2. Check for user existence
            user_resp = results["user"]
            if isinstance(user_resp, Exception):
                raise APIException(
                    status=400,
                    message=f"Failed to connect to Hugging Face: {str(user_resp)}",
                    error_code="FAILED_REQUEST",
                )

            if user_resp.status_code == 404:
                raise APIException(
                    status=404,
                    message="Hugging Face user not found",
                    error_code="NOT_FOUND",
                )

            if user_resp.status_code != 200:
                raise APIException(
                    status=400,
                    message="Failed to fetch Hugging Face user overview",
                    error_code="FAILED_REQUEST",
                )

            user_data = user_resp.json()

            # 3. Process Models (Top 6)
            models_list = []
            m_resp = results["models"]
            if not isinstance(m_resp, Exception) and m_resp.status_code == 200:
                for m in m_resp.json():
                    models_list.append(
                        HFModel(
                            id=m.get("id"),
                            name=m.get("id", "").split("/")[-1],
                            likes=m.get("likes", 0),
                            downloads=m.get("downloads", 0),
                            pipeline_tag=m.get("pipeline_tag"),
                        )
                    )

            # 4. Process Datasets (Top 6)
            datasets_list = []
            d_resp = results["datasets"]
            if not isinstance(d_resp, Exception) and d_resp.status_code == 200:
                for d in d_resp.json():
                    datasets_list.append(
                        HFDataset(
                            id=d.get("id"),
                            name=d.get("id", "").split("/")[-1],
                            likes=d.get("likes", 0),
                            downloads=d.get("downloads", 0),
                        )
                    )

            # 5. Process Spaces (Top 6)
            spaces_list = []
            s_resp = results["spaces"]
            if not isinstance(s_resp, Exception) and s_resp.status_code == 200:
                for s in s_resp.json():
                    spaces_list.append(
                        HFSpace(
                            id=s.get("id"),
                            name=s.get("id", "").split("/")[-1],
                            likes=s.get("likes", 0),
                            sdk=s.get("sdk"),
                        )
                    )

            # 6. Aggregate metadata from overview
            # Overview provides the total counts even if we only fetch 6 records separately.
            total_models = user_data.get("numModels")
            total_datasets = user_data.get("numDatasets")
            total_spaces = user_data.get("numSpaces")

            # nb_likes is the total likes across all resources
            total_likes = user_data.get("numLikes")

            return HuggingFaceProfile(
                handle=handle,
                profile_link=f"https://huggingface.co/{handle}",
                followers_count=user_data.get("numFollowers", 0),
                likes_count=total_likes,
                public_repo_count=total_models + total_datasets + total_spaces,
                models=models_list,
                spaces=spaces_list,
                datasets=datasets_list,
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
