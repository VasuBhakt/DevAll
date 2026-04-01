# DevAll

**DevAll** is a purpose-built, unified workspace designed to consolidate your entire technical identity into a single, sleek dashboard. By aggregating real-time statistics from and various competitive programming and repository platforms, DevAll eliminates the need for multiple profile links, providing a unified view of your contributions, rankings, and repositories.

> **Note:** This project is **not open source** and is proprietary software. All rights reserved.

---

## 🚀 Core Capabilities
- **Secure Auth** : JWT-based authentication with Refresh Token rotation and Brevo password recovery and email verification.
- **Unified Dashboard:** Seamlessly functions as both a personal development workspace and a public-facing portfolio.
- **Asynchronous Data Aggregation**: Leverages Python’s asyncio.gather and httpx to fetch metrics from multiple third-party APIs concurrently, keeping system latency bounded to the slowest external response.
- **Distributed Global Throttling**: Utilizes a Redis-backed coordination layer to space out requests globally to prevent IP blacklisting and maintain consitent service
- **Modern UI/UX:** Built with Tailwind CSS, Framer Motion for sleek interactions, and Shadcn UI for premium, accessible components.
---

## 🏗️ System Architecture

```
DevAll/
├── frontend/     # NextJS 16 (Hosted on Vercel)
└── backend/      # FastAPI + NeonDB (PostgreSQL) + Redis (Hosted on Render)

```
---

## 🛠️ Technology Stack

| Category | Tech Stack |
| :--- | :--- |
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Framer](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white) |
| **Backend** | ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-FF4438?style=for-the-badge&logo=redis&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens) |
| **Database** | ![Neon](https://img.shields.io/badge/Neon_DB-00E599?style=for-the-badge&logo=neon&logoColor=black) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) |
| **Services** | ![Brevo](https://img.shields.io/badge/Brevo-0092FF?style=for-the-badge&logo=brevo&logoColor=white) |
| **Deployment** | ![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white) ![Render](https://img.shields.io/badge/Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white) |

---

## 📝 License

This project is **proprietary software** and is not open source. All rights reserved. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.

---

## 👨‍💻 Author

> "I was too lazy to build a static portfolio, so I built a system that builds them for everyone." — The origin of DevAll.
