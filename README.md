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

## Standalone Desktop App

The frontend is also packaged as a standalone Electron desktop app that talks to the Render backend.

### Build the desktop app

```bash
cd frontend
npm install
npm run electron:build
```

This produces installers in `frontend/dist/`:
- **Windows:** `TripReality Setup.exe` (NSIS)
- **macOS:** `TripReality.dmg`
- **Linux:** `TripReality.AppImage`

The app bundles the production frontend build and connects to `https://tripreality.onrender.com` by default.

### Publish to GitHub Releases

Set a GitHub token with `repo` scope, then build:

```bash
set GH_TOKEN=your_github_token
npm run electron:build
```

`electron-builder` will auto-upload the installers to the latest GitHub Release.

### Development

```bash
cd frontend
npm run electron:dev
```

This starts the React dev server and launches Electron pointing to `http://localhost:3000`.

## Deployment

- Backend is deployed on [Render](https://render.com) using `render.yaml`
- Frontend web app is deployed on Vercel
- Desktop app is distributed via GitHub Releases
- Secrets are configured via Render dashboard env vars (sync: false)

## License

Apache 2.0 — see [LICENSE](LICENSE)
