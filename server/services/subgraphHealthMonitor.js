const schemaComposer = require('./schemaComposer');
const { HEALTH_STATUS } = require('../config/federationConstants');
const logger = require('../utils/logger');

/**
 * Real-time health monitor and circuit breaker for registered subgraphs
 */
class SubgraphHealthMonitor {
  constructor() {
    this.statusMap = new Map();
    this.initDefaultStatuses();
  }

  initDefaultStatuses() {
    for (const sub of schemaComposer.getAllSubgraphs()) {
      this.statusMap.set(sub.name, {
        name: sub.name,
        status: HEALTH_STATUS.UP,
        port: sub.port || 4000,
        consecutiveFailures: 0,
        lastHeartbeat: new Date().toISOString(),
        circuitOpen: false,
      });
    }
  }

  getHealthSummary() {
    const list = Array.from(this.statusMap.values());
    const total = list.length;
    const upCount = list.filter(s => s.status === HEALTH_STATUS.UP).length;

    return {
      meshStatus: upCount === total ? 'HEALTHY' : upCount > 0 ? 'DEGRADED' : 'UNHEALTHY',
      totalSubgraphs: total,
      activeSubgraphs: upCount,
      subgraphs: list,
    };
  }

  recordSuccess(subgraphName) {
    const record = this.statusMap.get(subgraphName);
    if (record) {
      record.status = HEALTH_STATUS.UP;
      record.consecutiveFailures = 0;
      record.circuitOpen = false;
      record.lastHeartbeat = new Date().toISOString();
    }
  }

  recordFailure(subgraphName) {
    const record = this.statusMap.get(subgraphName);
    if (record) {
      record.consecutiveFailures++;
      record.lastHeartbeat = new Date().toISOString();
      if (record.consecutiveFailures >= 3) {
        record.status = HEALTH_STATUS.DOWN;
        record.circuitOpen = true;
        logger.warn(`Circuit breaker OPEN for subgraph [${subgraphName}] after 3 consecutive failures`);
      } else {
        record.status = HEALTH_STATUS.DEGRADED;
      }
    }
  }
}

module.exports = new SubgraphHealthMonitor();
