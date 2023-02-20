const queryPlanner = require('./queryPlanner');
const schemaComposer = require('./schemaComposer');
const dataLoaderManager = require('./dataLoaderManager');
const logger = require('../utils/logger');

/**
 * Supergraph Query Executor
 * Executes DAG query plan nodes, merges partial JSON payloads, resolves federated entity linkages
 */
class QueryExecutor {
  async execute(queryStr, variables = {}, context = {}) {
    const startTime = Date.now();
    const plan = queryPlanner.plan(queryStr);
    const dataLoader = dataLoaderManager.createContextLoader();
    const finalData = {};
    const stepLatencies = {};

    // 1. Execute root (independent) steps concurrently
    const rootPromises = plan.dag.root.map(async (step) => {
      const stepStart = Date.now();
      const subgraph = schemaComposer.getSubgraph(step.subgraph);
      if (!subgraph) {
        throw new Error(`Subgraph '${step.subgraph}' is unavailable in Federation Mesh`);
      }

      const res = await subgraph.execute({ query: queryStr, variables });
      stepLatencies[step.subgraph] = Date.now() - stepStart;

      if (res && res.data) {
        Object.assign(finalData, res.data);
      }
      return step;
    });

    await Promise.all(rootPromises);

    // 2. Execute dependent entity steps
    for (const depStep of plan.dag.dependent) {
      const depStart = Date.now();
      const parentData = finalData[depStep.targetField] || finalData;

      if (depStep.subgraph === 'users' && depStep.targetField === 'customer') {
        // Resolve customer on order(s)
        if (Array.isArray(finalData.orders)) {
          await Promise.all(finalData.orders.map(async (order) => {
            if (order.userId) {
              order.customer = await dataLoader.userLoader.load(order.userId);
            }
          }));
        } else if (finalData.order && finalData.order.userId) {
          finalData.order.customer = await dataLoader.userLoader.load(finalData.order.userId);
        }
      } else if (depStep.subgraph === 'products' && depStep.targetField === 'products') {
        // Resolve products on order(s)
        if (Array.isArray(finalData.orders)) {
          await Promise.all(finalData.orders.map(async (order) => {
            if (Array.isArray(order.productIds)) {
              order.products = await Promise.all(
                order.productIds.map(pId => dataLoader.productLoader.load(pId))
              );
            }
          }));
        } else if (finalData.order && Array.isArray(finalData.order.productIds)) {
          finalData.order.products = await Promise.all(
            finalData.order.productIds.map(pId => dataLoader.productLoader.load(pId))
          );
        }
      } else if (depStep.subgraph === 'inventory' && depStep.targetField === 'inventory') {
        // Resolve inventory on product(s)
        if (Array.isArray(finalData.products)) {
          await Promise.all(finalData.products.map(async (prod) => {
            if (prod && prod.id) {
              prod.inventory = await dataLoader.inventoryLoader.load(prod.id);
            }
          }));
        } else if (finalData.product && finalData.product.id) {
          finalData.product.inventory = await dataLoader.inventoryLoader.load(finalData.product.id);
        }
      } else if (depStep.subgraph === 'reviews' && depStep.targetField === 'reviews') {
        // Resolve reviews on product(s)
        if (Array.isArray(finalData.products)) {
          await Promise.all(finalData.products.map(async (prod) => {
            if (prod && prod.id) {
              prod.reviews = await dataLoader.reviewLoader.load(prod.id);
            }
          }));
        } else if (finalData.product && finalData.product.id) {
          finalData.product.reviews = await dataLoader.reviewLoader.load(finalData.product.id);
        }
      }

      stepLatencies[depStep.subgraph] = Date.now() - depStart;
    }

    const totalDurationMs = Date.now() - startTime;

    return {
      data: finalData,
      extensions: {
        federation: {
          queryHash: plan.queryHash,
          subgraphsInvolved: plan.subgraphsInvolved,
          totalSteps: plan.totalSteps,
          stepLatencies,
          executionTimeMs: totalDurationMs,
          dataLoaderBatchSavings: dataLoader.getSavings(),
        },
      },
    };
  }
}

module.exports = new QueryExecutor();
