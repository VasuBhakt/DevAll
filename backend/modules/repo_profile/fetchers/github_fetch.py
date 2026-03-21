import asyncio
import logging
import time
import os
import httpx
from pydantic import BaseModel, Field, ConfigDict
from utils import APIException
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


async def _throttle_github_request(redis_client, cooldown=2.0):
    """Distributed throttle using Redis to space out requests globally."""
    if not redis_client:
        return

    key = "github_global_last_request"
    while True:
        last_request = await redis_client.get(key)
        now = time.time()

        if last_request:
            elapsed = now - float(last_request)
            if elapsed < cooldown:
                wait_time = cooldown - elapsed
                logger.info(
                    f"Throttling: Spacing out GitHub requests by {wait_time:.2f}s"
                )
                await asyncio.sleep(wait_time)
                continue

        # Atomic set to update the last request time
        await redis_client.set(key, str(time.time()))
        break


class GithubPinnedRepo(BaseModel):
    name: str
    description: Optional[str] = None
    url: str
    stars: int = Field(validation_alias="stargazerCount")
    languages: List[str] = []
    project_link: Optional[str] = Field(validation_alias="homepageUrl", default=None)

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class GithubProfile(BaseModel):
    handle: str
    profile_link: str
    followers_count: int
    public_repo_count: int
    organizations: List[str]
    pinned_repos: List[GithubPinnedRepo]

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


GITHUB_GQL_URL = "https://api.github.com/graphql"


async def fetch_github_profile(handle: str, redis_client=None):
    if not redis_client:
        return await _fetch_gh_raw(handle)

    # Distributed Lock: Ensures ONLY ONE handle is being fetched from GH at any moment
    async with redis_client.lock("github_global_fetch_lock", timeout=15):
        try:
            # 1. Wait for global GH cooldown (1 second - GitHub is faster than CP sites)
            await _throttle_github_request(redis_client)
            return await _fetch_gh_raw(handle)
        except Exception as e:
            logger.error(f"Failed to fetch GitHub profile: {str(e)}")
            raise APIException(
                status=400,
                message=f"Failed to fetch GitHub profile: {str(e)}",
                error_code="FAILED_REQUEST",
            )


async def _fetch_gh_raw(handle: str):
    token = os.getenv("GITHUB_ACCESS_TOKEN")
    if not token:
        raise APIException(
            status=500,
            message="GitHub token not configured",
            error_code="CONFIG_ERROR",
        )

    # THE POWERFUL GRAPHQL QUERY
    query = """
    query getUserProfile($login: String!) {
      user(login: $login) {
        url
        followers {
          totalCount
        }
        repositories(first: 100, isFork: false) {
          totalCount
        }
        pinnedItems(first: 6, types: [REPOSITORY]) {
          nodes {
            ... on Repository {
              name
              description
              url
              stargazerCount
              homepageUrl
              languages(first: 3, orderBy: {field: SIZE, direction: DESC}) {
                nodes {
                  name
                }
              }
            }
          }
        }
        organizations(first: 10) {
          nodes {
            name
          }
        }
      }
    }
    """

    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            response = await client.post(
                GITHUB_GQL_URL,
                json={"query": query, "variables": {"login": handle}},
                headers={
                    "Authorization": f"Bearer {token}",
                    "User-Agent": "DevAll-Backend",
                },
            )

            if response.status_code != 200:
                raise APIException(
                    status=400,
                    message="Failed to connect to GitHub",
                    error_code="FAILED_REQUEST",
                )

            res_data = response.json()

            # Check for GraphQL-level errors
            if "errors" in res_data:
                logger.error(f"GitHub GraphQL error: {res_data['errors']}")
                messages = [e.get("message", "") for e in res_data["errors"]]
                if any(
                    "Could not resolve to a User with the login" in m for m in messages
                ):
                    raise APIException(
                        status=404,
                        message="GitHub user not found",
                        error_code="NOT_FOUND",
                    )
                raise APIException(
                    status=400,
                    message=f"GitHub API error: {messages[0]}",
                    error_code="FAILED_REQUEST",
                )

            user_data = res_data.get("data", {}).get("user")
            if not user_data:
                raise APIException(
                    status=404, message="GitHub user not found", error_code="NOT_FOUND"
                )

            # Extract counts
            followers = user_data["followers"]["totalCount"]
            repos = user_data["repositories"]["totalCount"]

            # Extract pinned repositories
            pinned_nodes = user_data["pinnedItems"]["nodes"]
            pinned_repos = []
            for node in pinned_nodes:
                pinned_repos.append(
                    {
                        "name": node["name"],
                        "description": node.get("description"),
                        "url": node["url"],
                        "stars": node.get("stargazerCount", 0),
                        "languages": [l["name"] for l in node["languages"]["nodes"]],
                        "project_link": node.get("homepageUrl"),
                    }
                )

            # Extract organizations
            orgs = [
                node["name"]
                for node in user_data["organizations"]["nodes"]
                if node.get("name")
            ]

            return GithubProfile(
                handle=handle,
                profile_link=user_data["url"],
                followers_count=followers,
                public_repo_count=repos,
                organizations=orgs,
                pinned_repos=pinned_repos,
            )

        except APIException:
            raise
        except Exception as e:
            logger.error(f"GitHub fetch error: {str(e)}")
            raise APIException(
                status=400,
                message=f"Failed to fetch GitHub profile: {str(e)}",
                error_code="FAILED_REQUEST",
            )
