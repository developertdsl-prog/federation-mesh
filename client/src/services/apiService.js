/**
 * REST & GraphQL Client Service for Federation-Mesh
 */
const apiService = {
  async executeGraphQL(query, variables = {}) {
    const res = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });
    return res.json();
  },

  async getQueryPlan(query) {
    const res = await fetch('/api/gateway/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    return res.json();
  },

  async getSubgraphs() {
    const res = await fetch('/api/subgraphs');
    return res.json();
  },

  async getMetrics() {
    const res = await fetch('/api/analytics/metrics');
    return res.json();
  },

  async getSupergraphSchema() {
    const res = await fetch('/api/gateway/schema');
    return res.json();
  },
};

window.apiService = apiService;
