# 🚦 CrowdQueue

### *Skip the Line. Not the Service.*

A hyperlocal, real-time virtual queue management system that eliminates physical waiting at hospitals, government offices, banks, and more.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TailwindCSS, Framer Motion, Aceternity UI |
| Backend | Node.js 20, Express.js, Socket.io |
| Database | MongoDB 7 (Mongoose) |
| Cache | Redis 7 (ioredis) |
| Jobs | BullMQ |
| Infra | Docker Compose, Nginx |

## Quick Start

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env with your secrets

# 2. Start all services
docker-compose up --build

# 3. Seed super admin
cd server && node src/seed.js

# 4. Open
# App:  http://localhost
# API:  http://localhost/api/v1
```

## Architecture

```
Nginx (80) → Next.js (3000) + Express API (5000 x2)
                                    ↕
                              MongoDB + Redis
                                    ↕
                              BullMQ Worker
```

## Project Structure

```
crowdqueue/
├── client/          # Next.js 15 (App Router)
├── server/          # Express API
├── worker/          # BullMQ background jobs
├── nginx/           # Reverse proxy config
└── docker-compose.yml
```
