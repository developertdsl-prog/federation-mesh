const dataLoaderManager = require('../services/dataLoaderManager');

describe('DataLoader Batching & Deduplication', () => {
  test('should batch multiple user lookups into a single dispatch', async () => {
    const loaderContext = dataLoaderManager.createContextLoader();

    const [u1, u2, u3] = await Promise.all([
      loaderContext.userLoader.load('usr_1'),
      loaderContext.userLoader.load('usr_2'),
      loaderContext.userLoader.load('usr_1'), // Duplicate ID should be deduplicated
    ]);

    expect(u1).toBeDefined();
    expect(u1.id).toBe('usr_1');
    expect(u2).toBeDefined();
    expect(u2.id).toBe('usr_2');
    expect(u3.id).toBe('usr_1');

    const savings = loaderContext.getSavings();
    expect(savings.batchDispatchesCount).toBe(1);
    expect(savings.savingsPct).toBeGreaterThan(0);
  });

  test('should batch inventory requests by product ID', async () => {
    const loaderContext = dataLoaderManager.createContextLoader();
    const [inv1, inv2] = await Promise.all([
      loaderContext.inventoryLoader.load('prod_101'),
      loaderContext.inventoryLoader.load('prod_102'),
    ]);

    expect(inv1).toBeDefined();
    expect(inv1.productId).toBe('prod_101');
    expect(inv2).toBeDefined();
    expect(inv2.productId).toBe('prod_102');
  });
});
