from datetime import datetime
from enum import Enum
from uuid import uuid4
from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Date,
    Boolean,
    Index,
    Enum as SQLEnum,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


# Helper for UUID strings
def generate_uuid():
    return str(uuid4())


# --- Enums ---
class Role(str, Enum):
    USER = "user"
    ADMIN = "admin"


class CP_Platform(str, Enum):
    CODEFORCES = "codeforces"
    CODECHEF = "codechef"
    LEETCODE = "leetcode"
    ATCODER = "atcoder"


class Repo_Platform(str, Enum):
    GITHUB = "github"
    GITLAB = "gitlab"
    HUGGING_FACE = "hugging_face"


# --- Models ---


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    email = Column(String, index=True, unique=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(SQLEnum(Role), default=Role.USER)

    # Auth Fields
    verification_token = Column(String, index=True, nullable=True)
    is_verified = Column(Boolean, default=False)
    verify_token_expiry = Column(DateTime, nullable=True)
    refresh_token = Column(String, nullable=True)
    forgot_password_token = Column(String, index=True, nullable=True)
    forgot_password_token_expiry = Column(DateTime, nullable=True)

    # Timestamps (Fixed: passing function reference, not result)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    # uselist=False makes it a 1-to-1 relationship
    profile = relationship(
        "Profile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    cp_profiles = relationship(
        "CP_Profile", back_populates="user", cascade="all, delete-orphan"
    )
    repo_profiles = relationship(
        "Repo_Profile", back_populates="user", cascade="all, delete-orphan"
    )
    projects = relationship(
        "Project", back_populates="user", cascade="all, delete-orphan"
    )
    achievements = relationship(
        "Achievement", back_populates="user", cascade="all, delete-orphan"
    )
    experience = relationship(
        "Experience", back_populates="user", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_is_verified_expiry", "is_verified", "verify_token_expiry"),
    )


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True)

    name = Column(String, nullable=False)
    bio = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)
    institute = Column(String, nullable=True)
    organization = Column(String, nullable=True)
    readme = Column(String, nullable=True)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    portfolio_website = Column(String, nullable=True)

    # Socials
    linkedin = Column(String, nullable=True)
    github = Column(String, nullable=True)
    xtwitter = Column(String, nullable=True)
    instagram = Column(String, nullable=True)
    reddit = Column(String, nullable=True)
    twitch = Column(String, nullable=True)
    youtube = Column(String, nullable=True)
    discord = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class CP_Profile(Base):
    __tablename__ = "cp_profiles"

    # Composite Primary Key (matches Prisma @@id)
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    platform = Column(SQLEnum(CP_Platform), primary_key=True)

    handle = Column(String, nullable=False)
    profile_link = Column(String, nullable=False)
    rating = Column(Integer, nullable=True)
    max_rating = Column(Integer, nullable=True)
    hard_problems = Column(Integer, nullable=True)
    medium_problems = Column(Integer, nullable=True)
    easy_problems = Column(Integer, nullable=True)
    problems_solved = Column(Integer, nullable=True)
    rank = Column(String, nullable=True)
    max_rank = Column(String, nullable=True)

    # PostgreSQL specific JSONB for contest history
    contests = Column(ARRAY(JSONB), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="cp_profiles")


class Repo_Profile(Base):
    __tablename__ = "repo_profiles"

    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    platform = Column(SQLEnum(Repo_Platform), primary_key=True)

    handle = Column(String, nullable=False)
    profile_link = Column(String, nullable=False)
    followers_count = Column(Integer, nullable=True)
    organizations = Column(ARRAY(String), nullable=True)
    public_repo_count = Column(Integer, nullable=True)
    likes_count = Column(Integer, nullable=True)

    # Using JSONB for complex nested data from GitHub/HF
    pinned_repos = Column(ARRAY(JSONB), nullable=True)
    models = Column(ARRAY(JSONB), nullable=True)
    spaces = Column(ARRAY(JSONB), nullable=True)
    datasets = Column(ARRAY(JSONB), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="repo_profiles")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), index=True)

    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    tech_stack = Column(ARRAY(String), nullable=True)
    domains = Column(ARRAY(String), nullable=True)
    languages = Column(ARRAY(String), nullable=True)
    github_link = Column(String, nullable=True)
    project_link = Column(String, nullable=True)
    project_date = Column(Date, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="projects")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), index=True)

    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    certificate_link = Column(String, nullable=True)
    organization = Column(String, nullable=True)
    event = Column(String, nullable=True)
    event_link = Column(String, nullable=True)
    event_date = Column(Date, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="achievements")


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), index=True)

    organization = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    job_title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    skills = Column(ARRAY(String), nullable=True)
    location = Column(String, nullable=True)

    user = relationship("User", back_populates="experience")
