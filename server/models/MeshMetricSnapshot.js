const mongoose = require('mongoose');

const MeshMetricSnapshotSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  totalQueriesExecuted: {
    type: Number,
    default: 0,
  },
  averageLatencyMs: {
    type: Number,
    default: 0,
  },
  p95LatencyMs: {
    type: Number,
    default: 0,
  },
  p99LatencyMs: {
    type: Number,
    default: 0,
  },
  activeSubgraphsCount: {
    type: Number,
    default: 5,
  },
  dataLoaderBatchSavingsPct: {
    type: Number,
    default: 0,
  },
  cacheHitRatio: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.models.MeshMetricSnapshot || mongoose.model('MeshMetricSnapshot', MeshMetricSnapshotSchema);
