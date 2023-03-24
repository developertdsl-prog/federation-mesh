function GraphQLExplorerRunner() {
  const defaultQuery = `query EnterpriseSupergraphQuery {
  orders {
    id
    totalAmount
    customer {
      name
      email
    }
    products {
      name
      price
      inventory {
        quantity
        inStock
      }
      reviews {
        rating
        comment
      }
    }
  }
}`;

  const [query, setQuery] = React.useState(defaultQuery);
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      const data = await window.apiService.executeGraphQL(query);
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="explorer-grid">
      <div className="editor-box">
        <h3>GraphQL Query Editor</h3>
        <textarea
          className="query-textarea"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn-execute" onClick={handleRun} disabled={loading}>
          {loading ? 'Executing...' : '▶ Execute Supergraph Query'}
        </button>
      </div>

      <div className="result-box">
        <h3>Federated JSON Response</h3>
        <div className="json-output">
          {result || '// Click Execute to run federated query across 5 subgraphs'}
        </div>
      </div>
    </div>
  );
}

window.GraphQLExplorerRunner = GraphQLExplorerRunner;
