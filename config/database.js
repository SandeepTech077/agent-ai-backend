// db.js
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI; // your .env: MONGODB_URI=mongodb+srv://user:password@cluster0.aswop0t.mongodb.net/dbname?retryWrites=true&w=majority

const clientOptions = {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
};

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return; // avoid multiple connections

  try {
    await mongoose.connect(uri, clientOptions);

    // Ping to ensure connection is working
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log('✅ MongoDB connected & ping successful!');

    isConnected = true;

    // Event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
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
    process.exit(1);
  }
};

module.exports = { connectDB };
