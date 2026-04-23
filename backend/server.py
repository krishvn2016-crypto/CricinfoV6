from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import jwt
import bcrypt
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta

from emergentintegrations.llm.chat import LlmChat, UserMessage

import mock_data

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Config
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = os.environ['JWT_ALGORITHM']
JWT_EXPIRE_MINUTES = int(os.environ.get('JWT_EXPIRE_MINUTES', '43200'))
SPORTMONKS_API_KEY = os.environ.get('SPORTMONKS_API_KEY', '')
SPORTMONKS_BASE = os.environ.get('SPORTMONKS_BASE_URL', 'https://cricket.sportmonks.com/api/v2.0')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# LiteLLM Emergent key setup
os.environ["ANTHROPIC_API_KEY"] = EMERGENT_LLM_KEY  # fallback placeholder

app = FastAPI(title="Cricket Live API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# =========================
# Models
# =========================
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    name: str

class AuthResponse(BaseModel):
    token: str
    user: UserOut

class FollowRequest(BaseModel):
    target_type: str  # "team" | "player"
    target_id: str

class AlertRequest(BaseModel):
    match_id: str
    alert_types: List[str]  # ["wicket","boundary","player_to_crease"]
    player_id: Optional[str] = None

class AskAIRequest(BaseModel):
    query: str
    match_id: Optional[str] = None

class PollVoteRequest(BaseModel):
    poll_id: str
    option_index: int

class ChatMessageCreate(BaseModel):
    match_id: str
    message: str


# =========================
# Auth helpers
# =========================
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_user_optional(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[Dict[str, Any]]:
    if not creds:
        return None
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        return user
    except Exception:
        return None


# =========================
# Sportmonks client (fallback to mock)
# =========================
async def try_sportmonks(path: str, params: dict = None) -> Optional[dict]:
    """Try to fetch from Sportmonks; return None on failure (caller falls back to mock)."""
    if not SPORTMONKS_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=5.0) as http:
            p = params or {}
            p["api_token"] = SPORTMONKS_API_KEY
            resp = await http.get(f"{SPORTMONKS_BASE}{path}", params=p)
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        logger.warning(f"Sportmonks fetch failed: {e}")
    return None


# =========================
# Auth Endpoints
# =========================
@api_router.post("/auth/register", response_model=AuthResponse)
async def register(data: UserRegister):
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": data.email.lower(),
        "name": data.name,
        "password": hash_password(data.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "following_teams": [],
        "following_players": [],
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_id)
    return AuthResponse(token=token, user=UserOut(id=user_id, email=data.email.lower(), name=data.name))


@api_router.post("/auth/login", response_model=AuthResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user["id"])
    return AuthResponse(token=token, user=UserOut(id=user["id"], email=user["email"], name=user["name"]))


@api_router.get("/auth/me", response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return UserOut(id=user["id"], email=user["email"], name=user["name"])


# =========================
# Matches
# =========================
@api_router.get("/matches/live")
async def live_matches():
    # Try Sportmonks; fallback to mock
    data = await try_sportmonks("/livescores", {"include": "runs,batsmen,bowlers"})
    if data and data.get("data"):
        # Minimal transform not attempted - fallback to mock for demo richness
        pass
    return {"matches": mock_data.get_live_matches()}


@api_router.get("/matches/upcoming")
async def upcoming_matches():
    return {"matches": mock_data.get_upcoming_matches()}


@api_router.get("/matches/completed")
async def completed_matches():
    return {"matches": mock_data.get_completed_matches()}


@api_router.get("/matches/{match_id}")
async def match_detail(match_id: str):
    m = mock_data.get_match_by_id(match_id)
    if not m:
        raise HTTPException(status_code=404, detail="Match not found")
    return m


@api_router.get("/matches/{match_id}/scorecard")
async def match_scorecard(match_id: str):
    sc = mock_data.get_scorecard(match_id)
    if not sc:
        raise HTTPException(status_code=404, detail="Match not found")
    return sc


@api_router.get("/matches/{match_id}/commentary")
async def match_commentary(match_id: str):
    return {"commentary": mock_data.get_ball_by_ball(match_id)}


@api_router.get("/matches/{match_id}/wagon-wheel/{player_id}")
async def wagon_wheel(match_id: str, player_id: str):
    return {"wagon_wheel": mock_data.get_wagon_wheel(match_id, player_id)}


@api_router.get("/matches/{match_id}/manhattan")
async def manhattan(match_id: str):
    return {"manhattan": mock_data.get_manhattan(match_id)}


@api_router.get("/matches/{match_id}/partnerships")
async def partnerships(match_id: str):
    return {"partnerships": mock_data.get_partnership(match_id)}


@api_router.get("/matches/{match_id}/predicted-xi")
async def predicted_xi(match_id: str):
    p = mock_data.get_predicted_xi(match_id)
    if not p:
        raise HTTPException(status_code=404, detail="Match not found")
    return p


@api_router.get("/matches/{match_id}/playing-xi")
async def playing_xi_detailed(match_id: str):
    """Final playing XI for both teams with detailed match-context stats (per-format avg, at venue, vs opponent, MoTM/MoS, WK stats)."""
    data = mock_data.get_playing_xi_with_stats(match_id)
    if not data:
        raise HTTPException(status_code=404, detail="Match not found")
    return data


@api_router.get("/matches/{match_id}/umpires")
async def match_umpires(match_id: str):
    """On-field umpires, TV umpire, reserve umpire and match referee."""
    match = mock_data.get_match_by_id(match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return mock_data.get_umpires_for_match(match_id)


@api_router.get("/venues")
async def venue_info_by_query(name: str):
    """Get venue info by full name (passed as query param `name`)."""
    return mock_data.get_venue_info(name)


# =========================
# Players & Teams
# =========================
@api_router.get("/players")
async def players():
    return {"players": mock_data.PLAYERS}


@api_router.get("/players/{player_id}")
async def player_detail(player_id: str):
    p = mock_data.get_player(player_id)
    if not p:
        raise HTTPException(status_code=404, detail="Player not found")
    import random
    random.seed(hash(player_id + "form") % (2**32))
    recent_form = [random.randint(2, 98) for _ in range(10)]

    # Top venues performance
    top_venue_names = ["Wankhede Stadium, Mumbai", "M. Chinnaswamy Stadium, Bengaluru", "Eden Gardens, Kolkata", "M.A. Chidambaram Stadium, Chennai", "Narendra Modi Stadium, Ahmedabad"]
    top_venues = [{"venue": v, **mock_data.get_player_venue_record(player_id, v)} for v in top_venue_names]

    # Performance vs top opposing teams (excluding own team)
    top_opps = [t for t in mock_data.TEAMS if t["id"] != p["team_id"]][:6]
    vs_teams = [{"team": t, **mock_data.get_player_vs_team_record(player_id, t["id"])} for t in top_opps]

    return {**p, "recent_form": recent_form, "top_venues": top_venues, "vs_teams": vs_teams}


@api_router.get("/teams")
async def teams():
    return {"teams": mock_data.TEAMS}


@api_router.get("/teams/{team_id}")
async def team_detail(team_id: str):
    t = mock_data.get_team(team_id)
    if not t:
        raise HTTPException(status_code=404, detail="Team not found")
    squad = [p for p in mock_data.PLAYERS if p["team_id"] == team_id]
    return {**t, "squad": squad}


@api_router.get("/top-performers")
async def top_performers():
    return mock_data.get_top_performers()


# =========================
# Follow / Personalization
# =========================
@api_router.post("/follow")
async def follow(data: FollowRequest, user=Depends(get_current_user)):
    field = "following_teams" if data.target_type == "team" else "following_players"
    await db.users.update_one({"id": user["id"]}, {"$addToSet": {field: data.target_id}})
    return {"status": "ok"}


@api_router.post("/unfollow")
async def unfollow(data: FollowRequest, user=Depends(get_current_user)):
    field = "following_teams" if data.target_type == "team" else "following_players"
    await db.users.update_one({"id": user["id"]}, {"$pull": {field: data.target_id}})
    return {"status": "ok"}


@api_router.get("/following")
async def following(user=Depends(get_current_user)):
    u = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    teams = [mock_data.get_team(tid) for tid in u.get("following_teams", []) if mock_data.get_team(tid)]
    players = [mock_data.get_player(pid) for pid in u.get("following_players", []) if mock_data.get_player(pid)]
    return {"teams": teams, "players": players}


@api_router.get("/home-feed")
async def home_feed(user=Depends(get_user_optional)):
    live = mock_data.get_live_matches()
    upcoming = mock_data.get_upcoming_matches()[:5]
    top = mock_data.get_top_performers()
    personalized = []
    if user:
        fteams = set(user.get("following_teams", []))
        fplayers = set(user.get("following_players", []))
        for m in live + upcoming:
            if m["team_a"]["id"] in fteams or m["team_b"]["id"] in fteams:
                personalized.append(m)
    return {
        "live": live,
        "upcoming": upcoming,
        "personalized_matches": personalized,
        "top_performers": top,
    }


# =========================
# Alerts
# =========================
@api_router.post("/alerts")
async def set_alert(data: AlertRequest, user=Depends(get_current_user)):
    alert_id = str(uuid.uuid4())
    await db.alerts.insert_one({
        "id": alert_id,
        "user_id": user["id"],
        "match_id": data.match_id,
        "alert_types": data.alert_types,
        "player_id": data.player_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"id": alert_id, "status": "set"}


@api_router.get("/alerts")
async def list_alerts(user=Depends(get_current_user)):
    rows = await db.alerts.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    return {"alerts": rows}


# =========================
# Ask AI (Claude Sonnet 4.5 via LiteLLM + Emergent)
# =========================
@api_router.post("/ai/ask")
async def ask_ai(data: AskAIRequest):
    context = ""
    if data.match_id:
        m = mock_data.get_match_by_id(data.match_id)
        if m:
            context = f"\n\nCurrent Match Context: {m['team_a']['name']} vs {m['team_b']['name']} at {m['venue']} ({m['league']}). Status: {m['status']}."

    system_prompt = (
        "You are CricBot, an expert cricket analyst AI for fans watching IPL 2026 and ICC Men's T20 World Cup 2026. "
        "Answer cricket stats questions with precise numbers and a short, engaging insight. "
        "When asked about player stats, cite format (T20/ODI/Test) when relevant. Keep responses concise (3-6 sentences)."
    )

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message=system_prompt,
        ).with_model("anthropic", "claude-sonnet-4-5").with_params(max_tokens=500)
        answer = await chat.send_message(UserMessage(text=data.query + context))
        return {"answer": answer, "query": data.query}
    except Exception as e:
        logger.error(f"AI error: {e}")
        return {"answer": f"I'm having trouble reaching my cricket brain right now ({str(e)[:80]}). Please try again.", "query": data.query, "error": True}


@api_router.get("/ai/win-probability/{match_id}")
async def ai_win_probability(match_id: str):
    m = mock_data.get_match_by_id(match_id)
    if not m:
        raise HTTPException(status_code=404, detail="Match not found")
    # Compute simple probability
    import random
    random.seed(hash(match_id + "wp") % (2**32))
    team_a_pct = random.randint(30, 70)
    return {
        "team_a": m["team_a"],
        "team_b": m["team_b"],
        "team_a_pct": team_a_pct,
        "team_b_pct": 100 - team_a_pct,
    }


# =========================
# Community: polls & chat
# =========================
@api_router.get("/community/polls")
async def get_polls():
    return {"polls": mock_data.get_polls()}


@api_router.post("/community/polls/vote")
async def vote_poll(data: PollVoteRequest, user=Depends(get_current_user)):
    await db.poll_votes.update_one(
        {"user_id": user["id"], "poll_id": data.poll_id},
        {"$set": {"option_index": data.option_index, "voted_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"status": "voted"}


@api_router.post("/community/chat")
async def send_chat(data: ChatMessageCreate, user=Depends(get_current_user)):
    msg = {
        "id": str(uuid.uuid4()),
        "match_id": data.match_id,
        "user_id": user["id"],
        "user_name": user["name"],
        "message": data.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.chat_messages.insert_one(msg.copy())
    return {k: v for k, v in msg.items() if k != "_id"}


@api_router.get("/community/chat/{match_id}")
async def get_chat(match_id: str):
    rows = await db.chat_messages.find({"match_id": match_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    # Seed a few messages if none exist for demo
    if not rows:
        demo = [
            {"id": str(uuid.uuid4()), "match_id": match_id, "user_id": "demo", "user_name": "CricketFan23", "message": "What a shot by Kohli! 🔥", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "match_id": match_id, "user_id": "demo", "user_name": "MIFanForLife", "message": "Bumrah is going to win us this one", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "match_id": match_id, "user_id": "demo", "user_name": "CSKyellow", "message": "Whistle podu! 🟡", "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        return {"messages": demo}
    return {"messages": list(reversed(rows))}


# =========================
# Health
# =========================
@api_router.get("/")
async def root():
    return {"service": "Cricket Live API", "status": "ok", "version": "1.0.0"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
