const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = async () => {
  try {
    console.log('MONGO_URI:', process.env.MONGO_URI ? '****' : 'undefined');
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MONGO_URI connected');
  } catch (error) {
    console.error('MONGO_URI connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;