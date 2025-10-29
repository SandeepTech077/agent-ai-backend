const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

const clientOptions = {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
};

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('✅ MongoDB already connected');
    return;
  }

  if (!uri) {
    console.warn('⚠️ MONGODB_URI not found in .env, using in-memory storage');
    return;
  }

  try {
    await mongoose.connect(uri, clientOptions);

    // Ping to ensure connection is working
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log('✅ MongoDB connected & ping successful!');

    isConnected = true;

    // Event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      isConnected = false;
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`🛑 ${signal} received: closing MongoDB connection...`);
      await mongoose.disconnect();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.warn('⚠️ Falling back to in-memory storage');
    isConnected = false;
    // Don't exit process, continue with in-memory storage
  }
};

// Check if MongoDB is connected
const isMongoConnected = () => isConnected;

module.exports = { connectDB, isMongoConnected };