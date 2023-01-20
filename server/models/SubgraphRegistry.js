const mongoose = require('mongoose');

const SubgraphRegistrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
  },
  schemaSdl: {
    type: String,
    required: true,
  },
  entities: [{
    type: String,
  }],
  healthStatus: {
    type: String,
    enum: ['UP', 'DOWN', 'DEGRADED'],
    default: 'UP',
  },
  lastHeartbeat: {
    type: Date,
    default: Date.now,
  },
  activeConnections: {
    type: Number,
    default: 0,
  },
  version: {
    type: String,
    default: '1.0.0',
  },
}, { timestamps: true });

module.exports = mongoose.models.SubgraphRegistry || mongoose.model('SubgraphRegistry', SubgraphRegistrySchema);
