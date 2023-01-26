/**
 * API Key authentication middleware for Supergraph access
 */

function authApiKey(req, res, next) {
  // Allow health check and introspection without authorization in development
  if (req.path === '/api/health' || req.method === 'GET' && req.path === '/') {
    return next();
  }

  const apiKeyHeader = req.headers['x-api-key'] || req.headers['authorization'];
  const expectedKey = process.env.API_KEY || 'mesh-supergraph-secret-key-2023';

  if (!apiKeyHeader) {
    // Permissive in dev mode for UI demo purposes, but attaches unauthenticated context
    req.user = { role: 'ANONYMOUS', client: 'WebDashboard' };
    return next();
  }

  const cleanKey = apiKeyHeader.replace('Bearer ', '');
  if (cleanKey !== expectedKey) {
    return res.status(401).json({
      errors: [{ message: 'Unauthorized: Invalid Federation Gateway API key' }],
    });
  }

  req.user = { role: 'ADMIN', client: 'AuthorizedClient' };
  next();
}

module.exports = authApiKey;
