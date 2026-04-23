"""
CricLive Iteration 3 backend tests.
Covers new features: admin seeding/login, toggle-pro, AI free limit + pro bypass,
notifications, news (public + admin), admin stats/polls/featured, and WebSocket
/ws/live/{match_id}.
"""
import os
import uuid
import json
import asyncio
import pytest
import requests
import websockets
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://runs-analytics.preview.emergentagent.com").rstrip("/")
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "cricket_app")
API = f"{BASE_URL}/api"
# Derive WS URL from HTTPS/HTTP base
WS_BASE = BASE_URL.replace("https://", "wss://").replace("http://", "ws://")

ADMIN_EMAIL = "admin@cric.live"
ADMIN_PASSWORD = "admin1234"

FREE_EMAIL = f"freefan+{uuid.uuid4().hex[:8]}@cric.live"
FREE_PASSWORD = "test1234"
FREE_NAME = "Free Fan"

state = {
    "admin_token": None,
    "free_token": None,
    "free_user_id": None,
    "created_news_id": None,
    "created_poll_id": None,
    "notif_id": None,
}


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def admin_headers():
    assert state["admin_token"]
    return {"Authorization": f"Bearer {state['admin_token']}"}


def free_headers():
    assert state["free_token"]
    return {"Authorization": f"Bearer {state['free_token']}"}


# ===================== Admin login & /auth/me =====================
def test_admin_login(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["user"]["is_admin"] is True, f"admin not flagged: {data['user']}"
    assert data["user"]["is_pro"] is True, f"admin should be pro: {data['user']}"
    state["admin_token"] = data["token"]


def test_me_admin_fields(session):
    r = session.get(f"{API}/auth/me", headers=admin_headers())
    assert r.status_code == 200
    d = r.json()
    assert d["is_admin"] is True and d["is_pro"] is True
    assert "id" in d and d["email"] == ADMIN_EMAIL


# ===================== Free user register + toggle-pro =====================
def test_register_free_user(session):
    r = session.post(f"{API}/auth/register", json={"email": FREE_EMAIL, "password": FREE_PASSWORD, "name": FREE_NAME})
    assert r.status_code == 200, r.text
    d = r.json()
    # Note: new users get a 7-day trial -> is_pro is True during trial by design (iteration5).
    # We immediately backdate trial_ends_at + clear is_pro to simulate an expired-trial free user
    # so the legacy AI-rate-limit tests below keep working.
    assert d["user"]["is_admin"] is False
    state["free_token"] = d["token"]
    state["free_user_id"] = d["user"]["id"]

    cli = MongoClient(MONGO_URL)
    try:
        past = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        res = cli[DB_NAME]["users"].update_one(
            {"id": state["free_user_id"]},
            {"$set": {"trial_ends_at": past, "is_pro": False, "ai_queries_today": 0, "ai_queries_bonus": 0,
                      "ai_queries_date": datetime.now(timezone.utc).strftime("%Y-%m-%d")}},
        )
        assert res.matched_count == 1
    finally:
        cli.close()

    # Confirm is_pro now False via /auth/me
    me = session.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {state['free_token']}"})
    assert me.status_code == 200 and me.json()["is_pro"] is False


def test_toggle_pro_requires_auth(session):
    r = requests.post(f"{API}/auth/toggle-pro")
    assert r.status_code == 401


def test_toggle_pro_flips(session):
    # Flip to pro
    r = session.post(f"{API}/auth/toggle-pro", headers=free_headers())
    assert r.status_code == 200
    assert r.json()["is_pro"] is True
    # Verify via /auth/me
    r2 = session.get(f"{API}/auth/me", headers=free_headers())
    assert r2.json()["is_pro"] is True
    # Flip back to free (needed for the AI-limit test below)
    r3 = session.post(f"{API}/auth/toggle-pro", headers=free_headers())
    assert r3.status_code == 200
    assert r3.json()["is_pro"] is False


# ===================== AI rate-limit =====================
def test_ai_ask_anonymous_works(session):
    r = session.post(f"{API}/ai/ask", json={"query": "Who won IPL 2024?"}, timeout=60)
    assert r.status_code == 200, r.text
    d = r.json()
    assert "answer" in d and len(d["answer"]) > 10
    assert not d.get("limit_reached")


def test_ai_free_user_hits_limit_after_5(session):
    """Send 5 queries as free user (all should succeed), then 6th should return limit_reached:true."""
    for i in range(5):
        r = session.post(
            f"{API}/ai/ask",
            json={"query": f"Q{i} who is top T20 batsman?"},
            headers=free_headers(),
            timeout=60,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert not d.get("limit_reached"), f"unexpected limit_reached at i={i}: {d}"
    # 6th call should be blocked
    r6 = session.post(
        f"{API}/ai/ask",
        json={"query": "6th query"},
        headers=free_headers(),
        timeout=30,
    )
    assert r6.status_code == 200
    d6 = r6.json()
    assert d6.get("limit_reached") is True, f"free user should hit limit: {d6}"
    assert d6.get("is_pro") is False


def test_ai_pro_user_never_hits_limit(session):
    # Promote free user to pro
    r = session.post(f"{API}/auth/toggle-pro", headers=free_headers())
    assert r.status_code == 200 and r.json()["is_pro"] is True
    # Now another call should succeed (no limit_reached)
    r2 = session.post(
        f"{API}/ai/ask",
        json={"query": "As pro, who has most IPL sixes?"},
        headers=free_headers(),
        timeout=60,
    )
    assert r2.status_code == 200
    d2 = r2.json()
    assert not d2.get("limit_reached"), f"pro user got limit_reached: {d2}"
    assert d2.get("is_pro") is True


# ===================== Notifications =====================
def test_notifications_requires_auth(session):
    r = requests.get(f"{API}/notifications")
    assert r.status_code == 401


def test_notifications_auto_seed_for_new_user(session):
    # Register a brand-new user to trigger auto-seed on empty notifications
    email = f"notif+{uuid.uuid4().hex[:8]}@cric.live"
    reg = session.post(f"{API}/auth/register", json={"email": email, "password": "test1234", "name": "N U"})
    assert reg.status_code == 200
    tok = reg.json()["token"]
    r = session.get(f"{API}/notifications", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200
    d = r.json()
    notifs = d.get("notifications", [])
    assert len(notifs) >= 3, f"expected seeded notifs, got {len(notifs)}"
    assert "unread" in d and isinstance(d["unread"], int)
    # Required keys
    for n in notifs:
        for k in ["id", "title", "body", "type", "read", "created_at"]:
            assert k in n, f"notification missing {k}: {n}"
    state["notif_id"] = notifs[0]["id"]
    state["notif_token"] = tok
    # Mark one as read
    mark = session.post(
        f"{API}/notifications/{state['notif_id']}/read",
        headers={"Authorization": f"Bearer {tok}"},
    )
    assert mark.status_code == 200
    # Verify unread count decreased
    r2 = session.get(f"{API}/notifications", headers={"Authorization": f"Bearer {tok}"})
    assert r2.json()["unread"] == d["unread"] - 1


def test_mark_all_read(session):
    tok = state.get("notif_token")
    assert tok
    r = session.post(f"{API}/notifications/mark-all-read", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200
    r2 = session.get(f"{API}/notifications", headers={"Authorization": f"Bearer {tok}"})
    assert r2.json()["unread"] == 0


# ===================== News (public) =====================
def test_public_news_list_seeded(session):
    r = session.get(f"{API}/news")
    assert r.status_code == 200
    news = r.json().get("news", [])
    assert len(news) >= 3, f"expected >=3 seeded items, got {len(news)}"
    for item in news[:3]:
        for k in ["id", "title", "body", "tags", "created_at"]:
            assert k in item


# ===================== Admin: news/polls/stats/featured =====================
def test_admin_create_news(session):
    payload = {"title": "TEST_Admin News", "body": "Hello from test", "tags": ["TEST"], "image_url": None}
    r = session.post(f"{API}/admin/news", json=payload, headers=admin_headers())
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["title"] == payload["title"]
    assert d.get("id")
    state["created_news_id"] = d["id"]
    # Verify visible in public /api/news
    r2 = session.get(f"{API}/news")
    assert any(n["id"] == d["id"] for n in r2.json()["news"])


def test_admin_news_forbidden_for_non_admin(session):
    payload = {"title": "Should not create", "body": "nope", "tags": []}
    r = session.post(f"{API}/admin/news", json=payload, headers=free_headers())
    assert r.status_code == 403, r.text


def test_admin_create_poll(session):
    payload = {"question": "TEST_ Best opener?", "options": ["Kohli", "Rohit", "Gill"]}
    r = session.post(f"{API}/admin/polls", json=payload, headers=admin_headers())
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["question"] == payload["question"]
    assert len(d["options"]) == 3
    for opt in d["options"]:
        assert opt["votes"] == 0
    state["created_poll_id"] = d["id"]


def test_admin_stats(session):
    r = session.get(f"{API}/admin/stats", headers=admin_headers())
    assert r.status_code == 200, r.text
    d = r.json()
    for k in ["users", "pro_users", "alerts", "news", "poll_votes", "chat_messages"]:
        assert k in d and isinstance(d[k], int), f"stats missing {k}"
    # We created at least 1 news & admin+free users are registered
    assert d["users"] >= 2
    assert d["news"] >= 1


def test_admin_stats_forbidden_for_non_admin(session):
    r = session.get(f"{API}/admin/stats", headers=free_headers())
    assert r.status_code == 403


def test_admin_toggle_featured(session):
    r = session.post(
        f"{API}/admin/featured",
        json={"match_id": "m_live_1", "featured": True},
        headers=admin_headers(),
    )
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
    # Toggle off (idempotent upsert)
    r2 = session.post(
        f"{API}/admin/featured",
        json={"match_id": "m_live_1", "featured": False},
        headers=admin_headers(),
    )
    assert r2.status_code == 200


def test_admin_delete_news_cleanup(session):
    nid = state.get("created_news_id")
    if not nid:
        pytest.skip("No news id captured")
    r = session.delete(f"{API}/admin/news/{nid}", headers=admin_headers())
    assert r.status_code == 200
    # Confirm gone
    r2 = session.get(f"{API}/news")
    assert not any(n["id"] == nid for n in r2.json()["news"])


# ===================== WebSocket live score =====================
@pytest.mark.asyncio
async def test_websocket_live_score_stream():
    url = f"{WS_BASE}/api/ws/live/m_live_1"
    messages = []
    try:
        async with websockets.connect(url, open_timeout=10, close_timeout=5) as ws:
            # Collect up to 3 messages or timeout
            for _ in range(3):
                msg = await asyncio.wait_for(ws.recv(), timeout=5)
                messages.append(json.loads(msg))
    except Exception as e:
        pytest.fail(f"WebSocket failed: {e}")

    assert len(messages) >= 3, f"expected 3 msgs, got {len(messages)}"
    # Validate structure of non-terminal messages
    score_msgs = [m for m in messages if "score" in m]
    assert len(score_msgs) >= 1, f"no score messages in {messages}"
    first = score_msgs[0]
    assert first["match_id"] == "m_live_1"
    sc = first["score"]
    for k in ["runs", "wickets", "overs", "balls", "rr"]:
        assert k in sc, f"score missing {k}: {sc}"
    assert isinstance(sc["runs"], int) and sc["runs"] >= 0
    assert isinstance(sc["wickets"], int) and 0 <= sc["wickets"] <= 10
    lb = first.get("last_ball")
    assert lb is not None, f"last_ball missing: {first}"
    assert "runs" in lb and "desc" in lb


@pytest.mark.asyncio
async def test_websocket_bad_match_returns_error():
    url = f"{WS_BASE}/api/ws/live/does_not_exist_xyz"
    try:
        async with websockets.connect(url, open_timeout=10) as ws:
            msg = await asyncio.wait_for(ws.recv(), timeout=5)
            d = json.loads(msg)
            assert "error" in d, f"expected error payload, got {d}"
    except Exception as e:
        pytest.fail(f"WebSocket connect failed: {e}")
