import React from "react";

const severityColor = (s) => {
  if (s >= 5) return "#ef4444";
  if (s === 4) return "#f97316";
  if (s === 3) return "#eab308";
  return "#6b7280";
};

const AlertsTable = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return <div style={{ fontSize: 13, color: "#6b7280" }}>No alerts.</div>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "#9ca3af" }}>
            <th style={{ padding: "8px 4px", borderBottom: "1px solid #111827" }}>
              Rule
            </th>
            <th style={{ padding: "8px 4px", borderBottom: "1px solid #111827" }}>
              Severity
            </th>
            <th style={{ padding: "8px 4px", borderBottom: "1px solid #111827" }}>
              Source IP
            </th>
            <th style={{ padding: "8px 4px", borderBottom: "1px solid #111827" }}>
              User
            </th>
            <th style={{ padding: "8px 4px", borderBottom: "1px solid #111827" }}>
              Count
            </th>
            <th style={{ padding: "8px 4px", borderBottom: "1px solid #111827" }}>
              Last seen
            </th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((a) => (
            <tr key={a.id}>
              <td style={{ padding: "8px 4px", borderBottom: "1px solid #020617" }}>
                {a.rule_name}
              </td>
              <td style={{ padding: "8px 4px", borderBottom: "1px solid #020617" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "999px",
                      backgroundColor: severityColor(a.severity)
                    }}
                  />
                  <span>{a.severity}</span>
                </span>
              </td>
              <td style={{ padding: "8px 4px", borderBottom: "1px solid #020617" }}>
                {a.source_ip || "Unknown"}
              </td>
              <td style={{ padding: "8px 4px", borderBottom: "1px solid #020617" }}>
                {a.username || "—"}
              </td>
              <td style={{ padding: "8px 4px", borderBottom: "1px solid #020617" }}>
                {a.count}
              </td>
              <td style={{ padding: "8px 4px", borderBottom: "1px solid #020617" }}>
                {new Date(a.last_seen).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlertsTable;
