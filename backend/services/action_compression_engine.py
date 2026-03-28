from typing import List
from models.schemas import ActionItem, NotificationItem
import re


class ActionCompressionEngine:
    """
    Converts raw notifications into actionable, compressed tasks.
    Uses pattern matching and simple NLP heuristics to infer
    the actual action needed from notification text.
    """

    def __init__(self) -> None:
        self._next_id = 1
        # Action patterns: (keywords, action_type, priority, estimated_time)
        self.action_patterns = {
            "send": {
                "keywords": ["send", "share", "forward", "mail", "email"],
                "priority": "high",
                "estimated_time": 2,
            },
            "confirm": {
                "keywords": ["confirm", "approve", "yes", "ok", "accept", "agree"],
                "priority": "high",
                "estimated_time": 1,
            },
            "review": {
                "keywords": [
                    "review",
                    "check",
                    "look at",
                    "examine",
                    "read",
                    "approve",
                    "feedback",
                ],
                "priority": "medium",
                "estimated_time": 5,
            },
            "meeting": {
                "keywords": ["meet", "call", "sync", "standup", "conference"],
                "priority": "high",
                "estimated_time": 30,
            },
            "deadline": {
                "keywords": ["deadline", "due", "urgent", "asap", "immediately"],
                "priority": "high",
                "estimated_time": 20,
            },
            "support": {
                "keywords": ["help", "issue", "problem", "bug", "error", "fix"],
                "priority": "medium",
                "estimated_time": 15,
            },
        }

    def compress_notification(
        self, notification: NotificationItem
    ) -> ActionItem:
        """
        Convert a single notification into an actionable task.
        """
        original = f"{notification.title}: {notification.message}"
        action_text, category, priority, time_estimate = self._infer_action(
            notification
        )

        action = ActionItem(
            id=self._next_id,
            original_notification=original,
            action_text=action_text,
            priority=priority,
            category=category,
            estimated_time_minutes=time_estimate,
            source=self._extract_source(original),
        )
        self._next_id += 1
        return action

    def compress_notifications(
        self, notifications: List[NotificationItem]
    ) -> List[ActionItem]:
        """
        Compress multiple notifications into actions.
        Deduplicates similar actions from same source.
        """
        actions = [self.compress_notification(notif) for notif in notifications]

        # Simple deduplication: merge actions from same source with similar text
        deduplicated = []
        seen_actions = set()

        for action in actions:
            # Create a simplified key for deduplication
            key = (action.source, action.category)
            if key not in seen_actions:
                deduplicated.append(action)
                seen_actions.add(key)

        # Sort by priority
        priority_order = {"high": 0, "medium": 1, "low": 2}
        deduplicated.sort(key=lambda x: priority_order.get(x.priority, 999))

        return deduplicated

    def _infer_action(self, notification: NotificationItem) -> tuple:
        """
        Infer action type, category, priority, and time estimate from notification.
        Returns: (action_text, category, priority, estimated_time_minutes)
        """
        text = (notification.title + " " + notification.message).lower()

        # Check for specific patterns
        action_text = self._generate_action_text(notification)

        # Determine category and priority
        category = "task"
        priority = "medium"
        time_estimate = 5

        for action_type, pattern_info in self.action_patterns.items():
            if any(kw in text for kw in pattern_info["keywords"]):
                category = action_type
                priority = pattern_info["priority"]
                time_estimate = pattern_info["estimated_time"]
                break

        return action_text, category, priority, time_estimate

    def _generate_action_text(self, notification: NotificationItem) -> str:
        """
        Generate a concise action text from notification.
        Examples:
        - "Can you send me the PPT?" -> "Send latest PPT"
        - "Need attendance sheet" -> "Share attendance sheet"
        - "Review final deck" -> "Review final deck"
        """
        text = notification.message.strip()

        # Extract key entities
        if "send" in text.lower():
            # Extract what should be sent
            words = text.split()
            return f"Send {' '.join(words[-3:])}"

        if "share" in text.lower() or "need" in text.lower():
            words = text.split()
            item = " ".join(words[-3:] if len(words) > 3 else words)
            return f"Share {item}"

        if "meet" in text.lower() or "call" in text.lower():
            match = re.search(r"(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?)", text)
            if match:
                return f"Confirm {match.group(1)} meeting"
            return "Schedule meeting"

        if "review" in text.lower() or "check" in text.lower():
            words = text.split()
            return f"Review {' '.join(words[-2:])}"

        if "confirm" in text.lower() or "approve" in text.lower():
            return "Confirm/Approve request"

        # Default: use first few words as action
        words = text.split()
        action = " ".join(words[:5]) if len(words) > 5 else text
        return action[:50]  # Limit length

    def _extract_source(self, text: str) -> str:
        """Extract notification source (Email, Slack, Teams, etc.)"""
        text_lower = text.lower()
        
        if "slack" in text_lower or "slackbot" in text_lower:
            return "Slack"
        if "email" in text_lower or "gmail" in text_lower:
            return "Email"
        if "teams" in text_lower or "microsoft teams" in text_lower:
            return "MS Teams"
        if "discord" in text_lower:
            return "Discord"
        if "whatsapp" in text_lower:
            return "WhatsApp"
        if "chat" in text_lower or "group chat" in text_lower:
            return "Chat"
        
        return "System"


action_compression_engine = ActionCompressionEngine()
