const { mockOrders } = require('../utils/seedSubgraphs');

const typeDefs = `
  type Order {
    id: ID!
    userId: ID!
    productIds: [ID!]!
    totalAmount: Float!
    status: String!
    createdAt: String!
  }

  type Query {
    orders: [Order!]!
    order(id: ID!): Order
    ordersByUser(userId: ID!): [Order!]!
  }
`;

const resolvers = {
  Query: {
    orders: () => mockOrders,
    order: (parent, { id }) => mockOrders.find(o => o.id === id) || null,
    ordersByUser: (parent, { userId }) => mockOrders.filter(o => o.userId === userId),
  },
  Order: {
    __resolveReference: (reference) => {
      return mockOrders.find(o => o.id === reference.id) || null;
    },
  },
};

async function execute({ query, variables = {} }) {
  if (query.includes('_entities')) {
    const reps = variables.representations || [];
    const results = reps.map(rep => {
      const found = mockOrders.find(o => o.id === rep.id);
      return found ? { __typename: 'Order', ...found } : null;
    });
    return { data: { _entities: results } };
  }

  if (query.includes('ordersByUser')) {
    const userId = variables.userId || (query.match(/userId:\s*"([^"]+)"/) || [])[1];
    return { data: { ordersByUser: mockOrders.filter(o => o.userId === userId) } };
  }

  if (query.includes('orders')) {
    return { data: { orders: mockOrders } };
  }

  if (query.includes('order')) {
    const id = variables.id || (query.match(/id:\s*"([^"]+)"/) || [])[1];
    return { data: { order: mockOrders.find(o => o.id === id) || null } };
  }

  return { data: { orders: mockOrders } };
}

module.exports = {
  name: 'orders',
  port: 4003,
  typeDefs,
  resolvers,
  execute,
  entities: ['Order'],
};
