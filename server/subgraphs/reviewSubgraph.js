const { mockReviews } = require('../utils/seedSubgraphs');

const typeDefs = `
  type Review {
    id: ID!
    productId: ID!
    authorId: ID!
    rating: Int!
    comment: String!
  }

  type Query {
    reviews(productId: ID!): [Review!]!
  }
`;

async function execute({ query, variables = {} }) {
  if (query.includes('_entities')) {
    const reps = variables.representations || [];
    const results = reps.map(rep => {
      const pId = rep.productId || rep.id;
      const filtered = mockReviews.filter(r => r.productId === pId);
      return { __typename: 'ReviewList', reviews: filtered };
    });
    return { data: { _entities: results } };
  }

  if (query.includes('reviews')) {
    const productId = variables.productId || (query.match(/productId:\s*"([^"]+)"/) || [])[1];
    const filtered = productId ? mockReviews.filter(r => r.productId === productId) : mockReviews;
    return { data: { reviews: filtered } };
  }

  return { data: { reviews: mockReviews } };
}

module.exports = {
  name: 'reviews',
  port: 4005,
  typeDefs,
  execute,
  entities: ['Review'],
};
