const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // console.log('MONGODB_URI:', process.env.MONGODB_URI ? '****' : 'undefined');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;