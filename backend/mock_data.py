"""
Rich mock data for IPL 2026 & ICC Men's T20 World Cup 2026.
Used as a fallback when Sportmonks data is unavailable or for demo/offline mode.
"""
from datetime import datetime, timezone, timedelta
import random

# Teams (IPL 2026 + international for T20 WC)
TEAMS = [
    {"id": "t1", "name": "Mumbai Indians", "short": "MI", "primary": "#004BA0", "secondary": "#D1AB3E", "country": "India", "league": "IPL"},
    {"id": "t2", "name": "Chennai Super Kings", "short": "CSK", "primary": "#F9CD05", "secondary": "#0081C8", "country": "India", "league": "IPL"},
    {"id": "t3", "name": "Royal Challengers Bengaluru", "short": "RCB", "primary": "#E30613", "secondary": "#000000", "country": "India", "league": "IPL"},
    {"id": "t4", "name": "Kolkata Knight Riders", "short": "KKR", "primary": "#6A0DAD", "secondary": "#F5B722", "country": "India", "league": "IPL"},
    {"id": "t5", "name": "Delhi Capitals", "short": "DC", "primary": "#17449B", "secondary": "#EF1C25", "country": "India", "league": "IPL"},
    {"id": "t6", "name": "Sunrisers Hyderabad", "short": "SRH", "primary": "#F26522", "secondary": "#000000", "country": "India", "league": "IPL"},
    {"id": "t7", "name": "Rajasthan Royals", "short": "RR", "primary": "#EA1A85", "secondary": "#254AA5", "country": "India", "league": "IPL"},
    {"id": "t8", "name": "Punjab Kings", "short": "PBKS", "primary": "#DD1F2D", "secondary": "#A7A9AC", "country": "India", "league": "IPL"},
    {"id": "t9", "name": "Gujarat Titans", "short": "GT", "primary": "#1C2B5D", "secondary": "#B9A050", "country": "India", "league": "IPL"},
    {"id": "t10", "name": "Lucknow Super Giants", "short": "LSG", "primary": "#005F9E", "secondary": "#F39200", "country": "India", "league": "IPL"},
    {"id": "t11", "name": "India", "short": "IND", "primary": "#0033A0", "secondary": "#FF9933", "country": "India", "league": "International"},
    {"id": "t12", "name": "Australia", "short": "AUS", "primary": "#FFCD00", "secondary": "#00843D", "country": "Australia", "league": "International"},
    {"id": "t13", "name": "England", "short": "ENG", "primary": "#1E22AA", "secondary": "#E03A3E", "country": "England", "league": "International"},
    {"id": "t14", "name": "Pakistan", "short": "PAK", "primary": "#01411C", "secondary": "#FFFFFF", "country": "Pakistan", "league": "International"},
    {"id": "t15", "name": "South Africa", "short": "SA", "primary": "#007749", "secondary": "#FFB81C", "country": "South Africa", "league": "International"},
    {"id": "t16", "name": "New Zealand", "short": "NZ", "primary": "#000000", "secondary": "#C0C0C0", "country": "New Zealand", "league": "International"},
]

# Players
PLAYERS = [
    {"id": "p1", "name": "Virat Kohli", "team_id": "t3", "country": "India", "role": "Batter", "batting_style": "Right-hand bat", "bowling_style": "Right-arm medium",
     "stats": {"matches": 252, "runs": 8162, "avg": 38.33, "sr": 132.12, "hundreds": 8, "fifties": 58, "sixes": 272, "fours": 727, "wickets": 4, "catches": 117}},
    {"id": "p2", "name": "Rohit Sharma", "team_id": "t1", "country": "India", "role": "Batter", "batting_style": "Right-hand bat", "bowling_style": "Right-arm off break",
     "stats": {"matches": 257, "runs": 6628, "avg": 30.03, "sr": 131.08, "hundreds": 2, "fifties": 43, "sixes": 289, "fours": 605, "wickets": 15, "catches": 96}},
    {"id": "p3", "name": "MS Dhoni", "team_id": "t2", "country": "India", "role": "Wicket-keeper", "batting_style": "Right-hand bat", "bowling_style": "Right-arm medium",
     "stats": {"matches": 264, "runs": 5243, "avg": 38.86, "sr": 137.56, "hundreds": 0, "fifties": 24, "sixes": 252, "fours": 363, "wickets": 0, "catches": 143}},
    {"id": "p4", "name": "Jasprit Bumrah", "team_id": "t1", "country": "India", "role": "Bowler", "batting_style": "Right-hand bat", "bowling_style": "Right-arm fast",
     "stats": {"matches": 133, "runs": 68, "avg": 8.5, "sr": 84.0, "wickets": 165, "economy": 7.32, "catches": 28}},
    {"id": "p5", "name": "Ruturaj Gaikwad", "team_id": "t2", "country": "India", "role": "Batter", "batting_style": "Right-hand bat", "bowling_style": "Right-arm off break",
     "stats": {"matches": 75, "runs": 2534, "avg": 39.59, "sr": 138.74, "hundreds": 1, "fifties": 22, "sixes": 88, "fours": 252, "wickets": 0, "catches": 33}},
    {"id": "p6", "name": "Hardik Pandya", "team_id": "t1", "country": "India", "role": "All-rounder", "batting_style": "Right-hand bat", "bowling_style": "Right-arm medium-fast",
     "stats": {"matches": 141, "runs": 2753, "avg": 31.29, "sr": 145.09, "fifties": 10, "sixes": 126, "fours": 199, "wickets": 66, "economy": 8.73, "catches": 62}},
    {"id": "p7", "name": "Shubman Gill", "team_id": "t9", "country": "India", "role": "Batter", "batting_style": "Right-hand bat", "bowling_style": "Right-arm off break",
     "stats": {"matches": 103, "runs": 3321, "avg": 39.53, "sr": 136.23, "hundreds": 1, "fifties": 27, "sixes": 104, "fours": 338, "wickets": 0, "catches": 43}},
    {"id": "p8", "name": "Rashid Khan", "team_id": "t9", "country": "Afghanistan", "role": "Bowler", "batting_style": "Right-hand bat", "bowling_style": "Right-arm leg break",
     "stats": {"matches": 132, "runs": 562, "avg": 20.81, "sr": 155.24, "wickets": 158, "economy": 7.51, "catches": 46}},
    {"id": "p9", "name": "Travis Head", "team_id": "t6", "country": "Australia", "role": "Batter", "batting_style": "Left-hand bat", "bowling_style": "Right-arm off break",
     "stats": {"matches": 28, "runs": 1053, "avg": 43.87, "sr": 186.96, "hundreds": 1, "fifties": 6, "sixes": 64, "fours": 121, "wickets": 0, "catches": 12}},
    {"id": "p10", "name": "Sunil Narine", "team_id": "t4", "country": "West Indies", "role": "All-rounder", "batting_style": "Left-hand bat", "bowling_style": "Right-arm off break",
     "stats": {"matches": 176, "runs": 1534, "avg": 16.85, "sr": 174.12, "fifties": 6, "sixes": 103, "fours": 155, "wickets": 183, "economy": 6.74, "catches": 55}},
    {"id": "p11", "name": "Heinrich Klaasen", "team_id": "t6", "country": "South Africa", "role": "Wicket-keeper", "batting_style": "Right-hand bat", "bowling_style": "Right-arm off break",
     "stats": {"matches": 56, "runs": 1923, "avg": 41.80, "sr": 175.13, "fifties": 14, "sixes": 129, "fours": 163, "wickets": 0, "catches": 38}},
    {"id": "p12", "name": "Glenn Maxwell", "team_id": "t3", "country": "Australia", "role": "All-rounder", "batting_style": "Right-hand bat", "bowling_style": "Right-arm off break",
     "stats": {"matches": 134, "runs": 2719, "avg": 25.89, "sr": 154.57, "hundreds": 1, "fifties": 13, "sixes": 176, "fours": 240, "wickets": 36, "economy": 8.05, "catches": 65}},
    {"id": "p13", "name": "Andre Russell", "team_id": "t4", "country": "West Indies", "role": "All-rounder", "batting_style": "Right-hand bat", "bowling_style": "Right-arm fast-medium",
     "stats": {"matches": 126, "runs": 2651, "avg": 29.13, "sr": 174.79, "fifties": 13, "sixes": 214, "fours": 160, "wickets": 109, "economy": 9.11, "catches": 59}},
    {"id": "p14", "name": "Rishabh Pant", "team_id": "t5", "country": "India", "role": "Wicket-keeper", "batting_style": "Left-hand bat", "bowling_style": "N/A",
     "stats": {"matches": 111, "runs": 3284, "avg": 35.70, "sr": 147.97, "hundreds": 1, "fifties": 18, "sixes": 134, "fours": 325, "wickets": 0, "catches": 78}},
    {"id": "p15", "name": "Suryakumar Yadav", "team_id": "t1", "country": "India", "role": "Batter", "batting_style": "Right-hand bat", "bowling_style": "Right-arm medium",
     "stats": {"matches": 146, "runs": 3437, "avg": 30.14, "sr": 141.77, "fifties": 23, "sixes": 150, "fours": 348, "wickets": 0, "catches": 62}},
]

# Enrich each player with additional detail stats (per-format, MoTM/MoS, WK stats, speciality, fielding)
_SPECIALITY = {
    "Batter": ["Top-order anchor", "Middle-order finisher", "Power-hitter", "Opener"],
    "Bowler": ["Death-overs specialist", "New-ball specialist", "Yorker expert", "Spin wizard"],
    "All-rounder": ["Finisher + death bowler", "Power-hitter + spin", "Top-order + part-time"],
    "Wicket-keeper": ["Keeper-batter finisher", "Opening keeper-batter", "Middle-order keeper"],
}
_FIELDING = {
    "Batter": ["Cover", "Mid-wicket", "Point", "Deep mid-wicket", "Long-on"],
    "Bowler": ["Fine leg", "Third man", "Long-on", "Deep mid-wicket"],
    "All-rounder": ["Mid-off", "Cover", "Long-off", "Point"],
    "Wicket-keeper": ["Wicket-keeper"],
}
for _p in PLAYERS:
    _seed = hash(_p["id"] + "enrich") % (2**32)
    _r = random.Random(_seed)
    s = _p["stats"]
    # per-format batting avg
    base_avg = s.get("avg", 25.0)
    s["batting_avg"] = {"T20": round(base_avg, 2), "ODI": round(base_avg * _r.uniform(1.05, 1.3), 2), "Test": round(base_avg * _r.uniform(0.9, 1.2), 2)}
    # per-format bowling avg (only meaningful for bowlers/all-rounders)
    if s.get("wickets", 0) > 0:
        bb = _r.uniform(22, 32)
        s["bowling_avg"] = {"T20": round(bb, 2), "ODI": round(bb * _r.uniform(0.9, 1.15), 2), "Test": round(bb * _r.uniform(0.85, 1.1), 2)}
    else:
        s["bowling_avg"] = None
    s["motm_count"] = _r.randint(3, 38)
    s["mos_count"] = _r.randint(0, 6)
    # Wicket-keeping stats (only meaningful for keepers)
    if _p["role"] == "Wicket-keeper":
        s["wk_stats"] = {
            "dismissals": _r.randint(110, 220),
            "stumpings": _r.randint(20, 55),
            "catches_behind": _r.randint(90, 180),
        }
    else:
        s["wk_stats"] = None
    _p["speciality"] = _r.choice(_SPECIALITY.get(_p["role"], ["All-format pro"]))
    _p["best_fielding_position"] = _r.choice(_FIELDING.get(_p["role"], ["Cover"]))


# Umpires pool (ICC Elite Panel + domestic)
UMPIRES = [
    {"id": "u1", "name": "Kumar Dharmasena", "country": "Sri Lanka", "role": "Elite Panel"},
    {"id": "u2", "name": "Richard Illingworth", "country": "England", "role": "Elite Panel"},
    {"id": "u3", "name": "Nitin Menon", "country": "India", "role": "Elite Panel"},
    {"id": "u4", "name": "Marais Erasmus", "country": "South Africa", "role": "Elite Panel"},
    {"id": "u5", "name": "Paul Reiffel", "country": "Australia", "role": "Elite Panel"},
    {"id": "u6", "name": "Chris Gaffaney", "country": "New Zealand", "role": "Elite Panel"},
    {"id": "u7", "name": "Virender Sharma", "country": "India", "role": "Domestic"},
    {"id": "u8", "name": "Anil Chaudhary", "country": "India", "role": "Domestic"},
]

def get_umpires_for_match(match_id: str):
    """Deterministically assign 4 umpires for a match: 2 on-field, 1 TV, 1 reserve."""
    rng = random.Random(hash(match_id + "umpires") % (2**32))
    picks = rng.sample(UMPIRES, 4)
    return {
        "on_field": [{**picks[0], "role_in_match": "On-field"}, {**picks[1], "role_in_match": "On-field"}],
        "tv_umpire": {**picks[2], "role_in_match": "TV Umpire"},
        "reserve": {**picks[3], "role_in_match": "Reserve"},
        "match_referee": {"name": "Javagal Srinath", "country": "India", "role_in_match": "Match Referee"},
    }


# Venues with records
_VENUES = {
    "Wankhede Stadium, Mumbai": {"capacity": 33108, "city": "Mumbai", "country": "India", "ends": ["Tata End", "Garware Pavilion End"], "avg_1st_innings": 172, "highest_total": "235/1", "highest_chased": 215, "pitch_type": "Batting-friendly, true bounce"},
    "M. Chinnaswamy Stadium, Bengaluru": {"capacity": 40000, "city": "Bengaluru", "country": "India", "ends": ["Pavilion End", "BEML End"], "avg_1st_innings": 178, "highest_total": "263/5", "highest_chased": 226, "pitch_type": "Small ground, high-scoring"},
    "Narendra Modi Stadium, Ahmedabad": {"capacity": 132000, "city": "Ahmedabad", "country": "India", "ends": ["Adani Pavilion End", "Reliance End"], "avg_1st_innings": 165, "highest_total": "233/3", "highest_chased": 211, "pitch_type": "Balanced, good for both"},
    "M.A. Chidambaram Stadium, Chennai": {"capacity": 50000, "city": "Chennai", "country": "India", "ends": ["A Pavilion End", "V Pattabhiraman End"], "avg_1st_innings": 162, "highest_total": "211/4", "highest_chased": 206, "pitch_type": "Spin-friendly"},
    "Eden Gardens, Kolkata": {"capacity": 66000, "city": "Kolkata", "country": "India", "ends": ["High Court End", "Pavilion End"], "avg_1st_innings": 168, "highest_total": "232/2", "highest_chased": 207, "pitch_type": "Dew-affected, chase-friendly"},
    "Arun Jaitley Stadium, Delhi": {"capacity": 41842, "city": "Delhi", "country": "India", "ends": ["Pavilion End", "Gautam Gambhir Pavilion End"], "avg_1st_innings": 167, "highest_total": "231/4", "highest_chased": 209, "pitch_type": "True bounce, some help for seamers"},
    "Sawai Mansingh Stadium, Jaipur": {"capacity": 30000, "city": "Jaipur", "country": "India", "ends": ["RCA Pavilion End", "Press Box End"], "avg_1st_innings": 172, "highest_total": "223/2", "highest_chased": 218, "pitch_type": "Flat, high-scoring"},
}

def get_venue_info(venue_name: str):
    return _VENUES.get(venue_name, {"city": venue_name.split(",")[-1].strip() if "," in venue_name else venue_name, "country": "India", "pitch_type": "Balanced", "avg_1st_innings": 165})


def get_player_venue_record(player_id: str, venue_name: str):
    rng = random.Random(hash(player_id + venue_name) % (2**32))
    matches = rng.randint(3, 18)
    runs = rng.randint(80, 650)
    return {
        "matches": matches,
        "runs": runs,
        "avg": round(runs / max(matches - 1, 1), 2),
        "highest": rng.randint(34, 115),
        "sr": round(rng.uniform(118, 165), 2),
        "wickets": rng.randint(0, 22),
    }


def get_player_vs_team_record(player_id: str, opponent_team_id: str):
    rng = random.Random(hash(player_id + opponent_team_id + "vs") % (2**32))
    matches = rng.randint(4, 22)
    runs = rng.randint(120, 780)
    return {
        "matches": matches,
        "runs": runs,
        "avg": round(runs / max(matches - 2, 1), 2),
        "highest": rng.randint(38, 128),
        "sr": round(rng.uniform(118, 162), 2),
        "wickets": rng.randint(0, 28),
    }


def get_playing_xi_with_stats(match_id: str):
    """Final Playing XI for both teams with detailed match-context stats."""
    match = get_match_by_id(match_id)
    if not match:
        return None
    venue = match["venue"]

    def build_side(team_id: str, opponent_team_id: str):
        team = get_team(team_id)
        squad = [p for p in PLAYERS if p["team_id"] == team_id]
        rng = random.Random(hash(match_id + team_id + "xi") % (2**32))
        if len(squad) < 5:
            pool = squad + rng.sample([p for p in PLAYERS if p["team_id"] != team_id], 11 - len(squad))
        else:
            pool = squad + rng.sample([p for p in PLAYERS if p["team_id"] != team_id and p not in squad], max(0, 11 - len(squad)))
        xi = pool[:11] if len(pool) >= 11 else pool
        enriched = []
        for p in xi:
            enriched.append({
                "id": p["id"], "name": p["name"], "country": p["country"], "role": p["role"],
                "speciality": p.get("speciality"),
                "best_fielding_position": p.get("best_fielding_position"),
                "batting_style": p["batting_style"], "bowling_style": p["bowling_style"],
                "career": {
                    "matches": p["stats"]["matches"],
                    "runs": p["stats"].get("runs"),
                    "batting_avg": p["stats"].get("batting_avg"),
                    "sr": p["stats"].get("sr"),
                    "wickets": p["stats"].get("wickets"),
                    "bowling_avg": p["stats"].get("bowling_avg"),
                    "economy": p["stats"].get("economy"),
                    "catches": p["stats"].get("catches"),
                    "motm": p["stats"].get("motm_count"),
                    "mos": p["stats"].get("mos_count"),
                    "wk_stats": p["stats"].get("wk_stats"),
                },
                "at_venue": get_player_venue_record(p["id"], venue),
                "vs_opponent": get_player_vs_team_record(p["id"], opponent_team_id),
            })
        # Captain & keeper assignment
        cap_idx = 0
        for i, x in enumerate(enriched):
            if x["role"] == "Wicket-keeper":
                x["is_keeper"] = True
        enriched[cap_idx]["is_captain"] = True
        return {"team": team, "playing_xi": enriched}

    return {
        "team_a": build_side(match["team_a"]["id"], match["team_b"]["id"]),
        "team_b": build_side(match["team_b"]["id"], match["team_a"]["id"]),
    }


def get_team(tid):
    return next((t for t in TEAMS if t["id"] == tid), None)


def get_player(pid):
    return next((p for p in PLAYERS if p["id"] == pid), None)
    return next((t for t in TEAMS if t["id"] == tid), None)

def get_player(pid):
    return next((p for p in PLAYERS if p["id"] == pid), None)


def _ball_outcome():
    r = random.random()
    if r < 0.02: return {"runs": 0, "wicket": True, "desc": "OUT!"}
    if r < 0.10: return {"runs": 6, "desc": "SIX!"}
    if r < 0.25: return {"runs": 4, "desc": "FOUR!"}
    if r < 0.45: return {"runs": 1, "desc": "Single"}
    if r < 0.55: return {"runs": 2, "desc": "Two runs"}
    if r < 0.58: return {"runs": 3, "desc": "Three runs"}
    return {"runs": 0, "desc": "No run"}


def build_live_match(match_id, team_a_id, team_b_id, venue, league="IPL 2026"):
    """Build a dynamic live match with randomized in-progress state."""
    random.seed(hash(match_id) % (2**32))
    ta = get_team(team_a_id)
    tb = get_team(team_b_id)

    overs_done = random.randint(8, 16)
    balls = random.randint(0, 5)
    wickets = random.randint(1, 4)
    score = random.randint(70, 180)

    # Target scenario
    target = random.randint(170, 220)
    batting_first = random.choice([True, False])

    batsmen = random.sample([p for p in PLAYERS if p["team_id"] == team_a_id], min(2, len([p for p in PLAYERS if p["team_id"] == team_a_id])))
    if len(batsmen) < 2:
        batsmen = random.sample(PLAYERS, 2)
    bowlers = [p for p in PLAYERS if p["team_id"] == team_b_id and "Bowler" in p["role"] or "All-rounder" in p["role"]]
    if not bowlers:
        bowlers = random.sample(PLAYERS, 1)
    bowler = bowlers[0] if bowlers else random.choice(PLAYERS)

    b1_runs = random.randint(12, 78)
    b1_balls = random.randint(b1_runs // 2, max(b1_runs, 50))
    b2_runs = random.randint(5, 45)
    b2_balls = random.randint(b2_runs // 2, max(b2_runs, 35))

    return {
        "id": match_id,
        "status": "live",
        "league": league,
        "venue": venue,
        "start_time": datetime.now(timezone.utc).isoformat(),
        "team_a": ta,
        "team_b": tb,
        "batting_team_id": team_a_id,
        "bowling_team_id": team_b_id,
        "innings": 2 if not batting_first else 1,
        "score": {
            "runs": score,
            "wickets": wickets,
            "overs": overs_done,
            "balls": balls,
            "target": target if not batting_first else None,
            "rr": round(score / max(overs_done + balls/6, 1), 2),
            "rrr": round((target - score) / max(20 - overs_done - balls/6, 0.1), 2) if not batting_first else None,
        },
        "current_batsmen": [
            {"player": batsmen[0], "runs": b1_runs, "balls": b1_balls, "fours": random.randint(2, 8), "sixes": random.randint(0, 4), "sr": round((b1_runs/max(b1_balls,1))*100, 2), "on_strike": True},
            {"player": batsmen[1], "runs": b2_runs, "balls": b2_balls, "fours": random.randint(0, 5), "sixes": random.randint(0, 2), "sr": round((b2_runs/max(b2_balls,1))*100, 2), "on_strike": False},
        ],
        "current_bowler": {"player": bowler, "overs": round(random.uniform(1.0, 3.5), 1), "maidens": 0, "runs": random.randint(12, 40), "wickets": random.randint(0, 2), "economy": round(random.uniform(6.5, 10.5), 2)},
        "win_probability": {
            "team_a_pct": random.randint(35, 65),
        },
        "recent_balls": [_ball_outcome() for _ in range(6)],
    }


def build_upcoming_match(match_id, team_a_id, team_b_id, venue, hours_from_now, league="IPL 2026"):
    ta = get_team(team_a_id)
    tb = get_team(team_b_id)
    return {
        "id": match_id,
        "status": "upcoming",
        "league": league,
        "venue": venue,
        "start_time": (datetime.now(timezone.utc) + timedelta(hours=hours_from_now)).isoformat(),
        "team_a": ta,
        "team_b": tb,
    }


def build_completed_match(match_id, team_a_id, team_b_id, venue, days_ago, winner_id, league="IPL 2026"):
    ta = get_team(team_a_id)
    tb = get_team(team_b_id)
    winner = get_team(winner_id)
    return {
        "id": match_id,
        "status": "completed",
        "league": league,
        "venue": venue,
        "start_time": (datetime.now(timezone.utc) - timedelta(days=days_ago)).isoformat(),
        "team_a": ta,
        "team_b": tb,
        "result": f"{winner['short']} won by {random.randint(4, 58)} runs" if random.random() > 0.5 else f"{winner['short']} won by {random.randint(2, 8)} wickets",
        "score_a": {"runs": random.randint(140, 220), "wickets": random.randint(3, 9), "overs": 20.0},
        "score_b": {"runs": random.randint(140, 220), "wickets": random.randint(3, 9), "overs": 20.0},
    }


def get_live_matches():
    return [
        build_live_match("m_live_1", "t1", "t2", "Wankhede Stadium, Mumbai"),
        build_live_match("m_live_2", "t3", "t4", "M. Chinnaswamy Stadium, Bengaluru"),
        build_live_match("m_live_3", "t11", "t12", "Narendra Modi Stadium, Ahmedabad", league="ICC T20 World Cup 2026"),
    ]


def get_upcoming_matches():
    return [
        build_upcoming_match("m_up_1", "t5", "t6", "Arun Jaitley Stadium, Delhi", 3),
        build_upcoming_match("m_up_2", "t7", "t8", "Sawai Mansingh Stadium, Jaipur", 6),
        build_upcoming_match("m_up_3", "t9", "t10", "Narendra Modi Stadium, Ahmedabad", 28),
        build_upcoming_match("m_up_4", "t13", "t14", "Eden Gardens, Kolkata", 48, "ICC T20 World Cup 2026"),
        build_upcoming_match("m_up_5", "t15", "t16", "Wankhede Stadium, Mumbai", 72, "ICC T20 World Cup 2026"),
        build_upcoming_match("m_up_6", "t1", "t3", "Wankhede Stadium, Mumbai", 96),
        build_upcoming_match("m_up_7", "t2", "t5", "M.A. Chidambaram Stadium, Chennai", 120),
    ]


def get_completed_matches():
    return [
        build_completed_match("m_c_1", "t1", "t3", "Wankhede Stadium, Mumbai", 1, "t1"),
        build_completed_match("m_c_2", "t2", "t4", "M.A. Chidambaram Stadium, Chennai", 2, "t2"),
        build_completed_match("m_c_3", "t5", "t7", "Arun Jaitley Stadium, Delhi", 3, "t7"),
    ]


def get_match_by_id(match_id):
    for m in get_live_matches():
        if m["id"] == match_id: return m
    for m in get_upcoming_matches():
        if m["id"] == match_id: return m
    for m in get_completed_matches():
        if m["id"] == match_id: return m
    return None


def get_scorecard(match_id):
    """Detailed batting & bowling scorecard for a match."""
    match = get_match_by_id(match_id)
    if not match: return None

    random.seed(hash(match_id + "scorecard") % (2**32))
    ta = match["team_a"]
    tb = match["team_b"]

    def build_innings(batting_team_id, bowling_team_id):
        batters = [p for p in PLAYERS if p["team_id"] == batting_team_id]
        if len(batters) < 5:
            batters = random.sample(PLAYERS, 7)
        else:
            batters = random.sample(batters, min(7, len(batters)))

        batting = []
        total_runs, total_wkts = 0, 0
        for i, p in enumerate(batters):
            runs = random.randint(2, 89) if i < 5 else random.randint(0, 25)
            balls = max(1, random.randint(max(1, runs // 2), runs + 20))
            out = i < 5
            dismissal = f"c {random.choice([x['name'] for x in PLAYERS[:5]])} b {random.choice([x['name'] for x in PLAYERS[:5]])}" if out else "not out"
            batting.append({
                "player": p, "runs": runs, "balls": balls,
                "fours": random.randint(0, 8), "sixes": random.randint(0, 5),
                "sr": round((runs/balls)*100, 2), "dismissal": dismissal, "out": out
            })
            total_runs += runs
            if out: total_wkts += 1

        bowlers = [p for p in PLAYERS if p["team_id"] == bowling_team_id]
        if len(bowlers) < 4:
            bowlers = random.sample(PLAYERS, 4)
        else:
            bowlers = random.sample(bowlers, min(4, len(bowlers)))

        bowling = []
        for b in bowlers:
            bowling.append({
                "player": b,
                "overs": round(random.uniform(2.0, 4.0), 1),
                "maidens": random.randint(0, 1),
                "runs": random.randint(18, 45),
                "wickets": random.randint(0, 3),
                "economy": round(random.uniform(6.5, 11.5), 2),
            })

        fall_of_wickets = []
        running = 0
        for i in range(total_wkts):
            running += random.randint(15, 50)
            fall_of_wickets.append({"wicket": i+1, "score": running, "over": round(random.uniform(2, 19), 1), "batter": batters[i]["name"]})

        return {
            "batting": batting,
            "bowling": bowling,
            "fall_of_wickets": fall_of_wickets,
            "total": f"{total_runs}/{total_wkts} (20.0 ov)",
            "extras": random.randint(5, 18),
        }

    return {
        "match": {"id": match["id"], "team_a": ta, "team_b": tb, "league": match["league"], "venue": match["venue"]},
        "innings1": {"team": ta, **build_innings(ta["id"], tb["id"])},
        "innings2": {"team": tb, **build_innings(tb["id"], ta["id"])} if match["status"] != "upcoming" else None,
    }


def get_ball_by_ball(match_id):
    """Generate ball-by-ball commentary for recent overs."""
    match = get_match_by_id(match_id)
    if not match: return []

    random.seed(hash(match_id + "bbb") % (2**32))
    commentary = []
    overs = 4
    for over_num in range(overs):
        for ball_num in range(1, 7):
            outcome = _ball_outcome()
            commentary.append({
                "over": over_num + 15,
                "ball": ball_num,
                "over_ball": f"{over_num + 15}.{ball_num}",
                "runs": outcome["runs"],
                "wicket": outcome.get("wicket", False),
                "desc": outcome["desc"],
                "commentary": f"{outcome['desc']} - Bowled on a good length, {['defended','punched','pulled','driven','cut','flicked'][random.randint(0,5)]} through {['cover','mid-wicket','point','third man','fine leg','square leg'][random.randint(0,5)]}.",
                "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=(overs*6 - (over_num*6+ball_num))*0.7)).isoformat(),
            })
    return list(reversed(commentary))


def get_wagon_wheel(match_id, player_id):
    """Generate wagon wheel data - runs scored in each direction."""
    random.seed(hash(match_id + player_id) % (2**32))
    return [
        {"zone": "Fine Leg", "runs": random.randint(2, 20), "balls": random.randint(1, 8), "angle": 20},
        {"zone": "Square Leg", "runs": random.randint(5, 28), "balls": random.randint(2, 10), "angle": 60},
        {"zone": "Mid Wicket", "runs": random.randint(8, 32), "balls": random.randint(3, 12), "angle": 100},
        {"zone": "Mid On", "runs": random.randint(2, 18), "balls": random.randint(1, 8), "angle": 140},
        {"zone": "Mid Off", "runs": random.randint(4, 22), "balls": random.randint(2, 10), "angle": 180},
        {"zone": "Cover", "runs": random.randint(6, 28), "balls": random.randint(3, 12), "angle": 220},
        {"zone": "Point", "runs": random.randint(3, 20), "balls": random.randint(2, 9), "angle": 260},
        {"zone": "Third Man", "runs": random.randint(2, 15), "balls": random.randint(1, 7), "angle": 320},
    ]


def get_manhattan(match_id):
    """Runs per over - Manhattan chart."""
    random.seed(hash(match_id + "manhattan") % (2**32))
    return [
        {"over": i+1, "runs": random.randint(2, 22), "wickets": random.choice([0,0,0,0,1])}
        for i in range(20)
    ]


def get_partnership(match_id):
    random.seed(hash(match_id + "ptr") % (2**32))
    return [
        {"wicket": i+1, "runs": random.randint(15, 85), "balls": random.randint(10, 60), "batter_a": random.choice(PLAYERS)["name"], "batter_b": random.choice(PLAYERS)["name"]}
        for i in range(5)
    ]


def get_top_performers():
    """Returns Top performers across all tournaments."""
    by_runs = sorted([p for p in PLAYERS if p["stats"].get("runs")], key=lambda x: -x["stats"]["runs"])[:5]
    by_sixes = sorted([p for p in PLAYERS if p["stats"].get("sixes")], key=lambda x: -x["stats"]["sixes"])[:5]
    by_fours = sorted([p for p in PLAYERS if p["stats"].get("fours")], key=lambda x: -x["stats"]["fours"])[:5]
    by_catches = sorted([p for p in PLAYERS if p["stats"].get("catches")], key=lambda x: -x["stats"]["catches"])[:5]
    by_wickets = sorted([p for p in PLAYERS if p["stats"].get("wickets", 0) > 0], key=lambda x: -x["stats"]["wickets"])[:5]
    return {
        "highest_runs": [{"player": p, "value": p["stats"]["runs"]} for p in by_runs],
        "most_sixes": [{"player": p, "value": p["stats"]["sixes"]} for p in by_sixes],
        "most_fours": [{"player": p, "value": p["stats"]["fours"]} for p in by_fours],
        "best_catches": [{"player": p, "value": p["stats"]["catches"]} for p in by_catches],
        "most_wickets": [{"player": p, "value": p["stats"]["wickets"]} for p in by_wickets],
    }


def get_predicted_xi(match_id):
    """AI predicted XI for a match."""
    match = get_match_by_id(match_id)
    if not match: return None
    team_a_players = [p for p in PLAYERS if p["team_id"] == match["team_a"]["id"]][:5]
    team_b_players = [p for p in PLAYERS if p["team_id"] == match["team_b"]["id"]][:5]
    if len(team_a_players) < 5:
        team_a_players += random.sample(PLAYERS, 5 - len(team_a_players))
    if len(team_b_players) < 5:
        team_b_players += random.sample(PLAYERS, 5 - len(team_b_players))
    return {
        "team_a": {"team": match["team_a"], "playing_xi": team_a_players, "impact_player": team_a_players[0] if team_a_players else None},
        "team_b": {"team": match["team_b"], "playing_xi": team_b_players, "impact_player": team_b_players[0] if team_b_players else None},
    }


def get_polls():
    return [
        {"id": "poll1", "question": "Who will win IND vs AUS?", "options": [{"label": "India", "votes": 2834}, {"label": "Australia", "votes": 1923}], "total": 4757},
        {"id": "poll2", "question": "Man of the match: MI vs CSK?", "options": [{"label": "Rohit Sharma", "votes": 1204}, {"label": "MS Dhoni", "votes": 2156}, {"label": "Hardik Pandya", "votes": 892}], "total": 4252},
        {"id": "poll3", "question": "Will Kohli score a century in the next match?", "options": [{"label": "Yes", "votes": 3211}, {"label": "No", "votes": 1688}], "total": 4899},
    ]
