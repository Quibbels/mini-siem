import React from 'react';

const EventsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: 180, color: '#6b7280', fontSize: 13
      }}>
        <div style={{ fontSize: 48, opacity: 0.3 }}>📈</div>
        <div>No events in last 24h</div>
        <div style={{ fontSize: 11, marginTop: 4 }}>Upload logs to see trends</div>
      </div>
    );
  }

  const values = data.map(d => d.count);
  const total = values.reduce((a, b) => a + b, 0);
  const max = Math.max(...values, 1);
  const avg = total / data.length;

  const width = 600;
  const height = 180;
  const padding = { top: 24, right: 24, bottom: 24, left: 40 };
  const step = data.length > 1 ? (width - padding.left - padding.right) / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = padding.left + i * step;
    const y = height - padding.bottom - (d.count / max) * (height - padding.top - padding.bottom);
    return { x, y, count: d.count };
  });

  const path = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  return (
    <div style={{ position: 'relative' }}>
      {/* Legend/Stats */}
      <div style={{
        position: 'absolute', top: 0, right: 8, textAlign: 'right', fontSize: 11, color: '#9ca3af'
      }}>
        <div>{total.toLocaleString()} total</div>
        <div>⌀ {Math.round(avg)} avg/hr</div>
      </div>

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Grid */}
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} 
              stroke="#111827" strokeWidth="1" />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} 
              stroke="#111827" strokeWidth="1" />

        {/* Y-axis labels */}
        <text x={padding.left - 8} y={padding.top + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
          {max.toLocaleString()}
        </text>
        <text x={padding.left - 8} y={height - padding.bottom - 2} textAnchor="end" fontSize="10" fill="#9ca3af">
          0
        </text>

        {/* Chart line/path */}
        <path d={path} fill="none" stroke="url(#lineGradient)" strokeWidth="2" 
              strokeLinejoin="round" strokeLinecap="round" />
        
        {/* Points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#22c55e" />
        ))}
      </svg>

      {/* X-axis labels (hours) */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: 4,
        fontSize: 11, color: '#9ca3af', padding: `0 ${padding.right}px`
      }}>
        {data.slice(0, 6).map((d, i) => (  // Show first 6 labels
          <span key={i}>{new Date(d.bucket).getHours()}h</span>
        ))}
        {data.length > 6 && <span>...</span>}
      </div>
    </div>
  );
};

export default EventsChart;
