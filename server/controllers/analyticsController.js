const metricsCollector = require('../services/metricsCollector');
const subgraphHealthMonitor = require('../services/subgraphHealthMonitor');

/**
 * Returns real-time metrics, throughput, latency percentiles and recent query logs
 */
function getAnalyticsOverview(req, res) {
  const metrics = metricsCollector.getMetrics();
  const health = subgraphHealthMonitor.getHealthSummary();

  res.json({
    overview: metrics,
    health,
  });
}

module.exports = {
  getAnalyticsOverview,
};
