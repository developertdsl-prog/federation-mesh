const queryExecutor = require('../services/queryExecutor');

describe('QueryExecutor Service', () => {
  test('should execute root query against single subgraph successfully', async () => {
    const query = 'query { users { id name email } }';
    const result = await queryExecutor.execute(query);

    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.data.users).toBeInstanceOf(Array);
    expect(result.data.users.length).toBeGreaterThan(0);
    expect(result.data.users[0]).toHaveProperty('name');
    expect(result.extensions.federation).toBeDefined();
    expect(result.extensions.federation.subgraphsInvolved).toContain('users');
  });

  test('should resolve federated linkages across orders, customer, and products', async () => {
    const federatedQuery = `
      query {
        orders {
          id
          totalAmount
          customer {
            name
          }
          products {
            name
            price
          }
        }
      }
    `;

    const result = await queryExecutor.execute(federatedQuery);
    expect(result.data.orders).toBeInstanceOf(Array);
    const firstOrder = result.data.orders[0];
    expect(firstOrder).toHaveProperty('customer');
    expect(firstOrder.customer).toHaveProperty('name');
    expect(firstOrder).toHaveProperty('products');
    expect(firstOrder.products[0]).toHaveProperty('name');
  });
});
