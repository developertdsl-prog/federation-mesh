const request = require('supertest');
const { app } = require('../server');

describe('Gateway HTTP Endpoints', () => {
  test('GET /api/health should return HEALTHY status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('HEALTHY');
  });

  test('POST /graphql should execute simple query', async () => {
    const res = await request(app)
      .post('/graphql')
      .send({ query: 'query { users { id name } }' });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.users).toBeInstanceOf(Array);
  });

  test('POST /api/gateway/plan should return visualizer DAG plan', async () => {
    const res = await request(app)
      .post('/api/gateway/plan')
      .send({ query: 'query { orders { id totalAmount customer { name } } }' });

    expect(res.status).toBe(200);
    expect(res.body.totalSteps).toBeGreaterThanOrEqual(2);
    expect(res.body.dag).toBeDefined();
  });

  test('GET /api/subgraphs should list registered subgraphs', async () => {
    const res = await request(app).get('/api/subgraphs');
    expect(res.status).toBe(200);
    expect(res.body.subgraphs.length).toBe(5);
  });
});
