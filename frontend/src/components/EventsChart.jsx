import React from "react";

const EventsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div style={{ fontSize: 13, color: "#6b7280" }}>No data.</div>;
  }

  const values = data.map((d) => d.count);
  const max = Math.max(...values, 1);

  const width = 600;
  const height = 180;
  const padding = 24;
  const step = data.length > 1 ? (width - 2 * padding) / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = padding + i * step;
    const y = height - padding - (d.count / max) * (height - 2 * padding);
    return { x, y };
  });

  const path = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="#111827"
        strokeWidth="1"
      />
      <line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={height - padding}
        stroke="#111827"
        strokeWidth="1"
      />

      <path
        d={path}
        fill="none"
        stroke="#22c55e"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#22c55e" />
      ))}
    </svg>
  );
};

export default EventsChart;
