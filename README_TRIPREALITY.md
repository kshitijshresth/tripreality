# TripReality — Local Setup

## Backend
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
# copy .env.example to .env and fill in your API keys
copy .env.example .env
uvicorn server:app --reload --port 8001

## Frontend
cd frontend
yarn install
# frontend/.env: REACT_APP_BACKEND_URL=http://localhost:8001
yarn start

Open http://localhost:3000

## Microsoft Store notes
- Add a public privacy policy URL (example: `/privacy.html` in `frontend/public`) and replace placeholder text before submitting to Partner Center.
- Use PWABuilder or Visual Studio to generate an MSIX from the PWA build.

## Deployed
- Repository: kshitijshresth/tripreality (branch: master)
- Frontend is deployed (Vercel) and backend is deployed to Render at: https://tripreality.onrender.com
- Render service id: srv-d863sglckfvc73ec21o0

When building the frontend for Store packaging, set `REACT_APP_BACKEND_URL` to the Render URL (or the hosted frontend origin if using a hosted web app). Do not include any server-side secrets in the client bundle.
