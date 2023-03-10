const request = require('supertest');
const { app } = require('../server');

describe('End-to-End Supergraph Federation Workflow', () => {
  test('should execute full 5-subgraph query resolving cross-service dependencies in single round-trip', async () => {
    const supergraphQuery = `
      query EnterpriseOrderMeshQuery {
        orders {
          id
          totalAmount
          status
          customer {
            id
            name
            email
            role
          }
          products {
            id
            name
            price
            inventory {
              quantity
              inStock
              warehouseLocation
            }
            reviews {
              id
              rating
              comment
            }
          }
        }
      }
    `;

    const res = await request(app)
      .post('/graphql')
      .send({ query: supergraphQuery });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.orders).toBeInstanceOf(Array);

    const order = res.body.data.orders[0];
    expect(order.customer).toBeDefined();
    expect(order.customer.name).toBe('Alice Walker');

    expect(order.products).toBeInstanceOf(Array);
    const product = order.products[0];
    expect(product.inventory).toBeDefined();
    expect(product.inventory).toHaveProperty('inStock');
    expect(product.reviews).toBeInstanceOf(Array);

    // Verify federation telemetry extensions
    const fed = res.body.extensions.federation;
    expect(fed).toBeDefined();
    expect(fed.subgraphsInvolved.length).toBeGreaterThanOrEqual(4);
    expect(fed.executionTimeMs).toBeGreaterThan(0);
  });
});
