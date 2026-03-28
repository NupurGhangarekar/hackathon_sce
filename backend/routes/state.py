from fastapi import APIRouter

from models.schemas import StateResponse
from services.state_engine import state_engine

router = APIRouter()


@router.get("/state", response_model=StateResponse)
def get_state() -> StateResponse:
    snapshot = state_engine.snapshot
    return StateResponse(
        focus_state=state_engine.focus_state,
        active_url=snapshot.active_url,
        tab_switch_count=snapshot.tab_switch_count,
        tab_switches_last_5s=snapshot.tab_switches_last_5s,
        idle_seconds=snapshot.idle_seconds,
        last_activity_at=snapshot.last_activity_at,
    )
