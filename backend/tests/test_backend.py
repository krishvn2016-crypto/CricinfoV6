"""
CricLive Backend API tests
Covers: health, auth, matches, players, teams, top-performers, home-feed,
follow/unfollow, alerts, AI (ask + win-probability), community polls/chat.
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://runs-analytics.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

TEST_EMAIL = f"testfan+{uuid.uuid4().hex[:8]}@cric.live"
TEST_PASSWORD = "test1234"
TEST_NAME = "Test Fan"

# shared state across tests
state = {"token": None, "user_id": None, "live_match_id": None, "poll_id": None}


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def auth_headers():
    assert state["token"], "No token; register/login failed"
    return {"Authorization": f"Bearer {state['token']}"}


# =============== Health ===============
def test_health(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"


# =============== Auth ===============
def test_register(session):
    r = session.post(f"{API}/auth/register", json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "name": TEST_NAME})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and "user" in data
    assert data["user"]["email"] == TEST_EMAIL.lower()
    assert data["user"]["name"] == TEST_NAME
    state["token"] = data["token"]
    state["user_id"] = data["user"]["id"]


def test_register_duplicate(session):
    r = session.post(f"{API}/auth/register", json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "name": TEST_NAME})
    assert r.status_code == 400


def test_login(session):
    r = session.post(f"{API}/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data
    state["token"] = data["token"]


def test_login_wrong_password(session):
    r = session.post(f"{API}/auth/login", json={"email": TEST_EMAIL, "password": "wrongpass"})
    assert r.status_code == 401


def test_me(session):
    r = session.get(f"{API}/auth/me", headers=auth_headers())
    assert r.status_code == 200
    assert r.json()["email"] == TEST_EMAIL.lower()


def test_me_without_token(session):
    r = requests.get(f"{API}/auth/me")
    assert r.status_code == 401


# =============== Matches ===============
def test_live_matches(session):
    r = session.get(f"{API}/matches/live")
    assert r.status_code == 200
    matches = r.json().get("matches", [])
    assert isinstance(matches, list) and len(matches) >= 1
    m = matches[0]
    for key in ["id", "team_a", "team_b", "venue", "status"]:
        assert key in m, f"missing {key}"
    state["live_match_id"] = m["id"]
    # At least one field should exist for batters/bowler/recent balls
    assert any(k in m for k in ["batsmen", "current_batsmen", "recent_balls", "bowler", "win_probability"]), f"live match missing live fields: {list(m.keys())}"


def test_upcoming_matches(session):
    r = session.get(f"{API}/matches/upcoming")
    assert r.status_code == 200
    assert isinstance(r.json().get("matches"), list)


def test_completed_matches(session):
    r = session.get(f"{API}/matches/completed")
    assert r.status_code == 200
    assert isinstance(r.json().get("matches"), list)


def test_match_detail(session):
    mid = state["live_match_id"]
    r = session.get(f"{API}/matches/{mid}")
    assert r.status_code == 200
    m = r.json()
    assert m["id"] == mid


def test_match_detail_404(session):
    r = session.get(f"{API}/matches/does-not-exist-xyz")
    assert r.status_code == 404


def test_scorecard(session):
    mid = state["live_match_id"]
    r = session.get(f"{API}/matches/{mid}/scorecard")
    assert r.status_code == 200
    sc = r.json()
    # Expect innings1 structure
    assert "innings1" in sc or "innings_1" in sc, f"scorecard keys: {list(sc.keys())}"


def test_commentary(session):
    mid = state["live_match_id"]
    r = session.get(f"{API}/matches/{mid}/commentary")
    assert r.status_code == 200
    comm = r.json().get("commentary", [])
    assert isinstance(comm, list)


def test_manhattan(session):
    mid = state["live_match_id"]
    r = session.get(f"{API}/matches/{mid}/manhattan")
    assert r.status_code == 200
    m = r.json().get("manhattan", [])
    assert isinstance(m, list) and len(m) >= 10


def test_partnerships(session):
    mid = state["live_match_id"]
    r = session.get(f"{API}/matches/{mid}/partnerships")
    assert r.status_code == 200
    assert isinstance(r.json().get("partnerships", []), list)


def test_predicted_xi(session):
    mid = state["live_match_id"]
    r = session.get(f"{API}/matches/{mid}/predicted-xi")
    assert r.status_code == 200
    p = r.json()
    assert "team_a" in p and "team_b" in p


# =============== Players & Teams ===============
def test_players_list(session):
    r = session.get(f"{API}/players")
    assert r.status_code == 200
    players = r.json().get("players", [])
    assert len(players) >= 1
    state["player_id"] = players[0]["id"]


def test_player_detail(session):
    r = session.get(f"{API}/players/{state['player_id']}")
    assert r.status_code == 200
    p = r.json()
    assert isinstance(p.get("recent_form"), list) and len(p["recent_form"]) == 10


def test_teams_list(session):
    r = session.get(f"{API}/teams")
    assert r.status_code == 200
    teams = r.json().get("teams", [])
    assert len(teams) >= 1
    state["team_id"] = teams[0]["id"]


def test_team_detail(session):
    r = session.get(f"{API}/teams/{state['team_id']}")
    assert r.status_code == 200
    t = r.json()
    assert isinstance(t.get("squad"), list)


def test_top_performers(session):
    r = session.get(f"{API}/top-performers")
    assert r.status_code == 200
    tp = r.json()
    for key in ["highest_runs", "most_sixes", "most_fours", "best_catches", "most_wickets"]:
        assert key in tp, f"top-performers missing {key}"
        assert isinstance(tp[key], list)


# =============== Home feed ===============
def test_home_feed_anon(session):
    r = session.get(f"{API}/home-feed")
    assert r.status_code == 200
    data = r.json()
    for key in ["live", "upcoming", "top_performers"]:
        assert key in data


def test_home_feed_auth(session):
    r = session.get(f"{API}/home-feed", headers=auth_headers())
    assert r.status_code == 200
    assert "personalized_matches" in r.json()


# =============== Follow / Unfollow ===============
def test_follow_team(session):
    r = session.post(f"{API}/follow", json={"target_type": "team", "target_id": state["team_id"]}, headers=auth_headers())
    assert r.status_code == 200


def test_follow_player(session):
    r = session.post(f"{API}/follow", json={"target_type": "player", "target_id": state["player_id"]}, headers=auth_headers())
    assert r.status_code == 200


def test_following_list(session):
    r = session.get(f"{API}/following", headers=auth_headers())
    assert r.status_code == 200
    data = r.json()
    assert any(t["id"] == state["team_id"] for t in data.get("teams", []))
    assert any(p["id"] == state["player_id"] for p in data.get("players", []))


def test_unfollow_team(session):
    r = session.post(f"{API}/unfollow", json={"target_type": "team", "target_id": state["team_id"]}, headers=auth_headers())
    assert r.status_code == 200
    r2 = session.get(f"{API}/following", headers=auth_headers())
    teams = r2.json().get("teams", [])
    assert not any(t["id"] == state["team_id"] for t in teams)


# =============== Alerts ===============
def test_set_alert(session):
    r = session.post(
        f"{API}/alerts",
        json={"match_id": state["live_match_id"], "alert_types": ["wicket", "boundary"]},
        headers=auth_headers(),
    )
    assert r.status_code == 200
    assert r.json().get("status") == "set"


# =============== AI ===============
def test_ai_ask(session):
    r = session.post(
        f"{API}/ai/ask",
        json={"query": "What is Virat Kohli IPL batting average?"},
        timeout=45,
    )
    assert r.status_code == 200, r.text
    data = r.json()
    assert "answer" in data
    assert not data.get("error"), f"AI returned error: {data.get('answer')}"
    assert len(data["answer"]) > 20


def test_ai_win_probability(session):
    r = session.get(f"{API}/ai/win-probability/{state['live_match_id']}")
    assert r.status_code == 200
    d = r.json()
    assert d["team_a_pct"] + d["team_b_pct"] == 100


# =============== Community ===============
def test_polls_list(session):
    r = session.get(f"{API}/community/polls")
    assert r.status_code == 200
    polls = r.json().get("polls", [])
    assert len(polls) >= 1
    state["poll_id"] = polls[0]["id"]


def test_poll_vote(session):
    r = session.post(
        f"{API}/community/polls/vote",
        json={"poll_id": state["poll_id"], "option_index": 0},
        headers=auth_headers(),
    )
    assert r.status_code == 200


def test_poll_vote_requires_auth(session):
    r = requests.post(f"{API}/community/polls/vote", json={"poll_id": state["poll_id"], "option_index": 0})
    assert r.status_code == 401


def test_chat_get(session):
    r = session.get(f"{API}/community/chat/{state['live_match_id']}")
    assert r.status_code == 200
    assert isinstance(r.json().get("messages", []), list)


def test_chat_post(session):
    r = session.post(
        f"{API}/community/chat",
        json={"match_id": state["live_match_id"], "message": "TEST_ Hello cricket fans!"},
        headers=auth_headers(),
    )
    assert r.status_code == 200
    msg = r.json()
    assert msg["message"].startswith("TEST_")
    # Verify persistence
    r2 = session.get(f"{API}/community/chat/{state['live_match_id']}")
    assert any(m.get("message", "").startswith("TEST_") for m in r2.json().get("messages", []))
