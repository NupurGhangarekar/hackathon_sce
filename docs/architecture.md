# Architecture Notes

## Modules

- **Extension**: event capture and periodic telemetry push.
- **Backend**: rule engine + notification decision engine.
- **Webapp**: observability dashboard.

## Data Flow

1. Extension sends activity payload every 5 seconds to `POST /activity`.
2. Backend updates activity snapshot and computes focus state.
3. Notification simulator creates events every 10 seconds.
4. Decision engine queues or delivers events based on focus state.
5. Dashboard polls `GET /state` and `GET /notifications` every 4 seconds.

## In-Memory Data

- Current activity snapshot
- Current focus state
- Delayed notifications
- Delivered notifications

## Migration Hooks (Future)

- Persistence layer abstraction for DB providers.
- User session identity and per-user routing.
- ML-based state and priority scoring.
