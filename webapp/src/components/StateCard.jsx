function stateClassName(state) {
  if (state === "idle") return "state-idle";
  if (state === "distracted") return "state-distracted";
  return "state-focused";
}

export default function StateCard({ state }) {
  return (
    <section className={`panel state-card ${stateClassName(state)}`}>
      <p className="muted">Current Focus State</p>
      <h2>{state}</h2>
    </section>
  );
}
