# Backend (FastAPI)

This backend ingests extension activity data and decides whether notifications are delayed or delivered.

## Run

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Placeholder notes

- Add persistence in `services/*` using MongoDB or SQLite.
- Add multi-user support by introducing `user_id` in schemas and partitioning in-memory stores.
- Add ML scoring in `services/notification_engine.py`.
