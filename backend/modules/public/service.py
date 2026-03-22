from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from sqlalchemy import desc
from database.models import (
    User,
    Profile,
    Project,
    Achievement,
    Experience,
    CP_Profile,
    Repo_Profile,
)
from .schemas import (
    PublicProfileResponse,
    PublicProfileData,
    PublicProject,
    PublicAchievement,
    PublicExperience,
    PublicCPProfile,
    PublicRepoProfile,
)
from utils import APIException


class PublicService:
    async def get_public_profile(
        self, username: str, db: AsyncSession
    ) -> PublicProfileResponse:
        # 1 & 2. Fetch User and Profile in a single query using joinedload
        user_query = (
            select(User)
            .options(joinedload(User.profile))
            .where(User.username == username)
        )
        result = await db.execute(user_query)
        user = result.scalars().first()

        if not user:
            raise APIException(
                message="User not found",
                status=404,
                error_code="USER_NOT_FOUND",
            )

        profile = user.profile
        if not profile:
            raise APIException(
                message="Profile details not found",
                status=404,
                error_code="PROFILE_NOT_FOUND",
            )

        # 3. Fetch Top 3 Projects (Ordered by project_date desc, then created_at desc)
        projects_query = (
            select(Project)
            .where(Project.user_id == user.id)
            .order_by(desc(Project.project_date), desc(Project.created_at))
            .limit(3)
        )
        projects_res = await db.execute(projects_query)
        projects = projects_res.scalars().all()

        # 4. Fetch Top 3 Achievements (Ordered by event_date desc, then created_at desc)
        achievements_query = (
            select(Achievement)
            .where(Achievement.user_id == user.id)
            .order_by(desc(Achievement.event_date), desc(Achievement.created_at))
            .limit(3)
        )
        achievements_res = await db.execute(achievements_query)
        achievements = achievements_res.scalars().all()

        # 5. Fetch Top 3 Experiences (Ordered by start_date desc)
        experience_query = (
            select(Experience)
            .where(Experience.user_id == user.id)
            .order_by(desc(Experience.start_date))
            .limit(3)
        )
        experience_res = await db.execute(experience_query)
        experiences = experience_res.scalars().all()

        # 6. Fetch CP Profiles (Optimized: fetch specific fields only to avoid large JSONB bloat)
        cp_query = select(
            CP_Profile.platform,
            CP_Profile.handle,
            CP_Profile.profile_link,
            CP_Profile.rating,
            CP_Profile.max_rating,
            CP_Profile.hard_problems,
            CP_Profile.medium_problems,
            CP_Profile.easy_problems,
            CP_Profile.problems_solved,
            CP_Profile.rank,
            CP_Profile.max_rank,
        ).where(CP_Profile.user_id == user.id)
        cp_res = await db.execute(cp_query)
        cp_rows = cp_res.all()

        # 7. Fetch Repo Profiles (Optimized: fetch specific fields only to avoid large JSONB bloat)
        repo_query = select(
            Repo_Profile.platform,
            Repo_Profile.profile_link,
            Repo_Profile.followers_count,
            Repo_Profile.public_repo_count,
            Repo_Profile.likes_count,
            Repo_Profile.contribution_count,
            Repo_Profile.avatar,
        ).where(Repo_Profile.user_id == user.id)
        repo_res = await db.execute(repo_query)
        repo_rows = repo_res.all()

        # Data Construction
        return PublicProfileResponse(
            username=user.username,
            email=user.email,
            profile=PublicProfileData(
                name=profile.name,
                bio=profile.bio,
                profile_picture=profile.profile_picture,
                institute=profile.institute,
                organization=profile.organization,
                readme=profile.readme,
                city=profile.city,
                country=profile.country,
                portfolio_website=profile.portfolio_website,
                linkedin=profile.linkedin,
                github=profile.github,
                xtwitter=profile.xtwitter,
                instagram=profile.instagram,
                reddit=profile.reddit,
                twitch=profile.twitch,
                youtube=profile.youtube,
                discord=profile.discord,
            ),
            projects=[
                PublicProject(
                    name=p.name,
                    description=p.description,
                    tech_stack=p.tech_stack,
                    domains=p.domains,
                    languages=p.languages,
                    github_link=p.github_link,
                    project_link=p.project_link,
                    project_date=p.project_date,
                )
                for p in projects
            ],
            achievements=[
                PublicAchievement(
                    title=a.title,
                    description=a.description,
                    organization=a.organization,
                    event=a.event,
                    event_date=a.event_date,
                )
                for a in achievements
            ],
            experience=[
                PublicExperience(
                    organization=e.organization,
                    start_date=e.start_date,
                    end_date=e.end_date,
                    job_title=e.job_title,
                    description=e.description,
                    skills=e.skills,
                    location=e.location,
                )
                for e in experiences
            ],
            cp_profiles=[
                PublicCPProfile(
                    platform=cp.platform,
                    handle=cp.handle,
                    rating=cp.rating,
                    max_rating=cp.max_rating,
                    rank=cp.rank,
                    max_rank=cp.max_rank,
                    problems_solved=cp.problems_solved,
                    hard_problems=cp.hard_problems,
                    medium_problems=cp.medium_problems,
                    easy_problems=cp.easy_problems,
                )
                for cp in cp_rows
            ],
            repo_profiles=[
                PublicRepoProfile(
                    platform=repo.platform,
                    profile_link=repo.profile_link,
                    followers_count=repo.followers_count,
                    public_repo_count=repo.public_repo_count,
                    likes_count=repo.likes_count,
                    contribution_count=repo.contribution_count,
                    avatar=repo.avatar,
                )
                for repo in repo_rows
            ],
        )
