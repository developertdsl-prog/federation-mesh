const queryExecutor = require('../services/queryExecutor');
const queryPlanner = require('../services/queryPlanner');
const schemaComposer = require('../services/schemaComposer');
const metricsCollector = require('../services/metricsCollector');
const logger = require('../utils/logger');

/**
 * Handles `/graphql` incoming client POST operations and query planning
 */
async function handleGraphQL(req, res, next) {
  const { query, variables, operationName } = req.body || {};

  if (!query) {
    return res.status(400).json({
      errors: [{ message: 'GraphQL query string must be provided in request body.' }],
    });
  }

  // Handle introspection queries
  if (query.includes('__schema') || query.includes('__typename')) {
    const supergraph = schemaComposer.composeSupergraph();
    return res.json({
      data: {
        __schema: {
          types: supergraph.entities.map(e => ({ name: e, kind: 'OBJECT' })),
        },
      },
    });
  }

  try {
    const result = await queryExecutor.execute(query, variables, { user: req.user });

    // Record metrics
    metricsCollector.recordQuery({
      queryHash: result.extensions.federation.queryHash,
      executionTimeMs: result.extensions.federation.executionTimeMs,
      subgraphsInvolved: result.extensions.federation.subgraphsInvolved,
      planDepth: req.queryMetrics ? req.queryMetrics.depth : 2,
      fromCache: false,
    });

    res.json(result);
  } catch (err) {
    logger.error('GraphQL Execution Error:', err.message);
    res.status(500).json({
      errors: [{
        message: err.message,
        extensions: { code: 'EXECUTION_FAILED' },
      }],
    });
  }
}

/**
 * Returns the query plan DAG without executing the subgraphs
 */
function handlePlanVisualizer(req, res) {
  const { query, operationName } = req.body || {};
  if (!query) {
    return res.status(400).json({ error: 'Query string is required' });
  }

  try {
    const plan = queryPlanner.plan(query, operationName);
    res.json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * Returns the compiled Supergraph Schema SDL
 */
function handleGetSupergraphSchema(req, res) {
  const supergraph = schemaComposer.composeSupergraph();
  res.json({
    sdl: supergraph.sdl,
    subgraphsCount: supergraph.subgraphsCount,
    entities: supergraph.entities,
  });
}

module.exports = {
  handleGraphQL,
  handlePlanVisualizer,
  handleGetSupergraphSchema,
};
