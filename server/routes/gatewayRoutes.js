const express = require('express');
const router = express.Router();
const gatewayController = require('../controllers/gatewayController');
const queryComplexityGuard = require('../middleware/queryComplexityGuard');

// GraphQL execution endpoint
router.post('/graphql', queryComplexityGuard, gatewayController.handleGraphQL);
router.get('/graphql', gatewayController.handleGetSupergraphSchema);

// Query Plan introspection & visualizer
router.post('/api/gateway/plan', gatewayController.handlePlanVisualizer);
router.get('/api/gateway/schema', gatewayController.handleGetSupergraphSchema);

module.exports = router;
