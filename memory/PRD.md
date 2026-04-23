# CricLive — Product Requirements

## Overview
CricLive is a React Native Expo mobile-first cricket app for IPL 2026 and the ICC Men's T20 World Cup 2026. It delivers ultra-fast live scores, ball-by-ball commentary, interactive scorecards, match intelligence visualizations, AI-powered Q&A (Claude Sonnet 4.5), personalized follows/alerts, community polls & live chat, and fantasy predicted XIs.

## Tech Stack
- **Frontend**: Expo (SDK 54) with Expo Router, React Native, Outfit + Manrope fonts, AsyncStorage, Axios
- **Backend**: FastAPI (Python), MongoDB (Motor async), JWT auth, bcrypt
- **AI**: Claude Sonnet 4.5 via `emergentintegrations` (Emergent Universal LLM Key)
- **Cricket Data**: Sportmonks Cricket API (token configured) with a rich MOCKED fallback dataset for demo/offline

## Key Features Implemented (v1)
- **Auth**: JWT email/password (register, login, me)
- **Live matches**: Team scores, current batsmen at crease, bowler, RR/RRR, recent balls, win probability
- **Match detail tabs**: Summary · Scorecard · XI · Commentary (with filter chips: All/Boundaries/Wickets/Sixes/Fours/Dots and rich per-ball shot-type + length + line + wagon-zone badges) · Stats (Manhattan + Partnership Timelines showing ball-by-ball progression with boundaries flagged in color) · Fantasy · Chat
- **Summary tab now includes**: venue info card (capacity, pitch type, averages, highest total/chase, ends) and **Match Officials** (on-field umpires, TV umpire, reserve, match referee)
- **XI tab (NEW)**: Final playing XI per team with captain/WK tags and expandable per-player cards showing — speciality, best fielding position, batting/bowling style, per-format batting avg (T20/ODI/Test), per-format bowling avg, Man-of-the-Match count, Man-of-the-Series count, catches, wicket-keeping stats (dismissals/stumpings/catches-behind) for keepers, **performance at this venue** (matches/runs/best/avg/SR/wickets) and **performance vs this opponent**
- **Schedule**: Upcoming + Completed matches with alert setting
- **Top performers**: Highest runs, most 6s, most 4s, best catches, most wickets
- **Player profile (unified)**: achievement cards (MoTM/MoS/Catches), headline stats, per-format batting average (T20/ODI/Test), per-format bowling average, wicket-keeping stats for keepers, 10-innings recent-form bar chart, performance at top 5 venues, head-to-head vs top 6 opposing teams
- **Team profile**: Squad view
- **Personalization**: Follow teams & players, personalized home feed
- **Community**: Fan polls (with voting) + match chat rooms
- **Ask AI**: Claude Sonnet 4.5 chat with suggestions
- **Smart Alerts**: Wicket/boundary alerts per match

## API Endpoints (all under `/api`)
- Auth: `/auth/register`, `/auth/login`, `/auth/me`
- Matches: `/matches/live`, `/matches/upcoming`, `/matches/completed`, `/matches/{id}`, `/matches/{id}/scorecard`, `/matches/{id}/commentary`, `/matches/{id}/manhattan`, `/matches/{id}/partnerships`, `/matches/{id}/predicted-xi`, `/matches/{id}/wagon-wheel/{player_id}`
- Players/Teams: `/players`, `/players/{id}`, `/teams`, `/teams/{id}`, `/top-performers`
- Personalization: `/follow`, `/unfollow`, `/following`, `/home-feed`, `/alerts`
- AI: `/ai/ask`, `/ai/win-probability/{match_id}`
- Community: `/community/polls`, `/community/polls/vote`, `/community/chat/{match_id}`, `/community/chat` (POST)

## MOCKED Data
Sportmonks live/upcoming/completed matches are served from richly-seeded demo data (mock_data.py) including IPL 2026 + ICC T20 WC 2026 fixtures, players (Kohli, Rohit, Dhoni, Bumrah, etc.), scorecards, fall of wickets, recent balls, and ball-by-ball commentary.

## Design
Clean & modern Swiss-style light theme (Archetype 4) with dark charcoal primary (#111418), sharp 8px radius, Outfit headings and Manrope body fonts, team-colored badges/accents. Bottom tab navigation with 5 tabs: Home · Matches · Ask AI · Community · Profile.

## Environment Variables
- `backend/.env`: `MONGO_URL`, `DB_NAME`, `JWT_SECRET`, `SPORTMONKS_API_KEY`, `EMERGENT_LLM_KEY`
- `frontend/.env`: (protected, unchanged)

## Out-of-Scope for v1
- Real-time WebSockets (currently 15s polling)
- Wagon wheel SVG visualization (data API exists, UI TBD)
- Admin panel for tournament/news management
- Push notifications (alert backend model exists; device-level push TBD)
- Real Sportmonks data transform (mock fallback used by design for reliable demo)
