const schemaComposer = require('../services/schemaComposer');
const subgraphHealthMonitor = require('../services/subgraphHealthMonitor');

/**
 * Lists all registered subgraphs and their current health status
 */
function listSubgraphs(req, res) {
  const health = subgraphHealthMonitor.getHealthSummary();
  const subgraphs = schemaComposer.getAllSubgraphs().map(sub => {
    const h = health.subgraphs.find(s => s.name === sub.name) || {};
    return {
      name: sub.name,
      port: sub.port,
      entities: sub.entities || [],
      status: h.status || 'UP',
      lastHeartbeat: h.lastHeartbeat,
      typeDefs: sub.typeDefs.trim(),
    };
  });

  res.json({
    meshStatus: health.meshStatus,
    activeCount: health.activeSubgraphs,
    totalCount: health.totalSubgraphs,
    subgraphs,
  });
}

/**
 * Returns detail for a specific subgraph
 */
function getSubgraphDetail(req, res) {
  const { name } = req.params;
  const sub = schemaComposer.getSubgraph(name);
  if (!sub) {
    return res.status(404).json({ error: `Subgraph '${name}' not found` });
  }

  res.json({
    name: sub.name,
    port: sub.port,
    entities: sub.entities || [],
    typeDefs: sub.typeDefs.trim(),
  });
}

module.exports = {
  listSubgraphs,
  getSubgraphDetail,
};
