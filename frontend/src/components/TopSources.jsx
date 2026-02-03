import React from "react";

const TopSources = ({ data }) => {
  if (!data || data.length === 0) {
    return <div style={{ fontSize: 13, color: "#6b7280" }}>No data.</div>;
  }

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map((row) => (
        <div key={row.source_ip}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              marginBottom: 4
            }}
          >
            <span style={{ color: "#e5e7eb" }}>{row.source_ip}</span>
            <span style={{ color: "#9ca3af" }}>{row.count}</span>
          </div>
          <div
            style={{
              backgroundColor: "#020617",
              borderRadius: 999,
              border: "1px solid #111827",
              overflow: "hidden",
              height: 6
            }}
          >
            <div
              style={{
                width: `${(row.count / max) * 100}%`,
                height: "100%",
                background:
                  "linear-gradient(90deg, rgba(56,189,248,1) 0%, rgba(34,197,94,1) 100%)"
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopSources;
