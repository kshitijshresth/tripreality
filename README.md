# TripReality

Get honest travel insights powered by Reddit discussions and AI analysis.

## Overview

TripReality scrapes real Reddit travel discussions, analyzes them with AI, and generates honest travel reports so you can plan trips with confidence.

## Live Demo

- **Backend:** https://tripreality.onrender.com
- **Frontend:** Deployed via Vercel

## Tech Stack

- **Frontend:** React, Tailwind CSS, shadcn/ui
- **Backend:** FastAPI, Motor (async MongoDB), Uvicorn
- **AI/LLM:** NVIDIA NIM, Groq
- **Data:** Reddit API (PRAW)
- **Database:** MongoDB

## Local Setup

### Backend
```bash
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Fill in your API keys in .env
uvicorn server:app --reload --port 8001
```

### Frontend
```bash
cd frontend
yarn install
# Set REACT_APP_BACKEND_URL=http://localhost:8001 in frontend/.env
yarn start
```

Open http://localhost:3000

## Environment Variables

See `.env.example` in the `backend` folder for all required API keys and configuration.

## Deployment

- Backend is deployed on [Render](https://render.com) using `render.yaml`
- Frontend is deployed on Vercel
- Secrets are configured via Render dashboard env vars (sync: false)

## License

Apache 2.0 — see [LICENSE](LICENSE)
