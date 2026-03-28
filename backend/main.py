import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routes.activity import router as activity_router
from routes.notifications import router as notifications_router
from routes.state import router as state_router
from services.notification_engine import notification_engine

app = FastAPI(title=settings.app_name, version=settings.app_version)

# Allow extension and local web app calls during hackathon development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(activity_router)
app.include_router(state_router)
app.include_router(notifications_router)


@app.on_event("startup")
async def startup_event() -> None:
    asyncio.create_task(notification_engine.simulate_incoming_notifications())


@app.get("/")
def health() -> dict[str, str]:
    return {"status": "running", "service": settings.app_name}
