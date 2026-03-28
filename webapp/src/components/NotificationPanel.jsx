export default function NotificationPanel({ notifications }) {
  return (
    <section className="panel">
      <h3>Notification Queue</h3>
      <p className="muted">Pending: {notifications.pending_count}</p>

      <div className="list-wrap">
        <div>
          <h4>Delayed</h4>
          {notifications.delayed.length === 0 ? (
            <p className="empty">No delayed notifications</p>
          ) : (
            <ul>
              {notifications.delayed.slice(-5).reverse().map((item) => (
                <li key={`delayed-${item.id}`}>{item.title}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4>Delivered</h4>
          {notifications.delivered.length === 0 ? (
            <p className="empty">No delivered notifications</p>
          ) : (
            <ul>
              {notifications.delivered.slice(-5).reverse().map((item) => (
                <li key={`delivered-${item.id}`}>{item.title}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
