const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    console.log('MONGO_URI:', process.env.MONGO_URI); // Log the MONGO_URI for debugging
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;