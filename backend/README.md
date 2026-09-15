# DevAll Backend API

The backend of DevAll is a high-performance **FastAPI** application connected to **NeonDB (PostgreSQL)** and **Redis**. It serves as the core data aggregation engine, normalizing metrics from various competitive programming and code repository platforms.

## 🚀 Core Architecture

- **Non-Blocking Background Workers**: Implements a `Stale-While-Revalidate` caching pattern using FastAPI `BackgroundTasks`. The API immediately returns cached data to the frontend and defers slow external API fetching to background workers, ensuring fast response times.
- **Resilient Fan-Out Aggregation**: Leverages `asyncio.gather` to concurrently fetch data from multiple platforms (LeetCode, Codeforces, AtCoder, CodeChef, GitHub, etc.). Uses the `tenacity` library to provide automatic exponential backoff retries, ensuring fault tolerance against third-party API rate limits and downtime.
- **Distributed Rate Limiting**: Uses Redis and `slowapi` to coordinate global rate limits across all incoming traffic, preventing abuse and maintaining system stability.
- **Secure Authentication**: JWT-based authentication with refresh token rotation and email verification via Brevo.

## 🛠️ Local Development Setup

1. **Create a Virtual Environment**:
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # Windows Git Bash
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend` directory with your database and service credentials.

4. **Start the Server**:
   ```bash
   python main.py
   ```
   *The server will start on `http://0.0.0.0:10000` by default.*
