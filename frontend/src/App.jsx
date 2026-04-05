import React, { useEffect, useState } from "react";
import KPICards from "./components/KPICards.jsx";
import EventsChart from "./components/EventsChart.jsx";
import TopSources from "./components/TopSources.jsx";
import AlertsTable from "./components/AlertsTable.jsx";
import Sidebar from "./components/Sidebar.jsx";

const App = () => {
  const [overview, setOverview] = useState(null);
  const [timeSeries, setTimeSeries] = useState([]);
  const [topSources, setTopSources] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [securityMeasures, setSecurityMeasures] = useState(null);
  const [filters, setFilters] = useState({ severity: '', sourceIp: '' });

  const loadData = async () => {
    const [ov, ts, tsrc, al, sm] = await Promise.all([
      fetch("/api/overview").then((r) => r.json()),
      fetch("/api/events/time-series").then((r) => r.json()),
      
      fetch("/api/events/top-sources").then((r) => r.json()),
      fetch("/api/alerts").then((r) => r.json()),
      fetch("/api/security-measures").then((r) => r.json())
    ]);
    setOverview(ov);
    setTimeSeries(ts);
    console.log('TimeSeries data:', ts);  // Check browser console
    setTopSources(tsrc);
    setAlerts(al);
    setSecurityMeasures(sm);
  };

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 10000);
    return () => clearInterval(id);
  }, []);

  const handleIngest = async () => {
    await fetch("/api/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "sample_logs.csv" })
    });
    await loadData();
  };

  const handleDeleteAlert = async (alertId) => {
  const ok = window.confirm("Delete this alert?");
  if (!ok) return;

  const res = await fetch(`/api/alerts/${alertId}`, {
    method: "DELETE",
  });

  if (res.ok) {
    await loadData();
  } else {
    const data = await res.json().catch(() => ({}));
    alert(data.error || "Failed to delete alert");
  }
};

console.log("App handleDeleteAlert:", handleDeleteAlert);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#050816",
        color: "#f9fafb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      <Sidebar 
  securityMeasures={securityMeasures} 
  onIngest={handleIngest}
  onRefresh={loadData}
  onClearAlerts={async () => {
    await fetch("/api/alerts/clear", { method: "POST" });
    await loadData();
  }}
  filters={filters}
  onFiltersChange={setFilters}
/>
      <main style={{ flex: 1, padding: "24px 32px" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 24 }}>Spoofed</h1>
            <p style={{ margin: 0, marginTop: 4, color: "#9ca3af", fontSize: 14 }}>
              Security SIEM
            </p>
          </div>
          <button
            onClick={handleIngest}
            style={{
              padding: "8px 16px",
              backgroundColor: "#22c55e",
              border: "none",
              borderRadius: 999,
              color: "#020617",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Ingest sample logs
          </button>
        </header>

        <section style={{ marginBottom: 24 }}>
          {overview && <KPICards overview={overview} />}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 24,
            marginBottom: 24
          }}
        >
          <div
            style={{
              backgroundColor: "#020617",
              borderRadius: 16,
              padding: 16,
              border: "1px solid #111827"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8
              }}
            >
              <h2 style={{ margin: 0, fontSize: 16 }}>Events over time</h2>
              <span style={{ fontSize: 12, color: "#6b7280" }}>Last 24 hours</span>
            </div>
            <EventsChart data={timeSeries} />
          </div>

          <div
            style={{
              backgroundColor: "#020617",
              borderRadius: 16,
              padding: 16,
              border: "1px solid #111827"
            }}
          >
            <h2 style={{ margin: 0, marginBottom: 8, fontSize: 16 }}>Top source IPs</h2>
            <TopSources data={topSources} />
          </div>
        </section>

        <section
  style={{
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 16,
    border: "1px solid #111827"
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8
    }}
  >
    <div>
      <h2 style={{ margin: 0, fontSize: 16 }}>Active alerts</h2>
      <span style={{ fontSize: 12, color: "#6b7280" }}>Top 50 by severity</span>
    </div>
    <button
      onClick={async () => {
        await fetch("/api/alerts/clear", { method: "POST" });
        await loadData(); // reuse your existing function to refresh overview/alerts
      }}
      style={{
        padding: "6px 12px",
        borderRadius: 999,
        border: "1px solid #111827",
        backgroundColor: "#020617",
        color: "#e5e7eb",
        fontSize: 12,
        cursor: "pointer"
      }}
    >
      Clear alerts
    </button>
  </div>
  <AlertsTable 
  alerts={alerts}
  filters={filters}
  onFiltersChange={setFilters}
  onDeleteAlert={handleDeleteAlert}
/>
</section>

      </main>
    </div>
  );
};

export default App;
