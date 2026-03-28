from datetime import datetime
from typing import List

from pydantic import BaseModel, Field


class ActivityPayload(BaseModel):
    active_url: str = ""
    tab_switch_count: int = 0
    tab_switches_last_5s: int = 0
    idle_seconds: int = 0
    current_file: str = ""
    clipboard_snippet: str = ""
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


# Feature 2: Context Capsule Models
class ContextCapsule(BaseModel):
    """Mini AI snapshot of context before interruption"""
    id: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    current_app: str  # e.g., "VSCode", "Chrome"
    file_name: str  # e.g., "notification_classifier.py"
    active_url: str
    clipboard_snippet: str
    last_activity: str  # e.g., "typing", "scrolling", "tabSwitch"
    inferred_task_summary: str  # e.g., "Refining urgency scoring"
    interruption_source: str  # e.g., "Email", "Slack", "Chat"
    focus_state_before: str  # "focused", "distracted", "idle"


class ContextCapsuleResponse(BaseModel):
    """Response containing the current context capsule"""
    context_capsule: ContextCapsule | None
    status: str


# Feature 3: Attention Debt Score Models
class InterruptionCost(BaseModel):
    """Records cost of each interruption"""
    id: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    source: str  # e.g., "group chats", "email", "notifications"
    context_switch_cost_minutes: float
    focus_loss_percentage: float
    estimated_recovery_minutes: float
    total_cost_minutes: float


class AttentionDebtScore(BaseModel):
    """Aggregate attention debt for a user"""
    total_interruptions_today: int
    total_time_lost_minutes: float
    most_costly_source: str
    peak_disruption_window: str  # e.g., "2:00 PM - 3:00 PM"
    focus_recovery_time_hours: float
    interruptions_by_hour: dict[str, int]
    interruptions_by_source: dict[str, int]


class AttentionDebtResponse(BaseModel):
    """Response containing attention debt analysis"""
    attention_debt: AttentionDebtScore
    status: str


# Feature 4: AI Action Compression Models
class ActionItem(BaseModel):
    """Compressed actionable task from notification"""
    id: int
    original_notification: str
    action_text: str
    priority: str  # "high", "medium", "low"
    category: str  # "send", "confirm", "review", "share", etc.
    estimated_time_minutes: float
    source: str


class ActionCompressionResponse(BaseModel):
    """Response containing compressed actions"""
    actions: List[ActionItem]
    total_notifications: int
    compressed_actions: int
    status: str
