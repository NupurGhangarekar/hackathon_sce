"""Activity Timeline Engine - Tracks URLs visited and time spent on each"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class ActivityEntry:
    """Represents a single activity/URL visit"""
    url: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_seconds: int = 0
    tab_name: str = ""
    
    @property
    def is_active(self) -> bool:
        return self.end_time is None
    
    def finalize(self, end_time: datetime):
        """Mark activity as complete"""
        self.end_time = end_time
        self.duration_seconds = int((end_time - self.start_time).total_seconds())


class ActivityTimelineEngine:
    """Tracks user activity timeline - which URLs they visited and for how long"""
    
    def __init__(self, max_history: int = 100):
        self.max_history = max_history
        self.activities: list[ActivityEntry] = []
        self.current_activity: Optional[ActivityEntry] = None
        self.last_update_time = datetime.now()
    
    def record_activity(self, url: str, tab_name: str = "") -> None:
        """Record a new activity/URL visit"""
        current_time = datetime.now()
        
        # Finalize previous activity if different URL
        if self.current_activity and self.current_activity.url != url:
            self.current_activity.finalize(current_time)
            self.activities.append(self.current_activity)
            
            # Keep only max_history entries
            if len(self.activities) > self.max_history:
                self.activities.pop(0)
        
        # Start new activity if different URL
        if not self.current_activity or self.current_activity.url != url:
            self.current_activity = ActivityEntry(
                url=url,
                start_time=current_time,
                tab_name=tab_name
            )
        
        self.last_update_time = current_time
    
    def finalize_all(self) -> None:
        """Finalize all activities (e.g., end of session)"""
        if self.current_activity and self.current_activity.is_active:
            self.current_activity.finalize(datetime.now())
            self.activities.append(self.current_activity)
            self.current_activity = None
    
    def get_activity_summary(self, minutes: int = 60) -> dict:
        """Get summary of activities in last N minutes"""
        cutoff_time = datetime.now().timestamp() - (minutes * 60)
        
        current_time = datetime.now()
        
        # Include current activity in calculation
        active_items = []
        if self.current_activity:
            active_items.append(self.current_activity)
        
        # Get activities within timeframe
        relevant_activities = [
            a for a in self.activities 
            if a.end_time and a.end_time.timestamp() > cutoff_time
        ] + active_items
        
        if not relevant_activities:
            return {
                "total_time_minutes": 0.0,
                "activities": [],
                "top_urls": []
            }
        
        # Calculate total time and group by URL
        url_times = {}
        total_seconds = 0
        
        for activity in relevant_activities:
            end_time = activity.end_time or current_time
            duration = int((end_time - activity.start_time).total_seconds())
            total_seconds += duration
            
            # Shorten URL for display
            display_url = self._get_display_url(activity.url)
            if display_url not in url_times:
                url_times[display_url] = {
                    "full_url": activity.url,
                    "duration_seconds": 0,
                    "visits": 0
                }
            
            url_times[display_url]["duration_seconds"] += duration
            url_times[display_url]["visits"] += 1
        
        # Sort by time spent
        top_urls = sorted(
            url_times.items(),
            key=lambda x: x[1]["duration_seconds"],
            reverse=True
        )
        
        return {
            "total_time_minutes": round(total_seconds / 60, 1),
            "activities": [
                {
                    "url": activity.url,
                    "tab_name": activity.tab_name,
                    "duration_seconds": activity.duration_seconds,
                    "start_time": activity.start_time.isoformat(),
                    "end_time": (activity.end_time or current_time).isoformat(),
                }
                for activity in relevant_activities
            ],
            "top_urls": [
                {
                    "display_name": display_url,
                    "full_url": data["full_url"],
                    "duration_seconds": data["duration_seconds"],
                    "duration_minutes": round(data["duration_seconds"] / 60, 1),
                    "visits": data["visits"],
                }
                for display_url, data in top_urls[:10]  # Top 10
            ]
        }
    
    def get_recent_activities(self, limit: int = 20) -> list[dict]:
        """Get recent activity history"""
        current_time = datetime.now()
        recent = (self.activities[-limit:] if self.activities else [])
        
        if self.current_activity and self.current_activity.is_active:
            recent = recent + [self.current_activity]
        
        return [
            {
                "url": a.url,
                "tab_name": a.tab_name,
                "duration_seconds": a.duration_seconds if a.end_time else int((current_time - a.start_time).total_seconds()),
                "start_time": a.start_time.isoformat(),
                "end_time": (a.end_time or current_time).isoformat(),
                "display_url": self._get_display_url(a.url),
            }
            for a in recent[-limit:]
        ]
    
    @staticmethod
    def _get_display_url(url: str) -> str:
        """Extract domain/app name from URL for display"""
        if not url:
            return "Unknown"
        
        # Remove protocol
        clean_url = url.replace("https://", "").replace("http://", "")
        
        # Extract domain
        domain = clean_url.split("/")[0].split("?")[0]
        
        # Map common domains to friendly names
        friendly_names = {
            "localhost:5173": "📊 Dashboard",
            "localhost": "Local App",
            "youtube.com": "🎬 YouTube",
            "github.com": "🐙 GitHub",
            "docs.google.com": "📝 Google Docs",
            "sheets.google.com": "📊 Google Sheets",
            "gmail.com": "📧 Gmail",
            "slack.com": "💬 Slack",
            "figma.com": "🎨 Figma",
            "linkedin.com": "💼 LinkedIn",
            "twitter.com": "🐦 Twitter",
            "reddit.com": "🔗 Reddit",
            "notion.so": "📋 Notion",
            "stackoverflow.com": "🔧 Stack Overflow",
            "medium.com": "📚 Medium",
        }
        
        for key, friendly in friendly_names.items():
            if key in domain:
                return friendly
        
        # Return just the domain if not recognized
        return domain.split("www.")[-1]


activity_timeline_engine = ActivityTimelineEngine()
