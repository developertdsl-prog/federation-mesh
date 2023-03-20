function Navbar({ activeTab, setActiveTab, meshStatus }) {
  return (
    <nav className="navbar">
      <div className="brand-section">
        <span className="brand-logo">🌐</span>
        <span className="brand-title">Federation-Mesh</span>
        <span className="brand-badge">Supergraph Router v2.0</span>
      </div>

      <div className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'visualizer' ? 'active' : ''}`}
          onClick={() => setActiveTab('visualizer')}
        >
          Query Planner DAG
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'subgraphs' ? 'active' : ''}`}
          onClick={() => setActiveTab('subgraphs')}
        >
          Subgraphs Topology
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'explorer' ? 'active' : ''}`}
          onClick={() => setActiveTab('explorer')}
        >
          GraphQL Explorer
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'schema' ? 'active' : ''}`}
          onClick={() => setActiveTab('schema')}
        >
          Supergraph Schema
        </button>
      </div>

      <div className="nav-status">
        <div className="status-indicator">
          <div className="status-dot"></div>
          <span>{meshStatus || 'ROUTER ONLINE'}</span>
        </div>
      </div>
    </nav>
  );
}

window.Navbar = Navbar;
