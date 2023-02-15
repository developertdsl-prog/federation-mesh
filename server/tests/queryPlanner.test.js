const queryPlanner = require('../services/queryPlanner');

describe('QueryPlanner Service', () => {
  beforeEach(() => {
    queryPlanner.clearCache();
  });

  test('should generate a simple single-step plan for unnested queries', () => {
    const query = 'query { users { id name email } }';
    const plan = queryPlanner.plan(query);

    expect(plan).toBeDefined();
    expect(plan.subgraphsInvolved).toEqual(['users']);
    expect(plan.totalSteps).toBe(1);
    expect(plan.steps[0].subgraph).toBe('users');
    expect(plan.dag.root.length).toBe(1);
    expect(plan.dag.dependent.length).toBe(0);
  });

  test('should generate a multi-step DAG plan for cross-subgraph federated queries', () => {
    const federatedQuery = `
      query GetOrderDetails {
        orders {
          id
          totalAmount
          customer {
            name
            email
          }
          products {
            name
            price
            inventory {
              quantity
            }
          }
        }
      }
    `;

    const plan = queryPlanner.plan(federatedQuery);
    expect(plan.subgraphsInvolved).toContain('orders');
    expect(plan.subgraphsInvolved).toContain('users');
    expect(plan.subgraphsInvolved).toContain('products');
    expect(plan.subgraphsInvolved).toContain('inventory');
    expect(plan.totalSteps).toBeGreaterThanOrEqual(3);
    expect(plan.dag.root.length).toBe(1);
    expect(plan.dag.dependent.length).toBeGreaterThanOrEqual(2);
  });

  test('should serve subsequent identical queries from the plan cache', () => {
    const query = 'query { products { id name price } }';
    const firstPlan = queryPlanner.plan(query);
    const cachedPlan = queryPlanner.plan(query);

    expect(cachedPlan.queryHash).toBe(firstPlan.queryHash);
    expect(cachedPlan.fromCache).toBe(true);
  });
});
