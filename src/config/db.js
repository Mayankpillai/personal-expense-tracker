const mongoose = require('mongoose');

// Connect to MongoDB using URI from environment variables
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense_tracker');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Don't exit process in tests or when mocking, but log clearly
    if (process.env.NODE_ENV !== 'test') {
      console.log('Running without active MongoDB connection or waiting for reconnect...');
    }
  }
};

module.exports = connectDB;
