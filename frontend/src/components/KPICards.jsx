import React from "react";

const Card = ({ label, value, accent }) => (
  <div
    style={{
      backgroundColor: "#020617",
      borderRadius: 16,
      padding: 16,
      border: "1px solid #111827",
      display: "flex",
      flexDirection: "column",
      gap: 4
    }}
  >
    <span style={{ fontSize: 12, color: "#6b7280" }}>{label}</span>
    <span style={{ fontSize: 22, fontWeight: 600 }}>{value}</span>
    {accent && (
      <span style={{ fontSize: 11, color: accent.color }}>{accent.text}</span>
    )}
  </div>
);

const KPICards = ({ overview }) => {
  const {
    total_events,
    events_24h,
    high_severity_events,
    unique_sources,
    alerts
  } = overview;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 16
      }}
    >
      <Card
        label="Total events"
        value={total_events}
        accent={{ text: "All time", color: "#6b7280" }}
      />
      <Card
        label="Events (24h)"
        value={events_24h}
        accent={{ text: "Recent activity", color: "#22c55e" }}
      />
      <Card
        label="High severity"
        value={high_severity_events}
        accent={{ text: "Severity ≥ 4", color: "#f97316" }}
      />
      <Card
        label="Unique sources"
        value={unique_sources}
        accent={{ text: "Distinct source IPs", color: "#38bdf8" }}
      />
      <Card
        label="Active alerts"
        value={alerts}
        accent={{ text: "Triggered rules", color: "#f97316" }}
      />
    </div>
  );
};

export default KPICards;
