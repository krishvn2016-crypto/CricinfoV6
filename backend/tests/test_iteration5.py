"""
CricLive Iteration 5 backend tests.

Covers the new pre-publish iteration features:
  - GET /api/meta (app meta + beta flag + trial days + support contacts)
  - Trial fields on /api/auth/register and /api/auth/me
    (trial_ends_at, is_pro during trial, trial_remaining_days, ai_queries_bonus, ai_queries_today)
  - Razorpay payments:
      * GET  /api/payments/config
      * POST /api/payments/create-order (auth)
      * POST /api/payments/verify (bad signature => 400)
  - Feedback:
      * POST /api/feedback (anon + auth)
      * GET  /api/admin/feedback (admin only, 403 for non-admin)
  - Ask AI behaviour:
      * Trial user (freshly registered) has unlimited queries (is_pro=true)
      * Expired-trial user (trial_ends_at forced into past in Mongo) gets
        limit_reached after 5 queries on the 6th call
"""
import os
import uuid
from datetime import datetime, timezone, timedelta

import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://runs-analytics.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "cricket_app")

ADMIN_EMAIL = "admin@cric.live"
ADMIN_PASSWORD = "admin1234"


# ---------- fixtures ----------
@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def new_user(session):
    """Register a brand new user (trial active). Returns dict with token, id, email."""
    email = f"trial+{uuid.uuid4().hex[:8]}@cric.live"
    r = session.post(f"{API}/auth/register", json={"email": email, "password": "test1234", "name": "Trial User"})
    assert r.status_code == 200, r.text
    d = r.json()
    return {"token": d["token"], "id": d["user"]["id"], "email": email, "user": d["user"]}


@pytest.fixture(scope="module")
def mongo_users():
    cli = MongoClient(MONGO_URL)
    yield cli[DB_NAME]["users"]
    cli.close()


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


# ===================== /api/meta =====================
def test_meta_fields(session):
    r = session.get(f"{API}/meta")
    assert r.status_code == 200, r.text
    d = r.json()
    assert d.get("app") == "CricLive"
    assert d.get("version") == "1.0.0-beta"
    assert d.get("beta") is True
    assert d.get("free_trial_days") == 7
    assert d.get("support_email") == "CricketRelgion@gmail.com"
    assert d.get("address") == "Mumbai, India"


# ===================== Register / Me - trial fields =====================
def test_register_sets_trial(new_user):
    u = new_user["user"]
    # User payload from /register should expose is_pro=true via trial OR trial_ends_at
    assert "id" in u and u["email"] == new_user["email"]
    # is_pro true during trial is the product behaviour; allow either field or trial_ends_at to confirm
    # Strict check — trial should be active so is_pro must be true
    assert u.get("is_pro") is True, f"new user should be pro during trial: {u}"


def test_me_trial_fields(session, new_user):
    r = session.get(f"{API}/auth/me", headers=_auth(new_user["token"]))
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["email"] == new_user["email"]
    assert d.get("is_pro") is True, f"trial user should be pro: {d}"
    assert "trial_remaining_days" in d
    assert 6 <= d["trial_remaining_days"] <= 7, f"trial_remaining_days out of range: {d['trial_remaining_days']}"
    assert "ai_queries_bonus" in d and isinstance(d["ai_queries_bonus"], int)
    assert "ai_queries_today" in d and isinstance(d["ai_queries_today"], int)


# ===================== Payments =====================
def test_payments_config(session):
    r = session.get(f"{API}/payments/config")
    assert r.status_code == 200, r.text
    d = r.json()
    assert d.get("key_id") == "rzp_test_SgiBXLxqFXNgxi"
    assert d.get("enabled") is True
    pack = d.get("pack", {})
    assert pack.get("price_paise") == 10000
    assert pack.get("queries") == 5


def test_payments_create_order_requires_auth(session):
    r = session.post(f"{API}/payments/create-order", json={"pack": "ai_5_pack"})
    assert r.status_code == 401


def test_payments_create_order_auth(session, new_user):
    r = session.post(f"{API}/payments/create-order", json={"pack": "ai_5_pack"}, headers=_auth(new_user["token"]))
    assert r.status_code == 200, r.text
    d = r.json()
    assert d.get("order_id", "").startswith("order_")
    assert d.get("amount") == 10000
    assert d.get("currency") == "INR"
    assert d.get("key_id") == "rzp_test_SgiBXLxqFXNgxi"
    # stash for verify test
    pytest._order_id = d["order_id"]


def test_payments_verify_bad_signature(session, new_user):
    order_id = getattr(pytest, "_order_id", "order_FAKEORDER")
    payload = {"order_id": order_id, "payment_id": "pay_FAKE", "signature": "bogus_signature"}
    r = session.post(f"{API}/payments/verify", json=payload, headers=_auth(new_user["token"]))
    # Signature verification MUST fail → 400
    assert r.status_code == 400, f"expected 400, got {r.status_code}: {r.text}"
    assert "signature" in r.text.lower()


# ===================== Feedback =====================
def test_feedback_anonymous(session):
    payload = {"rating": 4, "message": "TEST_ anon feedback", "email": "anon@example.com"}
    r = session.post(f"{API}/feedback", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d.get("status") == "received"
    assert d.get("id")


def test_feedback_authenticated(session, new_user):
    payload = {"rating": 5, "message": f"TEST_ auth feedback {uuid.uuid4().hex[:6]}"}
    r = session.post(f"{API}/feedback", json=payload, headers=_auth(new_user["token"]))
    assert r.status_code == 200, r.text
    assert r.json().get("id")


def test_admin_feedback_list(session, admin_token, new_user):
    # Submit a uniquely identifiable message first
    unique_msg = f"TEST_ admin-list {uuid.uuid4().hex[:8]}"
    s = session.post(f"{API}/feedback", json={"rating": 3, "message": unique_msg}, headers=_auth(new_user["token"]))
    assert s.status_code == 200

    r = session.get(f"{API}/admin/feedback", headers=_auth(admin_token))
    assert r.status_code == 200, r.text
    items = r.json().get("feedback", [])
    assert isinstance(items, list) and len(items) >= 1
    # Our submission should be present and carry user_id + email
    mine = [f for f in items if f.get("message") == unique_msg]
    assert mine, f"submitted feedback not found in admin listing. Sample: {items[:2]}"
    row = mine[0]
    assert row.get("user_id") == new_user["id"]
    assert row.get("email") == new_user["email"].lower() or row.get("email") == new_user["email"]


def test_admin_feedback_forbidden_for_non_admin(session, new_user):
    r = session.get(f"{API}/admin/feedback", headers=_auth(new_user["token"]))
    assert r.status_code == 403, r.text


# ===================== AI — trial vs expired trial =====================
def test_ai_trial_user_unlimited(session, new_user):
    # Trial user (just registered) should succeed multiple times without limit_reached
    for i in range(6):
        r = session.post(
            f"{API}/ai/ask",
            json={"query": f"trial q{i} top IPL run scorer"},
            headers=_auth(new_user["token"]),
            timeout=60,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert not d.get("limit_reached"), f"trial user shouldn't hit limit at i={i}: {d}"
        assert d.get("is_pro") is True


def test_ai_expired_trial_enforces_limit(session, mongo_users):
    """Register a user, then backdate trial_ends_at + reset daily counters,
    then expect 6th Ask AI call to return limit_reached=True."""
    email = f"expired+{uuid.uuid4().hex[:8]}@cric.live"
    reg = session.post(f"{API}/auth/register", json={"email": email, "password": "test1234", "name": "Expired"})
    assert reg.status_code == 200
    tok = reg.json()["token"]
    uid = reg.json()["user"]["id"]

    # Backdate trial_ends_at to yesterday, clear pro flag, reset daily counters
    past = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    res = mongo_users.update_one(
        {"id": uid},
        {"$set": {"trial_ends_at": past, "is_pro": False, "ai_queries_today": 0, "ai_queries_bonus": 0, "ai_queries_date": datetime.now(timezone.utc).strftime("%Y-%m-%d")}},
    )
    assert res.matched_count == 1

    # Sanity: /auth/me should now show is_pro=false
    me = session.get(f"{API}/auth/me", headers=_auth(tok))
    assert me.status_code == 200
    assert me.json().get("is_pro") is False, f"expected expired trial -> is_pro=false, got {me.json()}"

    # 5 successful queries
    for i in range(5):
        r = session.post(
            f"{API}/ai/ask",
            json={"query": f"exp q{i}?"},
            headers=_auth(tok),
            timeout=60,
        )
        assert r.status_code == 200, r.text
        assert not r.json().get("limit_reached"), f"unexpected limit at i={i}: {r.json()}"

    # 6th should be blocked
    r6 = session.post(f"{API}/ai/ask", json={"query": "q6?"}, headers=_auth(tok), timeout=30)
    assert r6.status_code == 200
    d6 = r6.json()
    assert d6.get("limit_reached") is True, f"expired-trial user should hit limit on 6th call: {d6}"
    assert d6.get("is_pro") is False
