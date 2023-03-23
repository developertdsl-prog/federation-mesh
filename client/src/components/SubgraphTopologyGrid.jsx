function SubgraphTopologyGrid({ subgraphs = [] }) {
  return (
    <div className="subgraphs-grid">
      {subgraphs.map((sub) => (
        <div key={sub.name} className="subgraph-card">
          <div className="subgraph-card-header">
            <span className="subgraph-title">{sub.name.toUpperCase()}</span>
            <span style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: 'bold' }}>
              ● {sub.status || 'UP'} (Port {sub.port})
            </span>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Entities Exposed:
          </div>
          <div className="subgraph-entities">
            {sub.entities && sub.entities.map(e => (
              <span key={e} className="entity-pill">@{e}</span>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-muted)' }}>
            Last Heartbeat: {new Date(sub.lastHeartbeat || Date.now()).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}

window.SubgraphTopologyGrid = SubgraphTopologyGrid;
