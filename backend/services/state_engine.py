from dataclasses import dataclass
from datetime import datetime

from config import settings
from models.schemas import ActivityPayload


@dataclass
class ActivitySnapshot:
    active_url: str = ""
    tab_switch_count: int = 0
    tab_switches_last_5s: int = 0
    idle_seconds: int = 0
    last_activity_at: datetime | None = None


class StateEngine:
    def __init__(self) -> None:
        self.snapshot = ActivitySnapshot()
        self.focus_state = "focused"

    def update_activity(self, payload: ActivityPayload) -> str:
        self.snapshot = ActivitySnapshot(
            active_url=payload.active_url,
            tab_switch_count=payload.tab_switch_count,
            tab_switches_last_5s=payload.tab_switches_last_5s,
            idle_seconds=payload.idle_seconds,
            last_activity_at=payload.timestamp,
        )
        self.focus_state = self._compute_focus_state()
        return self.focus_state

    def _compute_focus_state(self) -> str:
        if self.snapshot.idle_seconds > settings.idle_threshold_seconds:
            return "idle"
        if self.snapshot.tab_switches_last_5s >= settings.high_tab_switch_threshold:
            return "distracted"
        return "focused"


state_engine = StateEngine()
