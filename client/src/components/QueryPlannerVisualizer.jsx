function QueryPlannerVisualizer({ plan, onExecuteSample }) {
  if (!plan) {
    return <div className="visualizer-container">Loading Query Plan DAG...</div>;
  }

  return (
    <div className="visualizer-container">
      <div className="dag-header">
        <div>
          <h2>Distributed Query Execution DAG</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Plan Hash: <code>{plan.queryHash ? plan.queryHash.slice(0, 12) : 'a4f91e...'}</code> &bull; Total Steps: {plan.totalSteps} &bull; Subgraphs: {plan.subgraphsInvolved ? plan.subgraphsInvolved.join(', ') : 'orders, users, products'}
          </p>
        </div>
        <button className="btn-execute" onClick={onExecuteSample}>
          Inspect Sample Query
        </button>
      </div>

      <div className="dag-tree">
        {plan.steps && plan.steps.map((step, idx) => (
          <div key={step.id || idx} className={`dag-step ${step.dependencies && step.dependencies.length > 0 ? 'dependent' : ''}`}>
            <span className="step-badge">{step.id}</span>
            <div className="step-details">
              <div className="step-subgraph">
                {step.subgraph.toUpperCase()} SUBGRAPH &bull; <span style={{ color: 'var(--accent-purple)' }}>{step.type}</span>
              </div>
              <div className="step-fields">
                {step.rootField ? `Root: ${step.rootField}` : `Target: ${step.targetField} (via key ${step.entityKey})`}
                {step.dependencies && step.dependencies.length > 0 && ` | Depends on: [${step.dependencies.join(', ')}]`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.QueryPlannerVisualizer = QueryPlannerVisualizer;
