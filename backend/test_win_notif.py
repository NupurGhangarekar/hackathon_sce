import asyncio
import winsdk.windows.ui.notifications.management as mgt
import winsdk.windows.ui.notifications as notif

async def main():
    listener = mgt.UserNotificationListener.current
    status = await listener.request_access_async()
    print("Access status:", status)
    if status != mgt.UserNotificationListenerAccessStatus.ALLOWED:
        print("Access denied.")
        return
    
    notifications = await listener.get_notifications_async(notif.NotificationKinds.TOAST)
    print(f"Got {len(notifications)} notifications")
    
    for n in notifications:
        try:
            binding = n.notification.visual.bindings[0]
            texts = binding.get_text_elements()
            app_name = n.app_info.display_info.display_name if n.app_info else "Unknown"
            print(f"[{app_name}]", " | ".join(t.text for t in texts))
        except Exception as e:
            print("Error parsing:", e)

asyncio.run(main())
