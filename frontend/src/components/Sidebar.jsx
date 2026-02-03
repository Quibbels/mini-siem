import React from "react";

const Sidebar = ({ securityMeasures, onIngest }) => {
  const blocked =
    securityMeasures && securityMeasures.blocked_ips
      ? securityMeasures.blocked_ips
      : [];
  const rules =
    securityMeasures && securityMeasures.rules ? securityMeasures.rules : [];

  return (
    <aside
      style={{
        width: 260,
        borderRight: "1px solid #111827",
        padding: 16,
        background:
          "radial-gradient(circle at top left, #0f172a 0, #020617 45%, #020617 100%)",
        display: "flex",
        flexDirection: "column",
        gap: 24
      }}
    >
      <div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background:
              "radial-gradient(circle at 30% 0%, #22c55e 0, #0f172a 40%, #020617 100%)",
            marginBottom: 12
          }}
        />
        <h2 style={{ margin: 0, fontSize: 16 }}>Security measures</h2>
        <p style={{ margin: 0, marginTop: 6, color: "#9ca3af", fontSize: 13 }}>
          Derived from correlation rules applied to normalized events.
        </p>
      </div>

      <div>
        <h3
          style={{
            margin: 0,
            marginBottom: 6,
            fontSize: 13,
            textTransform: "uppercase",
            letterSpacing: 0.08,
            color: "#6b7280"
          }}
        >
          Blocked IPs
        </h3>
        {blocked.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>None yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {blocked.map((ip) => (
              <li
                key={ip}
                style={{
                  fontSize: 13,
                  color: "#e5e7eb",
                  padding: "4px 0"
                }}
              >
                {ip}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3
          style={{
            margin: 0,
            marginBottom: 6,
            fontSize: 13,
            textTransform: "uppercase",
            letterSpacing: 0.08,
            color: "#6b7280"
          }}
        >
          Detection rules
        </h3>
        {rules.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>No alerts yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {rules.map((r) => (
              <li
                key={r.rule_name}
                style={{
                  fontSize: 13,
                  color: "#e5e7eb",
                  padding: "4px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8
                }}
              >
                <span>{r.rule_name}</span>
                <span style={{ color: "#9ca3af" }}>{r.alerts}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: "auto", fontSize: 11, color: "#6b7280" }}>
        <p style={{ margin: 0, marginBottom: 4 }}>
          Architecture: CSV log sources → ingestion script → SQLite SIEM core →
          rules → dashboard.
        </p>
        <button
          onClick={onIngest}
          style={{
            marginTop: 8,
            padding: "6px 10px",
            borderRadius: 999,
            backgroundColor: "#020617",
            border: "1px solid #111827",
            color: "#e5e7eb",
            fontSize: 11,
            cursor: "pointer"
          }}
        >
          Re-ingest logs
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
