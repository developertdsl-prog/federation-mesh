const crypto = require('crypto');
const { parse } = require('graphql');
const { PLAN_NODE_TYPES } = require('../config/federationConstants');
const schemaComposer = require('./schemaComposer');
const logger = require('../utils/logger');

/**
 * Intelligent GraphQL Query Planner
 * Decomposes incoming client AST into a DAG of subgraph fetch nodes
 */
class QueryPlanner {
  constructor() {
    this.planCache = new Map();
  }

  computeHash(queryStr) {
    return crypto.createHash('sha256').update(queryStr.trim()).digest('hex');
  }

  plan(queryStr, operationName = null) {
    const hash = this.computeHash(queryStr);
    if (this.planCache.has(hash)) {
      const cached = this.planCache.get(hash);
      return { ...cached, fromCache: true };
    }

    let documentAst;
    try {
      documentAst = parse(queryStr);
    } catch (err) {
      throw new Error(`GraphQL Syntax Error: ${err.message}`);
    }

    const steps = [];
    const subgraphsInvolved = new Set();

    // Analyze root selections
    for (const def of documentAst.definitions) {
      if (def.kind === 'OperationDefinition') {
        for (const sel of def.selectionSet.selections) {
          if (sel.kind === 'Field') {
            const fieldName = sel.name.value;
            const stepId = `step_${steps.length + 1}`;

            if (['users', 'user'].includes(fieldName)) {
              subgraphsInvolved.add('users');
              steps.push({
                id: stepId,
                type: PLAN_NODE_TYPES.FETCH,
                subgraph: 'users',
                rootField: fieldName,
                fields: this.extractFieldNames(sel),
                dependencies: [],
              });
            } else if (['products', 'product'].includes(fieldName)) {
              subgraphsInvolved.add('products');
              const step = {
                id: stepId,
                type: PLAN_NODE_TYPES.FETCH,
                subgraph: 'products',
                rootField: fieldName,
                fields: this.extractFieldNames(sel),
                dependencies: [],
              };
              steps.push(step);

              // Check for nested federated fields: inventory & reviews
              if (this.hasNestedField(sel, 'inventory')) {
                subgraphsInvolved.add('inventory');
                steps.push({
                  id: `step_${steps.length + 1}`,
                  type: PLAN_NODE_TYPES.FETCH,
                  subgraph: 'inventory',
                  targetField: 'inventory',
                  entityKey: 'id',
                  parentStepId: stepId,
                  dependencies: [stepId],
                });
              }

              if (this.hasNestedField(sel, 'reviews')) {
                subgraphsInvolved.add('reviews');
                steps.push({
                  id: `step_${steps.length + 1}`,
                  type: PLAN_NODE_TYPES.FETCH,
                  subgraph: 'reviews',
                  targetField: 'reviews',
                  entityKey: 'id',
                  parentStepId: stepId,
                  dependencies: [stepId],
                });
              }
            } else if (['orders', 'order', 'ordersByUser'].includes(fieldName)) {
              subgraphsInvolved.add('orders');
              const orderStep = {
                id: stepId,
                type: PLAN_NODE_TYPES.FETCH,
                subgraph: 'orders',
                rootField: fieldName,
                fields: this.extractFieldNames(sel),
                dependencies: [],
              };
              steps.push(orderStep);

              // Check customer (user subgraph) dependency
              if (this.hasNestedField(sel, 'customer')) {
                subgraphsInvolved.add('users');
                steps.push({
                  id: `step_${steps.length + 1}`,
                  type: PLAN_NODE_TYPES.FETCH,
                  subgraph: 'users',
                  targetField: 'customer',
                  entityKey: 'userId',
                  parentStepId: stepId,
                  dependencies: [stepId],
                });
              }

              // Check products (product subgraph) dependency
              if (this.hasNestedField(sel, 'products')) {
                subgraphsInvolved.add('products');
                const prodStepId = `step_${steps.length + 1}`;
                steps.push({
                  id: prodStepId,
                  type: PLAN_NODE_TYPES.FETCH,
                  subgraph: 'products',
                  targetField: 'products',
                  entityKey: 'productIds',
                  parentStepId: stepId,
                  dependencies: [stepId],
                });

                if (this.hasNestedField(sel, 'inventory')) {
                  subgraphsInvolved.add('inventory');
                  steps.push({
                    id: `step_${steps.length + 1}`,
                    type: PLAN_NODE_TYPES.FETCH,
                    subgraph: 'inventory',
                    targetField: 'inventory',
                    entityKey: 'id',
                    parentStepId: prodStepId,
                    dependencies: [prodStepId],
                  });
                }
              }
            } else if (fieldName === 'inventory') {
              subgraphsInvolved.add('inventory');
              steps.push({
                id: stepId,
                type: PLAN_NODE_TYPES.FETCH,
                subgraph: 'inventory',
                rootField: fieldName,
                fields: this.extractFieldNames(sel),
                dependencies: [],
              });
            } else if (fieldName === 'reviews') {
              subgraphsInvolved.add('reviews');
              steps.push({
                id: stepId,
                type: PLAN_NODE_TYPES.FETCH,
                subgraph: 'reviews',
                rootField: fieldName,
                fields: this.extractFieldNames(sel),
                dependencies: [],
              });
            }
          }
        }
      }
    }

    const queryPlan = {
      queryHash: hash,
      operationName: operationName || 'FederatedQuery',
      subgraphsInvolved: Array.from(subgraphsInvolved),
      totalSteps: steps.length,
      estimatedLatencyMs: Math.max(12, steps.length * 8),
      dag: {
        root: steps.filter(s => s.dependencies.length === 0),
        dependent: steps.filter(s => s.dependencies.length > 0),
      },
      steps,
      createdAt: new Date().toISOString(),
    };

    this.planCache.set(hash, queryPlan);
    logger.debug(`Generated Query Plan [${hash.slice(0, 8)}] with ${steps.length} steps`);
    return queryPlan;
  }

  extractFieldNames(selectionNode) {
    if (!selectionNode.selectionSet) return [];
    return selectionNode.selectionSet.selections
      .filter(s => s.kind === 'Field')
      .map(s => s.name.value);
  }

  hasNestedField(selectionNode, targetFieldName) {
    if (!selectionNode.selectionSet) return false;
    for (const sel of selectionNode.selectionSet.selections) {
      if (sel.kind === 'Field') {
        if (sel.name.value === targetFieldName) return true;
        if (sel.selectionSet && this.hasNestedField(sel, targetFieldName)) {
          return true;
        }
      }
    }
    return false;
  }

  clearCache() {
    this.planCache.clear();
  }
}

module.exports = new QueryPlanner();
