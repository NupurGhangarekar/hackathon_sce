from datetime import datetime
from typing import List

from pydantic import BaseModel, Field


class ActivityPayload(BaseModel):
    active_url: str = ""
    tab_switch_count: int = 0
    tab_switches_last_5s: int = 0
    idle_seconds: int = 0
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ActivityResponse(BaseModel):
    status: str
    focus_state: str
    pending_notifications: int


class StateResponse(BaseModel):
    focus_state: str
    active_url: str
    tab_switch_count: int
    tab_switches_last_5s: int
    idle_seconds: int
    last_activity_at: datetime | None = None


class NotificationItem(BaseModel):
    id: int
    title: str
    message: str
    created_at: datetime


class NotificationsResponse(BaseModel):
    delayed: List[NotificationItem]
    delivered: List[NotificationItem]
    pending_count: int
