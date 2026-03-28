import os

from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "Context-Aware Notification Backend"
    app_version: str = "0.1.0"
    api_prefix: str = ""

    # Network settings for local/LAN access.
    host: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    port: int = int(os.getenv("BACKEND_PORT", "8000"))

    # Business rules
    idle_threshold_seconds: int = 30
    high_tab_switch_threshold: int = 5
    notification_interval_seconds: int = 10


settings = Settings()
