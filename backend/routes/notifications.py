from fastapi import APIRouter

from models.schemas import NotificationsResponse
from services.notification_engine import notification_engine

router = APIRouter()


@router.get("/notifications", response_model=NotificationsResponse)
def get_notifications() -> NotificationsResponse:
    return NotificationsResponse(
        delayed=notification_engine.delayed_notifications,
        delivered=notification_engine.delivered_notifications,
        pending_count=notification_engine.get_pending_count(),
    )
