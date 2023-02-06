const { mockProducts } = require('../utils/seedSubgraphs');

const typeDefs = `
  type Product {
    id: ID!
    name: String!
    sku: String!
    price: Float!
    category: String!
  }

  type Query {
    products: [Product!]!
    product(id: ID!): Product
  }
`;

const resolvers = {
  Query: {
    products: () => mockProducts,
    product: (parent, { id }) => mockProducts.find(p => p.id === id) || null,
  },
  Product: {
    __resolveReference: (reference) => {
      return mockProducts.find(p => p.id === reference.id) || null;
    },
  },
};

async function execute({ query, variables = {} }) {
  if (query.includes('_entities')) {
    const reps = variables.representations || [];
    const results = reps.map(rep => {
      const found = mockProducts.find(p => p.id === rep.id);
      return found ? { __typename: 'Product', ...found } : null;
    });
    return { data: { _entities: results } };
  }

  if (query.includes('products')) {
    return { data: { products: mockProducts } };
  }

  if (query.includes('product')) {
    const id = variables.id || (query.match(/id:\s*"([^"]+)"/) || [])[1];
    return { data: { product: mockProducts.find(p => p.id === id) || null } };
  }

  return { data: { products: mockProducts } };
}

module.exports = {
  name: 'products',
  port: 4002,
  typeDefs,
  resolvers,
  execute,
  entities: ['Product'],
};
