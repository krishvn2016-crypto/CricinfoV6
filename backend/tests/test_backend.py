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


# --- NEW: Commentary enriched fields (shot_type, length, line, wagon_zone, end) ---
def test_commentary_enriched_m_live_1(session):
    r = session.get(f"{API}/matches/m_live_1/commentary")
    assert r.status_code == 200
    comm = r.json().get("commentary", [])
    assert len(comm) > 0, "commentary is empty"
    required_keys = {"shot_type", "length", "line", "wagon_zone", "end"}
    for b in comm:
        missing = required_keys - set(b.keys())
        assert not missing, f"ball missing keys {missing}: {b}"
        assert b["length"] in [
            "Full toss", "Yorker", "Full", "Good length", "Back of length", "Short"
        ], f"bad length {b['length']}"
        assert b["end"] in ["Pavilion End", "City End"], f"bad end {b['end']}"
    # Boundaries and wickets must have shot_type populated
    for b in comm:
        if b.get("wicket") or b.get("runs", 0) in (4, 6):
            assert b["shot_type"], f"boundary/wicket ball missing shot_type: {b}"
            assert b["wagon_zone"], f"boundary/wicket ball missing wagon_zone: {b}"


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


# --- NEW: Partnerships with rr, boundaries, timeline ---
def test_partnerships_enriched_m_live_1(session):
    r = session.get(f"{API}/matches/m_live_1/partnerships")
    assert r.status_code == 200
    parts = r.json().get("partnerships", [])
    assert len(parts) >= 1, "no partnerships returned"
    for p in parts:
        for k in ["runs", "balls", "rr", "boundaries", "timeline"]:
            assert k in p, f"partnership missing {k}: {p.keys()}"
        assert isinstance(p["rr"], (int, float))
        assert "fours" in p["boundaries"] and "sixes" in p["boundaries"]
        assert isinstance(p["timeline"], list)
        # timeline length ~ balls field (allow a little slack since loop may break early)
        assert abs(len(p["timeline"]) - p["balls"]) <= 2, (
            f"timeline {len(p['timeline'])} vs balls {p['balls']}"
        )
        # Cumulative runs must be monotonically non-decreasing and end equals runs
        cum = 0
        for t in p["timeline"]:
            assert t["cum_runs"] >= cum
            cum = t["cum_runs"]
        if p["timeline"]:
            assert p["timeline"][-1]["cum_runs"] == p["runs"]


def test_predicted_xi(session):
    mid = state["live_match_id"]
    r = session.get(f"{API}/matches/{mid}/predicted-xi")
    assert r.status_code == 200
    p = r.json()
    assert "team_a" in p and "team_b" in p


# --- NEW: Umpires, Playing XI, Venues ---
def test_match_umpires_m_live_1(session):
    r = session.get(f"{API}/matches/m_live_1/umpires")
    assert r.status_code == 200
    u = r.json()
    assert isinstance(u.get("on_field"), list) and len(u["on_field"]) == 2
    assert u.get("tv_umpire") and u["tv_umpire"].get("name")
    assert u.get("reserve") and u["reserve"].get("name")
    assert u.get("match_referee") and u["match_referee"].get("name")


def test_playing_xi_m_live_1(session):
    r = session.get(f"{API}/matches/m_live_1/playing-xi")
    assert r.status_code == 200
    d = r.json()
    for side in ["team_a", "team_b"]:
        assert side in d
        xi = d[side].get("playing_xi", [])
        assert 1 <= len(xi) <= 11
        for pl in xi:
            assert "career" in pl and "at_venue" in pl and "vs_opponent" in pl
            assert pl.get("speciality") and pl.get("best_fielding_position")


def test_venue_by_name(session):
    r = session.get(f"{API}/venues", params={"name": "Wankhede Stadium, Mumbai"})
    assert r.status_code == 200
    v = r.json()
    assert v.get("city") == "Mumbai"
    assert "pitch_type" in v and "avg_1st_innings" in v


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


# --- NEW: Player enrichment (Virat Kohli - p1) ---
def test_player_detail_p1_kohli_enrichment(session):
    r = session.get(f"{API}/players/p1")
    assert r.status_code == 200, r.text
    p = r.json()
    assert p["name"] == "Virat Kohli"
    assert p.get("speciality"), "speciality missing"
    assert p.get("best_fielding_position"), "best_fielding_position missing"
    st = p.get("stats", {})
    # Per-format batting avg
    ba = st.get("batting_avg")
    assert isinstance(ba, dict) and {"T20", "ODI", "Test"} <= set(ba.keys()), f"batting_avg bad: {ba}"
    for fmt in ["T20", "ODI", "Test"]:
        assert isinstance(ba[fmt], (int, float)) and ba[fmt] > 0
    # Per-format bowling avg (Kohli has 4 wickets → should be non-null)
    bowl = st.get("bowling_avg")
    assert bowl is not None, "Kohli has wickets > 0 so bowling_avg should be present"
    assert {"T20", "ODI", "Test"} <= set(bowl.keys())
    # MoTM / MoS counts
    assert isinstance(st.get("motm_count"), int) and st["motm_count"] >= 0
    assert isinstance(st.get("mos_count"), int) and st["mos_count"] >= 0
    # wk_stats for non-keeper should be None
    assert st.get("wk_stats") is None, "Kohli is not keeper; wk_stats must be None"
    # Top venues & vs teams
    tv = p.get("top_venues")
    assert isinstance(tv, list) and len(tv) == 5
    for v in tv:
        assert "venue" in v and "matches" in v and "runs" in v and "avg" in v
    vt = p.get("vs_teams")
    assert isinstance(vt, list) and len(vt) == 6
    for row in vt:
        assert row.get("team", {}).get("id") != p.get("team_id"), "vs_teams must exclude own team"
        for k in ["matches", "runs", "avg", "sr"]:
            assert k in row, f"vs_teams row missing {k}"


# --- NEW: Player enrichment (MS Dhoni - p3 Wicket-keeper) ---
def test_player_detail_p3_dhoni_wk_stats(session):
    r = session.get(f"{API}/players/p3")
    assert r.status_code == 200
    p = r.json()
    assert p["name"] == "MS Dhoni"
    assert p["role"] == "Wicket-keeper"
    wk = p.get("stats", {}).get("wk_stats")
    assert wk is not None, "Dhoni wk_stats must be non-null"
    for k in ["dismissals", "stumpings", "catches_behind"]:
        assert k in wk and isinstance(wk[k], int) and wk[k] > 0, f"wk_stats.{k} bad: {wk}"


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
