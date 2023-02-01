const { parse } = require('graphql');
const { DEFAULT_MAX_QUERY_DEPTH, DEFAULT_MAX_QUERY_COMPLEXITY, COMPLEXITY_COSTS } = require('../config/federationConstants');
const logger = require('../utils/logger');

/**
 * Calculates depth and algorithmic complexity of a GraphQL query AST
 */
function analyzeAstComplexity(node, currentDepth = 1) {
  let maxDepth = currentDepth;
  let totalCost = 0;

  if (!node || !node.selectionSet) {
    return { depth: maxDepth, complexity: COMPLEXITY_COSTS.FIELD_SCALAR };
  }

  for (const selection of node.selectionSet.selections) {
    if (selection.kind === 'Field') {
      if (selection.selectionSet) {
        // Nested Object or List
        totalCost += COMPLEXITY_COSTS.FIELD_OBJECT;
        const childResult = analyzeAstComplexity(selection, currentDepth + 1);
        maxDepth = Math.max(maxDepth, childResult.depth);
        totalCost += childResult.complexity;
      } else {
        // Scalar field
        totalCost += COMPLEXITY_COSTS.FIELD_SCALAR;
      }
    }
  }

  return { depth: maxDepth, complexity: totalCost };
}

/**
 * Express middleware inspecting GraphQL query payload before execution
 */
function queryComplexityGuard(req, res, next) {
  const query = req.body && req.body.query;

  if (!query || typeof query !== 'string') {
    return next();
  }

  // Allow Introspection queries bypass
  if (query.includes('__schema') || query.includes('__typename')) {
    return next();
  }

  try {
    const documentAst = parse(query);
    const maxAllowedDepth = parseInt(process.env.MAX_QUERY_DEPTH, 10) || DEFAULT_MAX_QUERY_DEPTH;
    const maxAllowedComplexity = parseInt(process.env.MAX_QUERY_COMPLEXITY, 10) || DEFAULT_MAX_QUERY_COMPLEXITY;

    let overallDepth = 0;
    let overallComplexity = 0;

    for (const definition of documentAst.definitions) {
      if (definition.kind === 'OperationDefinition') {
        const result = analyzeAstComplexity(definition, 1);
        overallDepth = Math.max(overallDepth, result.depth);
        overallComplexity += result.complexity;
      }
    }

    req.queryMetrics = { depth: overallDepth, complexity: overallComplexity };

    if (overallDepth > maxAllowedDepth) {
      logger.warn(`Query rejected: depth ${overallDepth} exceeds max ${maxAllowedDepth}`);
      return res.status(400).json({
        errors: [{
          message: `Query depth limit exceeded: depth is ${overallDepth}, maximum allowed is ${maxAllowedDepth}.`,
          extensions: { code: 'DEPTH_LIMIT_EXCEEDED', depth: overallDepth, maxAllowedDepth },
        }],
      });
    }

    if (overallComplexity > maxAllowedComplexity) {
      logger.warn(`Query rejected: complexity ${overallComplexity} exceeds max ${maxAllowedComplexity}`);
      return res.status(400).json({
        errors: [{
          message: `Query complexity limit exceeded: score is ${overallComplexity}, maximum allowed is ${maxAllowedComplexity}.`,
          extensions: { code: 'COMPLEXITY_LIMIT_EXCEEDED', complexity: overallComplexity, maxAllowedComplexity },
        }],
      });
    }

    next();
  } catch (err) {
    // Malformed GraphQL will be caught by parser in gateway
    next();
  }
}

module.exports = queryComplexityGuard;
