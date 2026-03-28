import AttentionDebtPanel from '../components/AttentionDebtPanel';
import DebtTimelinePanel from '../components/DebtTimelinePanel';

export default function DebtView() {
  return (
    <div className="fade-in perspective-container">
      <div className="preserve-3d shadow-lg">
        <AttentionDebtPanel />
      </div>
      <div style={{ marginTop: '24px' }} className="preserve-3d">
        <DebtTimelinePanel />
      </div>
    </div>
  );
}
