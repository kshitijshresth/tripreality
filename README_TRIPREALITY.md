# TripReality — Local Setup

## Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# create .env (see backend/.env)
uvicorn server:app --reload --port 8001

## Frontend
cd frontend
yarn install
# frontend/.env: REACT_APP_BACKEND_URL=http://localhost:8001
yarn start

Open http://localhost:3000
