from datetime import datetime
from typing import Optional

from models.schemas import ContextCapsule
from services.state_engine import state_engine
from config import settings


class ContextCapsuleEngine:
    """
    Captures and stores context snapshots before interruption.
    These snapshots help users remember what they were doing.
    """

    def __init__(self) -> None:
        self.current_capsule: Optional[ContextCapsule] = None
        self.capsule_history: list[ContextCapsule] = []
        self._next_id = 1
        self._last_activity_type = "idle"

    def create_capsule(
        self,
        current_app: str,
        file_name: str,
        active_url: str,
        clipboard_snippet: str,
        last_activity: str,
        interruption_source: str,
    ) -> ContextCapsule:
        """Create a new context capsule before interruption"""
        # Infer task summary from file name and URL
        task_summary = self._infer_task_summary(file_name, active_url, last_activity)

        capsule = ContextCapsule(
            id=self._next_id,
            timestamp=datetime.utcnow(),
            current_app=current_app,
            file_name=file_name,
            active_url=active_url,
            clipboard_snippet=clipboard_snippet[:100],  # Limit length
            last_activity=last_activity,
            inferred_task_summary=task_summary,
            interruption_source=interruption_source,
            focus_state_before=state_engine.focus_state,
        )
        self._next_id += 1
        return capsule

    def store_capsule(self, capsule: ContextCapsule) -> None:
        """Store capsule in history and set as current"""
        self.current_capsule = capsule
        self.capsule_history.append(capsule)
        # Keep only last 20 capsules to avoid memory bloat
        if len(self.capsule_history) > 20:
            self.capsule_history.pop(0)

    def get_current_capsule(self) -> Optional[ContextCapsule]:
        """Get the most recent context capsule"""
        return self.current_capsule

    def get_capsule_history(self, limit: int = 10) -> list[ContextCapsule]:
        """Get recent context capsules"""
        return self.capsule_history[-limit:]

    def _infer_task_summary(
        self, file_name: str, active_url: str, activity: str
    ) -> str:
        """Use heuristics to infer what task the user was doing"""
        if not file_name and not active_url:
            return "No specific task detected"

        # Infer from file name
        if file_name:
            if "ppt" in file_name.lower() or "slide" in file_name.lower():
                return "Editing presentation slides"
            elif ".py" in file_name:
                return f"Coding in {file_name}"
            elif "budget" in file_name.lower() or ".xlsx" in file_name:
                return "Working with spreadsheet data"
            elif "document" in file_name.lower() or ".docx" in file_name:
                return "Drafting document content"

        # Infer from activity type
        if activity == "typing":
            return "Writing or coding"
        elif activity == "scrolling":
            return "Reviewing content"
        elif activity == "tabSwitch":
            return "Researching multiple sources"

        # Infer from URL
        if active_url:
            if "github" in active_url.lower():
                return "Reviewing code on GitHub"
            elif "gmail" in active_url.lower() or "mail" in active_url.lower():
                return "Managing emails"
            elif "slack" in active_url.lower():
                return "Team communication"
            elif "drive" in active_url.lower() or "docs" in active_url.lower():
                return "Collaborating on documents"

        return "Active work session"


context_capsule_engine = ContextCapsuleEngine()
