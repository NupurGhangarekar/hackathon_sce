from datetime import datetime, timedelta
from collections import defaultdict
from typing import Optional

from models.schemas import AttentionDebtScore, InterruptionCost


class AttentionDebtEngine:
    """
    Tracks and calculates the 'attention debt' - the cumulative cost
    of context switching and interruptions throughout the day.
    """

    def __init__(self) -> None:
        self.interruption_costs: list[InterruptionCost] = []
        self._next_id = 1
        # Cost matrices based on research
        self.context_switch_cost_minutes = 5  # Average cost to regain focus
        self.focus_loss_percentage_base = 15  # Base % of focus lost per interruption

    def record_interruption(
        self,
        source: str,
        context_switch_severity: float = 1.0,
        focus_loss_percentage: Optional[float] = None,
    ) -> InterruptionCost:
        """
        Record an interruption and calculate its cost.
        
        Args:
            source: Source of interruption (e.g., "group chats", "email", "notification")
            context_switch_severity: Multiplier for context switch cost (1.0-3.0)
            focus_loss_percentage: Optional custom focus loss percentage
        """
        context_switch_cost = self.context_switch_cost_minutes * context_switch_severity
        focus_loss = focus_loss_percentage or (
            self.focus_loss_percentage_base * context_switch_severity
        )
        recovery_time = self._estimate_recovery_time(
            focus_loss, context_switch_severity
        )
        total_cost = context_switch_cost + recovery_time

        cost = InterruptionCost(
            id=self._next_id,
            timestamp=datetime.utcnow(),
            source=source,
            context_switch_cost_minutes=context_switch_cost,
            focus_loss_percentage=min(focus_loss, 100),  # Cap at 100%
            estimated_recovery_minutes=recovery_time,
            total_cost_minutes=total_cost,
        )
        self._next_id += 1
        self.interruption_costs.append(cost)
        return cost

    def get_attention_debt_score(self) -> AttentionDebtScore:
        """Calculate comprehensive attention debt for today"""
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_costs = [
            cost
            for cost in self.interruption_costs
            if cost.timestamp >= today_start
        ]

        if not today_costs:
            return self._empty_debt_score()

        # Calculate totals
        total_interruptions = len(today_costs)
        total_time_lost = sum(cost.total_cost_minutes for cost in today_costs)

        # Find most costly source
        source_costs = defaultdict(float)
        for cost in today_costs:
            source_costs[cost.source] += cost.total_cost_minutes
        most_costly_source = max(source_costs, key=source_costs.get) if source_costs else "unknown"

        # Find peak disruption window
        hour_counts = defaultdict(int)
        for cost in today_costs:
            hour = cost.timestamp.hour
            hour_counts[hour] += 1
        
        if hour_counts:
            peak_hour = max(hour_counts, key=hour_counts.get)
            peak_disruption_window = f"{peak_hour:02d}:00 - {peak_hour + 1:02d}:00"
        else:
            peak_disruption_window = "N/A"

        # Calculate focus recovery time
        avg_focus_loss = sum(cost.focus_loss_percentage for cost in today_costs) / len(
            today_costs
        )
        focus_recovery_hours = (100 - avg_focus_loss) / 100 * 0.5  # Heuristic

        # Build interruptions by hour and source
        interruptions_by_hour = {
            f"{hour:02d}:00": count for hour, count in hour_counts.items()
        }
        interruptions_by_source = dict(
            sorted(source_costs.items(), key=lambda x: x[1], reverse=True)
        )

        return AttentionDebtScore(
            total_interruptions_today=total_interruptions,
            total_time_lost_minutes=round(total_time_lost, 2),
            most_costly_source=most_costly_source,
            peak_disruption_window=peak_disruption_window,
            focus_recovery_time_hours=round(focus_recovery_hours, 1),
            interruptions_by_hour=interruptions_by_hour,
            interruptions_by_source={
                k: round(v, 2) for k, v in interruptions_by_source.items()
            },
        )

    def _estimate_recovery_time(
        self, focus_loss: float, severity: float
    ) -> float:
        """Estimate recovery time based on focus loss and severity"""
        # Recovery time scales with focus loss percentage
        base_recovery = (focus_loss / 100) * 15  # Max 15 minutes
        return base_recovery * severity

    def _empty_debt_score(self) -> AttentionDebtScore:
        """Return empty/zero debt score"""
        return AttentionDebtScore(
            total_interruptions_today=0,
            total_time_lost_minutes=0.0,
            most_costly_source="None",
            peak_disruption_window="N/A",
            focus_recovery_time_hours=0.0,
            interruptions_by_hour={},
            interruptions_by_source={},
        )

    def get_recent_interruptions(self, limit: int = 10) -> list[InterruptionCost]:
        """Get recent interruptions"""
        return self.interruption_costs[-limit:]


attention_debt_engine = AttentionDebtEngine()
