function App() {
  const [activeTab, setActiveTab] = React.useState('visualizer');
  const [metrics, setMetrics] = React.useState({});
  const [subgraphs, setSubgraphs] = React.useState([]);
  const [schemaSdl, setSchemaSdl] = React.useState('');
  const [currentPlan, setCurrentPlan] = React.useState(null);

  const defaultSampleQuery = `query {
  orders {
    id
    totalAmount
    customer {
      name
    }
    products {
      name
      inventory {
        quantity
      }
    }
  }
}`;

  const loadData = async () => {
    try {
      const metricRes = await window.apiService.getMetrics();
      if (metricRes.overview) setMetrics(metricRes.overview);

      const subRes = await window.apiService.getSubgraphs();
      if (subRes.subgraphs) setSubgraphs(subRes.subgraphs);

      const planRes = await window.apiService.getQueryPlan(defaultSampleQuery);
      setCurrentPlan(planRes);

      const schemaRes = await window.apiService.getSupergraphSchema();
      if (schemaRes.sdl) setSchemaSdl(schemaRes.sdl);
    } catch (err) {
      console.error('Failed to load federation data:', err);
    }
  };

  React.useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        meshStatus="5/5 SUBGRAPHS HEALTHY"
      />

      <main className="main-content">
        <MeshMetricsOverview metrics={metrics} />

        {activeTab === 'visualizer' && (
          <QueryPlannerVisualizer
            plan={currentPlan}
            onExecuteSample={() => loadData()}
          />
        )}

        {activeTab === 'subgraphs' && (
          <SubgraphTopologyGrid subgraphs={subgraphs} />
        )}

        {activeTab === 'explorer' && (
          <GraphQLExplorerRunner />
        )}

        {activeTab === 'schema' && (
          <div className="visualizer-container">
            <h2>Composed Supergraph Schema (SDL)</h2>
            <div className="json-output" style={{ height: '500px', marginTop: '16px' }}>
              {schemaSdl || 'Loading Supergraph SDL...'}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

window.App = App;
