const { mockUsers } = require('../utils/seedSubgraphs');

const typeDefs = `
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    tier: String!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
  }
`;

const resolvers = {
  Query: {
    users: () => mockUsers,
    user: (parent, { id }) => mockUsers.find(u => u.id === id) || null,
  },
  User: {
    __resolveReference: (reference) => {
      return mockUsers.find(u => u.id === reference.id) || null;
    },
  },
};

/**
 * In-process mock subgraph executor
 */
async function execute({ query, variables = {} }) {
  if (query.includes('_entities')) {
    const reps = variables.representations || [];
    const results = reps.map(rep => {
      if (rep.__typename === 'User' || rep.id) {
        const found = mockUsers.find(u => u.id === rep.id);
        return found ? { __typename: 'User', ...found } : null;
      }
      return null;
    });
    return { data: { _entities: results } };
  }

  if (query.includes('users')) {
    return { data: { users: mockUsers } };
  }

  if (query.includes('user')) {
    const id = variables.id || (query.match(/id:\s*"([^"]+)"/) || [])[1];
    return { data: { user: mockUsers.find(u => u.id === id) || null } };
  }

  return { data: { users: mockUsers } };
}

module.exports = {
  name: 'users',
  port: 4001,
  typeDefs,
  resolvers,
  execute,
  entities: ['User'],
};
