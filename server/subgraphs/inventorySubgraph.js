const { mockInventory } = require('../utils/seedSubgraphs');

const typeDefs = `
  type Inventory {
    productId: ID!
    quantity: Int!
    warehouseLocation: String!
    inStock: Boolean!
    restockDate: String
  }

  type Query {
    inventory(productId: ID!): Inventory
  }
`;

async function execute({ query, variables = {} }) {
  if (query.includes('_entities')) {
    const reps = variables.representations || [];
    const results = reps.map(rep => {
      const pId = rep.productId || rep.id;
      const found = mockInventory.find(i => i.productId === pId);
      return found ? { __typename: 'Inventory', ...found } : null;
    });
    return { data: { _entities: results } };
  }

  if (query.includes('inventory')) {
    const productId = variables.productId || (query.match(/productId:\s*"([^"]+)"/) || [])[1];
    return { data: { inventory: mockInventory.find(i => i.productId === productId) || null } };
  }

  return { data: { inventory: mockInventory[0] } };
}

module.exports = {
  name: 'inventory',
  port: 4004,
  typeDefs,
  execute,
  entities: ['Inventory'],
};
