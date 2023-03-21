function MeshMetricsOverview({ metrics = {} }) {
  return (
    <div className="metrics-grid">
      <div className="kpi-card">
        <div className="kpi-title">Average Latency</div>
        <div className="kpi-value">{metrics.averageLatencyMs || 18} ms</div>
        <div className="kpi-subtext">P99: {metrics.p99LatencyMs || 34} ms</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title">Throughput</div>
        <div className="kpi-value">{metrics.throughputRps || 284.5}</div>
        <div className="kpi-subtext">Requests / second</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title">DataLoader Savings</div>
        <div className="kpi-value">{metrics.dataLoaderSavingsPct || 68.4}%</div>
        <div className="kpi-subtext">N+1 Queries Eliminated</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title">Query Cache Hit Ratio</div>
        <div className="kpi-value">{metrics.cacheHitRatio || 42.5}%</div>
        <div className="kpi-subtext">AST Plan Fingerprinting</div>
      </div>
    </div>
  );
}

window.MeshMetricsOverview = MeshMetricsOverview;
