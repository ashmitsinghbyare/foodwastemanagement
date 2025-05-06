const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    // Default to a local connection string if MONGODB_URI is not set
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodwaste';
    
    // Connect to MongoDB without deprecated options
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    
    // Don't exit the process in production, retry connection instead
    if (process.env.NODE_ENV === 'production') {
      console.log('Attempting to use local MongoDB fallback...');
      try {
        const conn = await mongoose.connect('mongodb://localhost:27017/foodwaste');
        console.log(`MongoDB Connected (fallback): ${conn.connection.host}`);
        return conn;
      } catch (fallbackErr) {
        console.error(`Fallback connection failed: ${fallbackErr.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

connectDB();

module.exports = mongoose;
