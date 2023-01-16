const mongoose = require('mongoose');
const logger = require('../utils/logger');

let isConnected = false;

/**
 * Connect to MongoDB with retry logic and graceful fallback
 */
async function connectDB() {
  if (isConnected) return;

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/federation_mesh';

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    logger.info(`MongoDB connected successfully to ${mongoUri}`);
  } catch (err) {
    logger.warn(`MongoDB connection failed (${err.message}). Falling back to in-memory state for gateway metadata.`);
  }
}

/**
 * Disconnect MongoDB
 */
async function disconnectDB() {
  if (!isConnected) return;
  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected.');
  } catch (err) {
    logger.error('Error disconnecting MongoDB:', err);
  }
}

module.exports = { connectDB, disconnectDB };
