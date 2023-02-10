const userSub = require('../subgraphs/userSubgraph');
const productSub = require('../subgraphs/productSubgraph');
const orderSub = require('../subgraphs/orderSubgraph');
const inventorySub = require('../subgraphs/inventorySubgraph');
const reviewSub = require('../subgraphs/reviewSubgraph');
const logger = require('../utils/logger');

/**
 * Supergraph Schema Composition Engine
 * Validates, merges, and composes subgraph schemas into a single federated graph
 */
class SchemaComposer {
  constructor() {
    this.subgraphs = new Map();
    this.registerDefaultSubgraphs();
  }

  registerDefaultSubgraphs() {
    this.registerSubgraph(userSub);
    this.registerSubgraph(productSub);
    this.registerSubgraph(orderSub);
    this.registerSubgraph(inventorySub);
    this.registerSubgraph(reviewSub);
  }

  registerSubgraph(subgraph) {
    if (!subgraph || !subgraph.name) {
      throw new Error('Invalid subgraph configuration: missing name');
    }
    this.subgraphs.set(subgraph.name, subgraph);
    logger.info(`Registered federated subgraph: [${subgraph.name}]`);
  }

  getSubgraph(name) {
    return this.subgraphs.get(name);
  }

  getAllSubgraphs() {
    return Array.from(this.subgraphs.values());
  }

  composeSupergraph() {
    const mergedEntities = new Set();
    const queryFields = {};
    const typeDefinitions = {};

    for (const [name, sub] of this.subgraphs.entries()) {
      if (sub.entities) {
        sub.entities.forEach(e => mergedEntities.add(e));
      }

      // Map root query operations
      if (name === 'users') {
        queryFields.users = { type: '[User!]!', subgraph: 'users' };
        queryFields.user = { type: 'User', subgraph: 'users', args: 'id: ID!' };
      } else if (name === 'products') {
        queryFields.products = { type: '[Product!]!', subgraph: 'products' };
        queryFields.product = { type: 'Product', subgraph: 'products', args: 'id: ID!' };
      } else if (name === 'orders') {
        queryFields.orders = { type: '[Order!]!', subgraph: 'orders' };
        queryFields.order = { type: 'Order', subgraph: 'orders', args: 'id: ID!' };
        queryFields.ordersByUser = { type: '[Order!]!', subgraph: 'orders', args: 'userId: ID!' };
      } else if (name === 'inventory') {
        queryFields.inventory = { type: 'Inventory', subgraph: 'inventory', args: 'productId: ID!' };
      } else if (name === 'reviews') {
        queryFields.reviews = { type: '[Review!]!', subgraph: 'reviews', args: 'productId: ID!' };
      }
    }

    const supergraphSdl = `
      # Composed Federation-Mesh Supergraph Schema v2.0
      scalar _Any
      union _Entity = User | Product | Order | Inventory | Review

      type User {
        id: ID!
        name: String!
        email: String!
        role: String!
        tier: String!
        orders: [Order!]!
      }

      type Product {
        id: ID!
        name: String!
        sku: String!
        price: Float!
        category: String!
        inventory: Inventory
        reviews: [Review!]!
      }

      type Order {
        id: ID!
        userId: ID!
        customer: User
        productIds: [ID!]!
        products: [Product!]!
        totalAmount: Float!
        status: String!
        createdAt: String!
      }

      type Inventory {
        productId: ID!
        quantity: Int!
        warehouseLocation: String!
        inStock: Boolean!
        restockDate: String
      }

      type Review {
        id: ID!
        productId: ID!
        authorId: ID!
        author: User
        rating: Int!
        comment: String!
      }

      type Query {
        users: [User!]!
        user(id: ID!): User
        products: [Product!]!
        product(id: ID!): Product
        orders: [Order!]!
        order(id: ID!): Order
        ordersByUser(userId: ID!): [Order!]!
        inventory(productId: ID!): Inventory
        reviews(productId: ID!): [Review!]!
        _entities(representations: [_Any!]!): [_Entity]!
      }
    `;

    return {
      sdl: supergraphSdl.trim(),
      subgraphsCount: this.subgraphs.size,
      entities: Array.from(mergedEntities),
      queryFields,
    };
  }
}

module.exports = new SchemaComposer();
