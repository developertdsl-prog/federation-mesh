const mongoose = require('mongoose');

const QueryPlanCacheSchema = new mongoose.Schema({
  queryHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  operationType: {
    type: String,
    enum: ['query', 'mutation', 'subscription'],
    default: 'query',
  },
  planDag: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  estimatedCost: {
    type: Number,
    required: true,
  },
  hitCount: {
    type: Number,
    default: 1,
  },
  lastExecuted: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.models.QueryPlanCache || mongoose.model('QueryPlanCache', QueryPlanCacheSchema);
