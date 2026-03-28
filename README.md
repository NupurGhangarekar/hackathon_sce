# Context-Aware Notification System (Hackathon Project)

A full-stack hackathon-ready system with three modules:

- `extension/` Chrome Extension (Manifest V3) for activity tracking
- `backend/` FastAPI rule/decision engine
- `webapp/` React dashboard for live monitoring

## Project Structure

```text
activity_scehack/
  extension/
  backend/
  webapp/
  docs/
  README.md
```

## What It Does

1. Chrome extension tracks:
   - Active tab URL
   - Tab switching frequency
   - Idle state/time (`chrome.idle`)
2. Extension posts activity to backend every 5 seconds.
3. Backend classifies focus state:
   - `idle` if idle time > 30 seconds
   - `distracted` if high tab switching
   - `focused` otherwise
4. Backend simulates incoming notifications every 10 seconds and decides:
   - `idle` -> deliver notifications
   - `focused`/`distracted` -> delay notifications
5. React dashboard auto-refreshes and visualizes:
   - Current focus state
   - Activity metrics
   - Delayed vs delivered notifications

## Run Instructions

## 1) Backend (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend endpoints:
- `POST /activity`
- `GET /state`
- `GET /notifications`

## 2) Web Dashboard (React)

```bash
cd webapp
npm install
npm run dev
```

Open the URL shown by Vite (usually `http://localhost:5173`).

## 3) Chrome Extension

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `extension/` folder.
4. Keep backend running on `http://localhost:8000`.
5. Use browser tabs normally; open extension popup to view state and pending count.

## Demo Flow

1. Start backend and dashboard.
2. Load extension.
3. Switch tabs rapidly to trigger `distracted`.
4. Stop interacting for > 30 seconds to trigger `idle`.
5. Watch delayed notifications move to delivered when state becomes `idle`.

## Notes For Future Improvements

- Database integration placeholder:
  - Replace in-memory stores in `backend/services/` with MongoDB or SQLite repositories.
- ML model placeholder:
  - Add intelligent focus classification in `backend/services/state_engine.py`.
- Multi-user placeholder:
  - Add `user_id` to payloads and partition state/queues by user.

## Quick Troubleshooting

- CORS/API issues: ensure backend is running on port `8000`.
- No state changes: verify extension is loaded and permissions are granted.
- Dashboard not updating: check browser console and backend logs.
