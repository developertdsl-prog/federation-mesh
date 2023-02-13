const schemaComposer = require('../services/schemaComposer');

describe('SchemaComposer Service', () => {
  test('should have all 5 default federated subgraphs registered', () => {
    const subgraphs = schemaComposer.getAllSubgraphs();
    expect(subgraphs.length).toBe(5);
    const names = subgraphs.map(s => s.name);
    expect(names).toContain('users');
    expect(names).toContain('products');
    expect(names).toContain('orders');
    expect(names).toContain('inventory');
    expect(names).toContain('reviews');
  });

  test('should compose a valid supergraph SDL schema', () => {
    const composition = schemaComposer.composeSupergraph();
    expect(composition).toBeDefined();
    expect(composition.sdl).toContain('scalar _Any');
    expect(composition.sdl).toContain('union _Entity');
    expect(composition.entities).toEqual(
      expect.arrayContaining(['User', 'Product', 'Order', 'Inventory', 'Review'])
    );
  });

  test('should throw error when registering an invalid subgraph without a name', () => {
    expect(() => {
      schemaComposer.registerSubgraph({});
    }).toThrow('Invalid subgraph configuration: missing name');
  });
});
