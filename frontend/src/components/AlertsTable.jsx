import React from "react";

const severityColor = (s) => {
  if (s >= 3) return "#ef4444";
  if (s >= 2) return "#f97316";
  return "#6b7280";
};

const AlertsTable = ({ alerts, filters, onFiltersChange, onDeleteAlert }) => {
  const filteredAlerts = alerts.filter((alert) =>
    (!filters.severity || alert.severity >= parseInt(filters.severity)) &&
    (!filters.sourceIp ||
      alert.source_ip?.toLowerCase().includes(filters.sourceIp.toLowerCase()))
  );

  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div style={{ fontSize: 13, color: "#6b7280", padding: "32px", textAlign: "center" }}>
        No alerts
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr auto",
          gap: 12,
          marginBottom: 16,
          padding: "12px 0",
          borderBottom: "1px solid #111827"
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: 12,
              color: "#9ca3af",
              marginBottom: 4
            }}
          >
            Min Severity
          </label>
          <select
            value={filters.severity || ""}
            onChange={(e) => updateFilter("severity", e.target.value)}
            style={{
              width: "100%",
              padding: "6px 8px",
              background: "#020617",
              border: "1px solid #374151",
              borderRadius: 6,
              color: "#f9fafb",
              fontSize: 13
            }}
          >
            <option value="">All</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3</option>
          </select>
        </div>

        <input
          placeholder="Source IP"
          value={filters.sourceIp || ""}
          onChange={(e) => updateFilter("sourceIp", e.target.value)}
          style={{
            padding: "6px 8px",
            background: "#020617",
            border: "1px solid #374151",
            borderRadius: 6,
            color: "#f9fafb",
            fontSize: 13
          }}
        />

        {Object.values(filters).some((v) => v) && (
          <button
            onClick={() => onFiltersChange({ severity: "", sourceIp: "" })}
            style={{
              padding: "6px 12px",
              background: "#6b7280",
              border: "none",
              borderRadius: 6,
              color: "#020617",
              fontSize: 12,
              cursor: "pointer"
            }}
          >
            Clear ({filteredAlerts.length})
          </button>
        )}
      </div>

      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>
        Showing {filteredAlerts.length} of {alerts.length} alerts
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#9ca3af" }}>
              <th style={{ padding: "8px 4px", borderBottom: "1px solid #111827" }}>Last Seen</th>
              <th style={{ padding: "8px 4px", borderBottom: "1px solid #111827" }}>Source IP</th>
              <th style={{ padding: "8px 4px", borderBottom: "1px solid #111827" }}>Destination IP</th>
              <th style={{ padding: "8px 4px", borderBottom: "1px solid #111827" }}>Protocol</th>
              <th style={{ padding: "8px 4px", borderBottom: "1px solid #111827" }}>Threat Label</th>
              <th style={{ padding: "8px 4px", borderBottom: "1px solid #111827" }}>Severity</th>
              <th style={{ padding: "8px 4px", borderBottom: "1px solid #111827" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map((a) => (
              <tr key={a.id}>
                <td style={{ padding: "8px 4px", borderBottom: "1px solid #020617" }}>
                  {a.last_seen ? new Date(a.last_seen).toLocaleString() : "Unknown"}
                </td>
                <td style={{ padding: "8px 4px", borderBottom: "1px solid #020617" }}>
                  {a.source_ip || "Unknown"}
                </td>
                <td style={{ padding: "8px 4px", borderBottom: "1px solid #020617" }}>
                  {a.dest_ip || "Unknown"}
                </td>
                <td style={{ padding: "8px 4px", borderBottom: "1px solid #020617" }}>
                  {a.protocol || a.event_type || "Unknown"}
                </td>
                <td style={{ padding: "8px 4px", borderBottom: "1px solid #020617" }}>
                  {a.threat_label || "Unknown"}
                </td>
                <td style={{ padding: "8px 4px", borderBottom: "1px solid #020617" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
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
                  <button
                    onClick={() => onDeleteAlert(a.id)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      border: "1px solid #7f1d1d",
                      backgroundColor: "#111827",
                      color: "#fca5a5",
                      fontSize: 12,
                      cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredAlerts.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: 32, textAlign: "center", color: "#6b7280" }}>
                  No matching alerts
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertsTable;