/**
 * Static mock data store used by federated subgraphs in Federation-Mesh
 */

const mockUsers = [
  { id: 'usr_1', name: 'Alice Walker', email: 'alice@antigravity.io', role: 'ENGINEERING_LEAD', tier: 'ENTERPRISE' },
  { id: 'usr_2', name: 'Bob Roberts', email: 'bob@cloudops.net', role: 'SECURITY_ARCHITECT', tier: 'PROFESSIONAL' },
  { id: 'usr_3', name: 'Charlie Dave', email: 'charlie@datastream.org', role: 'DATA_SCIENTIST', tier: 'STARTER' },
  { id: 'usr_4', name: 'Dana Scully', email: 'dana@fbi.gov', role: 'FORENSIC_ANALYST', tier: 'ENTERPRISE' },
];

const mockProducts = [
  { id: 'prod_101', name: 'UltraMesh Router Pro', sku: 'UM-RTR-PRO', price: 899.99, category: 'NETWORKING' },
  { id: 'prod_102', name: 'Quantum Cryptographic Key', sku: 'QCK-256-AES', price: 1450.00, category: 'SECURITY' },
  { id: 'prod_103', name: 'PulseStream Edge Sensor', sku: 'PS-EDGE-01', price: 299.50, category: 'IOT_SENSORS' },
  { id: 'prod_104', name: 'High-Density SSD Array', sku: 'SSD-NVME-8TB', price: 1199.00, category: 'STORAGE' },
];

const mockOrders = [
  { id: 'ord_501', userId: 'usr_1', productIds: ['prod_101', 'prod_102'], totalAmount: 2349.99, status: 'DELIVERED', createdAt: '2023-02-15T10:30:00Z' },
  { id: 'ord_502', userId: 'usr_2', productIds: ['prod_102', 'prod_104'], totalAmount: 2649.00, status: 'SHIPPED', createdAt: '2023-03-22T14:15:00Z' },
  { id: 'ord_503', userId: 'usr_1', productIds: ['prod_103'], totalAmount: 299.50, status: 'PROCESSING', createdAt: '2023-04-10T09:00:00Z' },
  { id: 'ord_504', userId: 'usr_3', productIds: ['prod_101', 'prod_103', 'prod_104'], totalAmount: 2398.49, status: 'PENDING', createdAt: '2023-05-02T16:45:00Z' },
];

const mockInventory = [
  { productId: 'prod_101', quantity: 42, warehouseLocation: 'US-EAST-DC1', inStock: true, restockDate: '2023-07-01' },
  { productId: 'prod_102', quantity: 15, warehouseLocation: 'EU-WEST-AMS', inStock: true, restockDate: '2023-06-30' },
  { productId: 'prod_103', quantity: 0, warehouseLocation: 'AP-SOUTH-MUM', inStock: false, restockDate: '2023-08-15' },
  { productId: 'prod_104', quantity: 88, warehouseLocation: 'US-WEST-OR1', inStock: true, restockDate: '2023-09-01' },
];

const mockReviews = [
  { id: 'rev_901', productId: 'prod_101', authorId: 'usr_2', rating: 5, comment: 'Phenomenal throughput and zero packet loss under peak load!' },
  { id: 'rev_902', productId: 'prod_102', authorId: 'usr_1', rating: 5, comment: 'Flawless envelope crypto and hardware tamper protection.' },
  { id: 'rev_903', productId: 'prod_103', authorId: 'usr_4', rating: 4, comment: 'Accurate sliding window telemetry with minimal CPU overhead.' },
  { id: 'rev_904', productId: 'prod_101', authorId: 'usr_3', rating: 4, comment: 'Seamless setup with Apollo Federation routers.' },
];

module.exports = {
  mockUsers,
  mockProducts,
  mockOrders,
  mockInventory,
  mockReviews,
};
