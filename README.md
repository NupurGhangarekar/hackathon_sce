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
python run.py
```

Backend network configuration uses environment variables:

- `BACKEND_HOST` (default: `0.0.0.0`)
- `BACKEND_PORT` (default: `8000`)

You can set custom values in shell before running:

```powershell
$env:BACKEND_HOST="0.0.0.0"
$env:BACKEND_PORT="8080"
python run.py
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

Configure API URL with a React env file:

1. Copy `webapp/.env.example` to `webapp/.env`
2. Set `VITE_API_BASE_URL` to your backend URL

Example:

```text
VITE_API_BASE_URL=http://192.168.1.25:8000
```

If `VITE_API_BASE_URL` is not set, the app falls back to `http://<current-hostname>:8000`.

Open the URL shown by Vite (usually `http://localhost:5173`).

## 3) Chrome Extension

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `extension/` folder.
4. Keep backend running on `http://localhost:8000`.
5. Use browser tabs normally; open extension popup to view state and pending count.

For LAN testing, update `extension/api/apiClient.js` `BASE_URL` to your machine IP (for example `http://192.168.1.25:8000`).

## Mobile Access (Same WiFi)

1. Connect phone and computer to the same WiFi network.
2. Find computer local IPv4 address (for example `192.168.1.25`).
3. Start backend bound to `0.0.0.0` (default via `python run.py`).
4. In `webapp/.env`, set:

```text
VITE_API_BASE_URL=http://<YOUR_LOCAL_IP>:8000
```

5. Run frontend with host exposed to LAN:

```bash
cd webapp
npm run dev -- --host 0.0.0.0 --port 5173
```

6. On mobile browser, open:

```text
http://<YOUR_LOCAL_IP>:5173
```

If it does not load, allow ports `8000` and `5173` through your firewall.

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

- CORS/API issues: backend allows all origins; ensure backend URL in `VITE_API_BASE_URL` is reachable from the client device.
- No state changes: verify extension is loaded and permissions are granted.
- Dashboard not updating: check browser console and backend logs.
