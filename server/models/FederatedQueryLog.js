const mongoose = require('mongoose');

const FederatedQueryLogSchema = new mongoose.Schema({
  queryHash: {
    type: String,
    required: true,
    index: true,
  },
  operationName: {
    type: String,
    default: 'AnonymousQuery',
  },
  subgraphsInvolved: [{
    type: String,
    required: true,
  }],
  planDepth: {
    type: Number,
    required: true,
  },
  calculatedComplexity: {
    type: Number,
    required: true,
  },
  executionTimeMs: {
    type: Number,
    required: true,
  },
  subgraphFetchLatencies: {
    type: Map,
    of: Number,
    default: {},
  },
  clientIp: {
    type: String,
    default: '127.0.0.1',
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'PARTIAL_ERROR', 'FAILED', 'REJECTED_COMPLEXITY'],
    default: 'SUCCESS',
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.models.FederatedQueryLog || mongoose.model('FederatedQueryLog', FederatedQueryLogSchema);
