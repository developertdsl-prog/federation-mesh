/**
 * Global configuration constants for GraphQL Federation Mesh
 */

module.exports = {
  SUBGRAPHS: {
    USERS: 'users',
    PRODUCTS: 'products',
    ORDERS: 'orders',
    INVENTORY: 'inventory',
    REVIEWS: 'reviews',
  },
  DEFAULT_SUBGRAPH_PORTS: {
    users: 4001,
    products: 4002,
    orders: 4003,
    inventory: 4004,
    reviews: 4005,
  },
  DEFAULT_MAX_QUERY_DEPTH: 8,
  DEFAULT_MAX_QUERY_COMPLEXITY: 250,
  COMPLEXITY_COSTS: {
    FIELD_SCALAR: 1,
    FIELD_OBJECT: 2,
    FIELD_LIST: 5,
    DIRECTIVE_COST: 1,
  },
  DATALOADER_DEFAULTS: {
    MAX_BATCH_SIZE: 100,
    CACHE_ENABLED: true,
  },
  PLAN_NODE_TYPES: {
    PARALLEL: 'PARALLEL_EXECUTION',
    SEQUENCE: 'SEQUENTIAL_DEPENDENCY',
    FETCH: 'SUBGRAPH_FETCH',
    MERGE: 'PAYLOAD_MERGE',
  },
  HEALTH_STATUS: {
    UP: 'UP',
    DOWN: 'DOWN',
    DEGRADED: 'DEGRADED',
  },
};
