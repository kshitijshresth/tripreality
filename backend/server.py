from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, json, io, zipfile, asyncio, logging, uuid, re
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import httpx
import praw

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="TripReality API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ========= Reddit Client =========
def get_reddit():
    return praw.Reddit(
        client_id=os.environ['REDDIT_CLIENT_ID'],
        client_secret=os.environ['REDDIT_CLIENT_SECRET'],
        user_agent=os.environ['REDDIT_USER_AGENT'],
        check_for_async=False,
    )

# ========= Models =========
class QueryRequest(BaseModel):
    destination: str
    traveler_type: Optional[str] = "Any"
    extra: Optional[str] = ""

class ChatRequest(BaseModel):
    destination: str
    history: List[Dict[str, Any]] = []
    message: str
    report: Optional[Dict[str, Any]] = None

class RedditPost(BaseModel):
    id: str
    title: str
    url: str
    subreddit: str
    score: int
    num_comments: int
    created_utc: float
    selftext: str = ""
    top_comments: List[str] = []


# ========= Reddit fetch =========
async def fetch_reddit_posts(destination: str, limit: int = 20) -> List[Dict[str, Any]]:
    def _sync():
        r = get_reddit()
        queries = [
            f"{destination} pros cons",
            f"{destination} reality",
            f"{destination} scam OR safety OR avoid",
            f"{destination} honest review",
            f"{destination} disappointed OR overrated",
        ]
        seen = set()
        out = []
        subreddits = ["travel", "solotravel", "backpacking", "digitalnomad", "TravelNoPics", "IWantOut"]
        sub_str = "+".join(subreddits)
        for q in queries:
            try:
                results = r.subreddit(sub_str).search(q, sort="relevance", time_filter="year", limit=8)
                for s in results:
                    if s.id in seen:
                        continue
                    seen.add(s.id)
                    comments = []
                    try:
                        s.comments.replace_more(limit=0)
                        for c in s.comments[:5]:
                            if hasattr(c, "body") and len(c.body) > 30:
                                comments.append(c.body[:600])
                    except Exception:
                        pass
                    out.append({
                        "id": s.id,
                        "title": s.title,
                        "url": f"https://reddit.com{s.permalink}",
                        "subreddit": str(s.subreddit),
                        "score": s.score,
                        "num_comments": s.num_comments,
                        "created_utc": s.created_utc,
                        "selftext": (s.selftext or "")[:1500],
                        "top_comments": comments,
                    })
                    if len(out) >= limit:
                        return out
            except Exception as e:
                logger.warning(f"Reddit search failed for '{q}': {e}")
        return out
    return await asyncio.to_thread(_sync)


# ========= LLM Synthesis =========
SYNTHESIS_SYSTEM = """You are TripReality, the anti-influencer truth layer for travel. Synthesize REAL Reddit posts and comments into a brutally honest, evidence-based travel intelligence report. Avoid generic platitudes. Cite source post IDs in 'evidence' fields.

Return ONLY valid JSON matching this schema (no markdown, no backticks):
{
  "destination": "string",
  "summary": "2-3 sentence brutally honest one-liner",
  "vibe_score": 7.5,
  "hidden_pros": [{"title":"...", "detail":"...", "evidence":["post_id1"]}],
  "hidden_cons": [{"title":"...", "detail":"...", "evidence":["post_id1"]}],
  "reality_check": "balanced 3-5 sentence reality vs Instagram",
  "risk_radar": [
    {"category":"Scams","severity":"low|medium|high","detail":"..."},
    {"category":"Safety","severity":"low|medium|high","detail":"..."},
    {"category":"Overtourism","severity":"low|medium|high","detail":"..."},
    {"category":"Current Events","severity":"low|medium|high","detail":"..."},
    {"category":"Weather","severity":"low|medium|high","detail":"..."}
  ],
  "neighborhoods": [{"name":"...", "vibe":"...", "best_for":"...", "avoid_if":"..."}],
  "practical_tips": ["...","..."],
  "current_situation": "what is happening RIGHT NOW (last 30-90 days based on posts)",
  "confidence": 0.85
}
Rules:
- 4-6 hidden_pros and 4-6 hidden_cons. Each item should reveal something a guidebook would NOT say.
- vibe_score 0-10 reflecting overall reality.
- Always include all 5 risk_radar categories.
- 3-5 neighborhoods.
- 5-8 practical tips, ultra specific.
- confidence 0-1 based on volume/quality of evidence."""


async def call_llm(messages: List[Dict[str, str]], json_mode: bool = True) -> str:
    """Try NVIDIA NIM first, fall back to Groq."""
    nim_payload = {
        "model": os.environ['NVIDIA_NIM_MODEL'],
        "messages": messages,
        "temperature": 0.4,
        "max_tokens": 4096,
        "top_p": 0.9,
    }
    headers_nim = {"Authorization": f"Bearer {os.environ['NVIDIA_NIM_API_KEY']}", "Content-Type": "application/json"}
    try:
        async with httpx.AsyncClient(timeout=90) as cx:
            r = await cx.post(os.environ['NVIDIA_NIM_URL'], json=nim_payload, headers=headers_nim)
            if r.status_code == 200:
                return r.json()["choices"][0]["message"]["content"]
            logger.warning(f"NVIDIA NIM failed {r.status_code}: {r.text[:200]}")
    except Exception as e:
        logger.warning(f"NVIDIA NIM exception: {e}")

    # Groq fallback
    groq_payload = {
        "model": os.environ['GROQ_MODEL'],
        "messages": messages,
        "temperature": 0.4,
        "max_tokens": 4096,
    }
    if json_mode:
        groq_payload["response_format"] = {"type": "json_object"}
    headers_groq = {"Authorization": f"Bearer {os.environ['GROQ_API_KEY']}", "Content-Type": "application/json"}
    async with httpx.AsyncClient(timeout=90) as cx:
        r = await cx.post(os.environ['GROQ_URL'], json=groq_payload, headers=headers_groq)
        if r.status_code != 200:
            raise HTTPException(502, f"Both LLMs failed. Groq: {r.text[:200]}")
        return r.json()["choices"][0]["message"]["content"]


def extract_json(text: str) -> Dict[str, Any]:
    text = text.strip()
    # strip markdown fences
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    # try direct
    try:
        return json.loads(text)
    except Exception:
        pass
    # find first { ... last }
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
            pass
    raise ValueError("Could not parse JSON from LLM response")


def build_evidence_block(posts: List[Dict[str, Any]]) -> str:
    lines = []
    for p in posts:
        lines.append(f"[{p['id']}] r/{p['subreddit']} ({p['score']} upvotes, {p['num_comments']} comments)")
        lines.append(f"TITLE: {p['title']}")
        if p['selftext']:
            lines.append(f"BODY: {p['selftext'][:800]}")
        for i, c in enumerate(p['top_comments'][:3]):
            lines.append(f"  COMMENT {i+1}: {c[:500]}")
        lines.append("---")
    return "\n".join(lines)


# ========= Routes =========
@api_router.get("/")
async def root():
    return {"message": "TripReality API", "status": "ok"}


@api_router.post("/query")
async def query_destination(req: QueryRequest):
    dest = req.destination.strip()
    if not dest:
        raise HTTPException(400, "destination required")
    posts = await fetch_reddit_posts(dest, limit=18)
    if not posts:
        # graceful: still call LLM with no evidence to produce a "no data" notice
        evidence = "(No recent Reddit posts found for this destination)"
    else:
        evidence = build_evidence_block(posts)

    user_msg = f"""Destination: {dest}
Traveler type: {req.traveler_type or 'Any'}
Extra context: {req.extra or '(none)'}

REDDIT EVIDENCE (use post IDs in evidence arrays):
{evidence}

Synthesize the report as JSON. Cite post IDs from the evidence above."""

    messages = [
        {"role": "system", "content": SYNTHESIS_SYSTEM},
        {"role": "user", "content": user_msg},
    ]

    raw = await call_llm(messages)
    try:
        report = extract_json(raw)
    except Exception as e:
        logger.error(f"JSON parse failed: {e}; raw={raw[:500]}")
        raise HTTPException(502, "AI returned invalid JSON")

    # attach sources
    sources = [{
        "id": p["id"],
        "title": p["title"],
        "url": p["url"],
        "subreddit": p["subreddit"],
        "score": p["score"],
        "date": datetime.fromtimestamp(p["created_utc"], tz=timezone.utc).isoformat(),
    } for p in posts]

    report["destination"] = dest
    report["sources"] = sources
    report["generated_at"] = datetime.now(timezone.utc).isoformat()
    report["id"] = str(uuid.uuid4())

    # save to mongo (fire and forget)
    try:
        await db.reports.insert_one({**report, "_saved_at": datetime.now(timezone.utc).isoformat()})
    except Exception as e:
        logger.warning(f"Mongo save failed: {e}")
    report.pop("_id", None)
    return report


@api_router.post("/chat")
async def chat_followup(req: ChatRequest):
    sys = """You are TripReality, a brutally honest travel intel assistant. Answer follow-up questions about a destination using the prior report and Reddit evidence. Be concise, specific, and cite sources when possible. Respond in plain text (no JSON)."""
    context = ""
    if req.report:
        context = f"PRIOR REPORT:\n{json.dumps(req.report, indent=2)[:6000]}\n\n"
    messages = [{"role": "system", "content": sys}, {"role": "user", "content": context + f"Destination: {req.destination}\n\n"}]
    for h in req.history[-6:]:
        messages.append({"role": h.get("role", "user"), "content": str(h.get("content", ""))})
    messages.append({"role": "user", "content": req.message})
    answer = await call_llm(messages, json_mode=False)
    return {"answer": answer}


@api_router.get("/featured-cities")
async def featured_cities():
    return {"cities": [
        {"name": "Bangkok", "country": "Thailand", "tag": "Chaotic charm", "score": 8.2, "img": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800"},
        {"name": "Lisbon", "country": "Portugal", "tag": "Overtourism rising", "score": 7.6, "img": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800"},
        {"name": "Medellín", "country": "Colombia", "tag": "Digital nomad mecca", "score": 7.8, "img": "https://images.unsplash.com/photo-1567604130959-7ea7ab2a7c10?w=800"},
        {"name": "Tokyo", "country": "Japan", "tag": "Surprisingly affordable", "score": 9.1, "img": "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800"},
        {"name": "Bali", "country": "Indonesia", "tag": "Influencer fatigue", "score": 6.9, "img": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800"},
        {"name": "Mexico City", "country": "Mexico", "tag": "Underrated gem", "score": 8.4, "img": "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800"},
    ]}


@api_router.get("/download-source")
async def download_source():
    """Zip the entire /app codebase and stream it."""
    buf = io.BytesIO()
    root = Path("/app")
    exclude_dirs = {"node_modules", "__pycache__", ".git", "build", "dist", ".next", ".cache", "venv", ".venv"}
    exclude_files_suffix = {".pyc", ".log"}
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in root.rglob("*"):
            # skip excluded directories
            if any(part in exclude_dirs for part in p.parts):
                continue
            if p.is_file():
                if p.suffix in exclude_files_suffix:
                    continue
                try:
                    if p.stat().st_size > 5 * 1024 * 1024:  # skip > 5MB
                        continue
                    arc = p.relative_to(root)
                    zf.write(p, arcname=f"tripreality/{arc}")
                except Exception:
                    pass
        # add README
        zf.writestr("tripreality/README_TRIPREALITY.md", README_TXT)
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=tripreality-source.zip"},
    )


README_TXT = """# TripReality — Local Setup

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
"""


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
