require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, disconnectDB } = require('./config/db');
const logger = require('./utils/logger');
const authApiKey = require('./middleware/authApiKey');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const gatewayRoutes = require('./routes/gatewayRoutes');
const subgraphRoutes = require('./routes/subgraphRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Security and utility middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(rateLimiter);
app.use(authApiKey);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Federation-Mesh Gateway',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Mount routes
app.use(gatewayRoutes);
app.use(subgraphRoutes);
app.use(analyticsRoutes);

// Static client UI serving
const clientBuildPath = path.join(__dirname, '../client/build');
app.use(express.static(clientBuildPath));
app.use(express.static(path.join(__dirname, '../client')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/graphql') {
    return next();
  }
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Centralized error handling
app.use(errorHandler);

let serverInstance = null;

async function startServer() {
  await connectDB();
  serverInstance = app.listen(PORT, () => {
    logger.info(`🌐 Federation-Mesh Supergraph Gateway listening on http://localhost:${PORT}`);
    logger.info(`🚀 GraphQL Endpoint: http://localhost:${PORT}/graphql`);
  });
  return serverInstance;
}

if (require.main === module) {
  startServer();
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down Federation-Mesh Gateway gracefully...');
  if (serverInstance) serverInstance.close();
  await disconnectDB();
  process.exit(0);
});

module.exports = { app, startServer };
