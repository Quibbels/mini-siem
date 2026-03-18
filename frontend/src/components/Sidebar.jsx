import React, { useRef } from 'react';

const Sidebar = ({ 
  securityMeasures, 
  onIngest, 
  onRefresh, 
  onClearAlerts, 
  filters, 
  onFiltersChange 
}) => {
  const blocked_ips = securityMeasures?.blocked_ips || [];
  const rules = securityMeasures?.rules || [];

  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    await fetch('/api/upload-logs', { method: 'POST', body: formData });
    // Refresh via parent
    if (onRefresh) onRefresh();
    fileInputRef.current.value = '';
  };

  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <aside style={{
      width: 260,
      borderRight: '1px solid #111827',
      padding: 16,
      background: 'radial-gradient(circle at top left, #0f172a 0%, #020617 45%, #020617 100%)',
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }}>
      {/* Logo/Header */}
      <div>
        <div style={{
          width: 36, height: 36, borderRadius: 999,
          background: 'radial-gradient(circle at 30% 0%, #22c55e 0%, #0f172a 40%, #020617 100%)',
          marginBottom: 12
        }} />
        <h2 style={{ margin: 0, fontSize: 16 }}>Security measures</h2>
        <p style={{ margin: 0, marginTop: 6, color: '#9ca3af', fontSize: 13 }}>
          Derived from correlation rules applied to normalized events.
        </p>
      </div>

      {/* Blocked IPs */}
      <div>
        <h3 style={{ margin: 0, marginBottom: 6, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.08, color: '#6b7280' }}>
          Blocked IPs
        </h3>
        {blocked_ips.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>None yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {blocked_ips.slice(0, 5).map((ip, i) => (
              <li key={ip || i} style={{ fontSize: 13, color: '#e5e7eb', padding: '4px 0' }}>
                {ip}
              </li>
            ))}
            {blocked_ips.length > 5 && (
              <li style={{ fontSize: 12, color: '#9ca3af' }}>
                +{blocked_ips.length - 5} more
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Detection Rules */}
      <div>
        <h3 style={{ margin: 0, marginBottom: 6, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.08, color: '#6b7280' }}>
          Detection rules
        </h3>
        {rules.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>No alerts yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {rules.slice(0, 8).map((r) => (
              <li key={r.rule_name} style={{
                fontSize: 13, color: '#e5e7eb', padding: '4px 0',
                display: 'flex', justifyContent: 'space-between', gap: 8
              }}>
                <span>{r.rule_name}</span>
                <span style={{ color: '#9ca3af' }}>{r.alerts}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick Filters */}
      <div>
        <h3 style={{ margin: 0, marginBottom: 8, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.08, color: '#6b7280' }}>
          Quick filters
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <select
            value={filters.severity || ''}
            onChange={(e) => updateFilter('severity', e.target.value)}
            style={{
              padding: '8px 12px', background: '#020617', border: '1px solid #374151',
              borderRadius: 6, color: '#f9fafb', fontSize: 13
            }}
          >
            <option value="">All severity</option>
            <option value="3">High (3+)</option>
            <option value="2">Medium (2+)</option>
            <option value="1">Low (1+)</option>
          </select>
          <input
            placeholder="Filter IP..."
            value={filters.sourceIp || ''}
            onChange={(e) => updateFilter('sourceIp', e.target.value)}
            style={{
              padding: '8px 12px', background: '#020617', border: '1px solid #374151',
              borderRadius: 6, color: '#f9fafb', fontSize: 13
            }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 style={{ margin: 0, marginBottom: 12, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.08, color: '#6b7280' }}>
          Quick actions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={onIngest}
            style={{
              padding: '8px 12px', borderRadius: 6, background: '#020617',
              border: '1px solid #374151', color: '#e5e7eb', fontSize: 13,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#22c55e'}
            onMouseOut={(e) => e.target.style.background = '#020617'}
          >
            🔄 Re-ingest sample
          </button>
          <input
            type="file"
            accept=".csv,.log"
            ref={fileInputRef}
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '8px 12px', borderRadius: 6, background: '#020617',
              border: '1px solid #374151', color: '#e5e7eb', fontSize: 13,
              cursor: 'pointer'
            }}
          >
            📁 Upload logs
          </button>
          <button
            onClick={onRefresh}
            style={{
              padding: '8px 12px', borderRadius: 6, background: '#020617',
              border: '1px solid #374151', color: '#e5e7eb', fontSize: 13,
              cursor: 'pointer'
            }}
          >
            🔄 Refresh now
          </button>
          {securityMeasures?.alerts > 0 && (
            <button
              onClick={onClearAlerts}
              style={{
                padding: '8px 12px', borderRadius: 6, background: '#020617',
                border: '1px solid #ef4444', color: '#ef4444', fontSize: 13,
                cursor: 'pointer'
              }}
            >
              🗑️ Clear alerts
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', fontSize: 11, color: '#6b7280' }}>
        <p style={{ margin: 0, marginBottom: 4 }}>
          Architecture: CSV log sources → ingestion script → SQLite → SIEM core → rules → dashboard.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
