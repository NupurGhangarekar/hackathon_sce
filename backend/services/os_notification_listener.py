import asyncio
import logging
from datetime import datetime

try:
    import winsdk.windows.ui.notifications.management as mgt
    import winsdk.windows.ui.notifications as notif
    WINSDK_AVAILABLE = True
except ImportError:
    WINSDK_AVAILABLE = False

from services.notification_engine import notification_engine
from models.schemas import NotificationItem

logger = logging.getLogger(__name__)

class OSNotificationListener:
    def __init__(self):
        self.known_ids = set()
        self.is_running = False

    async def start_polling(self, interval_seconds: int = 5):
        if not WINSDK_AVAILABLE:
            logger.warning("winsdk not available. OS notifications disabled.")
            return

        listener = mgt.UserNotificationListener.current
        status = await listener.request_access_async()
        if status != mgt.UserNotificationListenerAccessStatus.ALLOWED:
            logger.warning(f"OS Notification access denied. Status: {status}")
            return

        logger.info("OS Notification listener started.")
        self.is_running = True

        # Initial fetch to populate known_ids without triggering alerts
        try:
            initial_notifs = await listener.get_notifications_async(notif.NotificationKinds.TOAST)
            for n in initial_notifs:
                self.known_ids.add(n.id)
        except Exception as e:
            logger.error(f"Error during initial OS notification fetch: {e}")

        while self.is_running:
            await asyncio.sleep(interval_seconds)
            try:
                current_notifs = await listener.get_notifications_async(notif.NotificationKinds.TOAST)
                
                for n in current_notifs:
                    if n.id not in self.known_ids:
                        self.known_ids.add(n.id)
                        self._process_new_notification(n)
            except Exception as e:
                logger.error(f"Error polling OS notifications: {e}")

    def _process_new_notification(self, n):
        try:
            binding = n.notification.visual.bindings[0]
            texts = binding.get_text_elements()
            body_lines = [t.text for t in texts]
            
            app_name = n.app_info.display_info.display_name if n.app_info else "System"
            title = app_name
            message = " | ".join(body_lines)

            # Insert into engine
            item = NotificationItem(
                id=notification_engine._next_id,
                title=title,
                message=message,
                created_at=datetime.utcnow()
            )
            notification_engine._next_id += 1
            notification_engine.process_notification(item)
            logger.info(f"Captured OS Notification from {app_name}")
        except Exception as e:
            logger.error(f"Error parsing OS notification: {e}")

os_listener = OSNotificationListener()
