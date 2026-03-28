import asyncio
from datetime import datetime

from config import settings
from models.schemas import NotificationItem
from services.state_engine import state_engine


class NotificationEngine:
    def __init__(self) -> None:
        self._next_id = 1
        self.delayed_notifications: list[NotificationItem] = []
        self.delivered_notifications: list[NotificationItem] = []

    def create_notification(self) -> NotificationItem:
        item = NotificationItem(
            id=self._next_id,
            title=f"Notification #{self._next_id}",
            message="System-generated event for demo purposes.",
            created_at=datetime.utcnow(),
        )
        self._next_id += 1
        return item

    def process_notification(self, item: NotificationItem) -> None:
        # Future improvement: this is where ML scoring or user preferences could be applied.
        current_state = state_engine.focus_state
        if current_state == "idle":
            self.delivered_notifications.extend(self.delayed_notifications)
            self.delayed_notifications.clear()
            self.delivered_notifications.append(item)
            return

        # In focused or distracted states, notifications are delayed.
        self.delayed_notifications.append(item)

    def get_pending_count(self) -> int:
        return len(self.delayed_notifications)

    def get_all_notifications(self) -> list[NotificationItem]:
        """Get all notifications (both delayed and delivered)"""
        return self.delayed_notifications + self.delivered_notifications

    def get_compressed_notifications(self) -> dict:
        """Get notifications with action compression applied"""
        from services.action_compression_engine import action_compression_engine

        all_notifs = self.get_all_notifications()
        actions = action_compression_engine.compress_notifications(all_notifs)

        return {
            "total_notifications": len(all_notifs),
            "compressed_actions": len(actions),
            "actions": actions,
        }

    async def simulate_incoming_notifications(self) -> None:
        while True:
            await asyncio.sleep(settings.notification_interval_seconds)
            notification = self.create_notification()
            self.process_notification(notification)


notification_engine = NotificationEngine()

