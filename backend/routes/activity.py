from fastapi import APIRouter

from models.schemas import ActivityPayload, ActivityResponse
from services.notification_engine import notification_engine
from services.state_engine import state_engine
from services.activity_timeline_engine import activity_timeline_engine

router = APIRouter()


@router.post("/activity", response_model=ActivityResponse)
def post_activity(payload: ActivityPayload) -> ActivityResponse:
    focus_state = state_engine.update_activity(payload)
    
    # Track activity for timeline visualization
    activity_timeline_engine.record_activity(
        url=payload.active_url or "unknown",
        tab_name="" 
    )
    
    return ActivityResponse(
        status="ok",
        focus_state=focus_state,
        pending_notifications=notification_engine.get_pending_count(),
    )
