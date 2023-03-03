const express = require('express');
const router = express.Router();
const subgraphController = require('../controllers/subgraphController');

router.get('/api/subgraphs', subgraphController.listSubgraphs);
router.get('/api/subgraphs/:name', subgraphController.getSubgraphDetail);

module.exports = router;
