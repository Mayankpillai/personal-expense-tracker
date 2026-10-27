const mongoose = require('mongoose');

// Connect to MongoDB using URI from environment variables
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense_tracker', {
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of hanging 30s
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      console.log('Please ensure MongoDB is running or run with Docker Compose.');
    }
  }
};

module.exports = connectDB;
