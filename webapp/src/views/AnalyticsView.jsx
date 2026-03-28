import ActivityTimelinePanel from '../components/ActivityTimelinePanel';
import DebtTimelinePanel from '../components/DebtTimelinePanel';
import AttentionDebtPanel from '../components/AttentionDebtPanel';

export default function AnalyticsView() {
  return (
    <div className="fade-in">
      <div className="grid-2">
        <ActivityTimelinePanel />
        <AttentionDebtPanel />
      </div>
      <div style={{ marginTop: '24px' }}>
        <DebtTimelinePanel />
      </div>
    </div>
  );
}
