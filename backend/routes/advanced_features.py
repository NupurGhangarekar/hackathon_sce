from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime

from models.schemas import (
    ContextCapsuleResponse,
    AttentionDebtResponse,
    ActionCompressionResponse,
    ActivityPayload,
)
from services.context_capsule_engine import context_capsule_engine
from services.attention_debt_engine import attention_debt_engine
from services.action_compression_engine import action_compression_engine
from services.notification_engine import notification_engine

router = APIRouter(prefix="/api/v1", tags=["advanced-features"])


# Feature 2: Context Capsule Endpoints
@router.post("/context-capsule/create", response_model=ContextCapsuleResponse)
def create_context_capsule(payload: ActivityPayload) -> ContextCapsuleResponse:
    """Create a new context capsule from current activity"""
    try:
        capsule = context_capsule_engine.create_capsule(
            current_app=payload.active_url.split("://")[-1].split("/")[0]
            if payload.active_url
            else "Unknown",
            file_name=payload.current_file,
            active_url=payload.active_url,
            clipboard_snippet=payload.clipboard_snippet,
            last_activity="typing",  # Can be inferred from payload
            interruption_source="System",  # Can track actual source
        )
        context_capsule_engine.store_capsule(capsule)
        return ContextCapsuleResponse(context_capsule=capsule, status="created")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/context-capsule/current", response_model=ContextCapsuleResponse)
def get_current_capsule() -> ContextCapsuleResponse:
    """Get the current context capsule"""
    capsule = context_capsule_engine.get_current_capsule()
    return ContextCapsuleResponse(
        context_capsule=capsule,
        status="found" if capsule else "no_capsule"
    )


@router.get("/context-capsule/history")
def get_capsule_history(limit: int = 10) -> dict:
    """Get recent context capsules"""
    history = context_capsule_engine.get_capsule_history(limit)
    return {"capsules": history, "count": len(history)}


# Feature 3: Attention Debt Score Endpoints
@router.post("/attention-debt/record-interruption")
def record_interruption(
    source: str,
    severity: float = 1.0,
) -> dict:
    """Record an interruption and its cost"""
    try:
        cost = attention_debt_engine.record_interruption(source, severity)
        return {"status": "recorded", "cost_minutes": cost.total_cost_minutes}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/attention-debt/score", response_model=AttentionDebtResponse)
def get_attention_debt() -> AttentionDebtResponse:
    """Get current attention debt score"""
    score = attention_debt_engine.get_attention_debt_score()
    return AttentionDebtResponse(attention_debt=score, status="ok")


@router.get("/attention-debt/recent-interruptions")
def get_recent_interruptions(limit: int = 10) -> dict:
    """Get recent interruption records"""
    interruptions = attention_debt_engine.get_recent_interruptions(limit)
    return {"interruptions": interruptions, "count": len(interruptions)}


# Feature 4: Action Compression Endpoints
@router.get("/actions/compress", response_model=ActionCompressionResponse)
def compress_pending_notifications() -> ActionCompressionResponse:
    """Compress pending notifications into actionable tasks"""
    try:
        all_notifications = (
            notification_engine.delayed_notifications
            + notification_engine.delivered_notifications
        )

        if not all_notifications:
            return ActionCompressionResponse(
                actions=[],
                total_notifications=0,
                compressed_actions=0,
                status="no_notifications",
            )

        actions = action_compression_engine.compress_notifications(all_notifications)

        return ActionCompressionResponse(
            actions=actions,
            total_notifications=len(all_notifications),
            compressed_actions=len(actions),
            status="ok",
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/actions/pending")
def get_pending_actions() -> dict:
    """Get all pending compressed actions including context-aware suggestions"""
    try:
        from services.activity_timeline_engine import activity_timeline_engine
        
        all_notifications = (
            notification_engine.delayed_notifications
            + notification_engine.delivered_notifications
        )
        actions = action_compression_engine.compress_notifications(all_notifications)

        # Generate context-aware smart actions based on current activity
        activity_summary = activity_timeline_engine.get_activity_summary(minutes=20)
        context_actions = _generate_context_aware_actions(activity_summary)
        
        # Combine notification-based and context-aware actions
        all_actions = actions + context_actions

        # Group by category
        by_category = {}
        for action in all_actions:
            if action.category not in by_category:
                by_category[action.category] = []
            by_category[action.category].append(action)

        return {
            "actions": sorted(all_actions, key=lambda x: {"high": 0, "medium": 1, "low": 2}.get(x.priority, 999)),
            "by_category": by_category,
            "total": len(all_actions),
            "notification_based": len(actions),
            "context_aware": len(context_actions),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def _generate_context_aware_actions(activity_summary: dict) -> list:
    """Generate smart actions based on what user is currently doing"""
    from models.schemas import ActionItem
    from datetime import datetime
    
    actions = []
    action_id = action_compression_engine._next_id
    
    # Analyze top URLs to generate relevant suggestions
    top_urls = activity_summary.get("top_urls", [])
    
    if not top_urls:
        return actions
    
    current_url = top_urls[0] if top_urls else {}
    display_url = current_url.get("display_name", "")
    
    # Smart action suggestions based on context
    context_suggestions = {
        "🎬 YouTube": [
            ("Save video link for later", "share", "low", 1),
            ("Add to watch later playlist", "task", "low", 2),
        ],
        "🐙 GitHub": [
            ("Review pending pull requests", "review", "high", 10),
            ("Check CI/CD pipeline status", "review", "medium", 5),
        ],
        "📝 Google Docs": [
            ("Save current document", "confirm", "medium", 1),
            ("Share document with team", "send", "high", 2),
        ],
        "📊 Google Sheets": [
            ("Export spreadsheet data", "send", "medium", 3),
            ("Share updated sheet", "send", "high", 2),
        ],
        "💬 Slack": [
            ("Check unread messages", "review", "medium", 5),
            ("Respond to pending questions", "send", "high", 5),
        ],
        "📧 Gmail": [
            ("Reply to important emails", "send", "high", 10),
            ("Archive processed emails", "task", "low", 5),
        ],
        "🎨 Figma": [
            ("Export design assets", "send", "medium", 5),
            ("Share design review link", "send", "high", 2),
        ],
    }
    
    # Generate context-specific actions
    suggestions = context_suggestions.get(display_url, [])
    
    for action_text, category, priority, time_est in suggestions:
        action = ActionItem(
            id=action_id,
            original_notification=f"Context: {display_url}",
            action_text=action_text,
            priority=priority,
            category=category,
            estimated_time_minutes=time_est,
            source="Context Analysis",
        )
        actions.append(action)
        action_id += 1
    
    action_compression_engine._next_id = action_id
    return actions



@router.post("/attention-debt/simulate-interruption")
def simulate_interruption(
    source: str = "group chats",
    severity: float = 1.5,
) -> dict:
    """Simulate an interruption for demo/testing"""
    cost = attention_debt_engine.record_interruption(source, severity)
    return {
        "status": "simulated",
        "source": source,
        "context_switch_cost": cost.context_switch_cost_minutes,
        "focus_loss": f"{cost.focus_loss_percentage:.1f}%",
        "recovery_time": cost.estimated_recovery_minutes,
        "total_debt_added": cost.total_cost_minutes,
    }


@router.get("/demo/auto-simulate")
def auto_simulate_demo() -> dict:
    """Auto-generate demo data for testing"""
    import random
    
    sources = ["Slack", "Email", "Teams", "Chat", "Notifications"]
    
    # Randomly create context capsule
    if random.random() > 0.3:
        capsule = context_capsule_engine.create_capsule(
            current_app=random.choice(["VSCode", "Chrome", "Figma"]),
            file_name=random.choice(["notification_classifier.py", "design.figma", "proposal.docx"]),
            active_url=random.choice(["https://github.com", "https://slack.com", "https://gmail.com"]),
            clipboard_snippet=random.choice(["Project deadline", "Meeting notes", "Code snippet"]),
            last_activity=random.choice(["typing", "scrolling", "tabSwitch"]),
            interruption_source=random.choice(sources),
        )
        context_capsule_engine.store_capsule(capsule)
    
    # Record interruption
    if random.random() > 0.4:
        cost = attention_debt_engine.record_interruption(
            source=random.choice(sources),
            context_switch_severity=random.uniform(0.5, 2.0)
        )
    
    # Generate demo notifications and compress them
    if random.random() > 0.5:
        from models.schemas import NotificationItem
        demo_messages = [
            ("Can you send me the PPT?", "Send latest PPT"),
            ("Need attendance sheet", "Share attendance sheet"),
            ("Can we meet at 5?", "Confirm 5 PM meeting"),
            ("Review final deck", "Review final deck"),
            ("Bug in production", "Fix production issue"),
        ]
        msg, summary = random.choice(demo_messages)
        notif = NotificationItem(
            id=notification_engine._next_id,
            title=random.choice(sources),
            message=msg,
            created_at=datetime.utcnow(),
        )
        notification_engine._next_id += 1
        notification_engine.process_notification(notif)
    
    return {"status": "demo_data_generated"}


# Feature: Activity Timeline Visualization
@router.get("/timeline/activity-summary")
def get_activity_summary(minutes: int = 60) -> dict:
    """Get summary of URLs visited and time spent in last N minutes"""
    from services.activity_timeline_engine import activity_timeline_engine
    return activity_timeline_engine.get_activity_summary(minutes=minutes)


@router.get("/timeline/recent-activities")
def get_recent_activities(limit: int = 20) -> dict:
    """Get recent activity history"""
    from services.activity_timeline_engine import activity_timeline_engine
    recent = activity_timeline_engine.get_recent_activities(limit=limit)
    return {"activities": recent}


@router.get("/dashboard/debt-timeline")
def get_debt_timeline() -> dict:
    """Get attention debt metrics over time"""
    debt_score = attention_debt_engine.get_attention_debt_score()
    
    # Get recent interruptions for timeline
    recent_interruptions = attention_debt_engine.interruption_history[-30:] if hasattr(attention_debt_engine, 'interruption_history') else []
    
    timeline_points = []
    cumulative_debt = 0
    
    for i, interruption in enumerate(recent_interruptions):
        cumulative_debt += interruption.get("total_cost_minutes", 0)
        timeline_points.append({
            "time": i,
            "timestamp": interruption.get("timestamp", ""),
            "debt": round(cumulative_debt, 1),
            "source": interruption.get("source", "Unknown"),
            "cost": round(interruption.get("total_cost_minutes", 0), 1),
        })
    
    return {
        "current_debt": debt_score.total_debt_minutes,
        "debt_level": debt_score.debt_level,
        "interruptions_today": debt_score.total_interruptions,
        "total_time_lost": round(debt_score.total_debt_minutes, 1),
        "timeline": timeline_points,
        "interruptions_by_hour": debt_score.interruptions_by_hour,
    }


@router.get("/dashboard/stats")
def get_dashboard_stats() -> dict:
    """Get comprehensive dashboard statistics"""
    from services.activity_timeline_engine import activity_timeline_engine
    
    activity_summary = activity_timeline_engine.get_activity_summary(minutes=60)
    debt_data = attention_debt_engine.get_attention_debt_score()
    
    return {
        "activity_stats": {
            "total_time_minutes": activity_summary["total_time_minutes"],
            "top_urls": activity_summary["top_urls"][:5],
            "url_count": len(activity_summary["top_urls"]),
        },
        "debt_stats": {
            "total_debt_minutes": debt_data.total_debt_minutes,
            "debt_level": debt_data.debt_level,
            "interruption_count": debt_data.total_interruptions,
            "time_lost_minutes": round(debt_data.total_debt_minutes, 1),
        },
        "focus_insights": {
            "most_interrupted_hour": max(
                enumerate(debt_data.interruptions_by_hour),
                key=lambda x: x[1]
            ) if debt_data.interruptions_by_hour else (0, 0),
            "peak_interruption_window": "Not enough data",
        }
    }
