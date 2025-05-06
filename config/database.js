/*const mongoose = require('mongoose');
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

module.exports = mongoose;*/

// db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Track connection status
let isConnected = false;

// Connection function
const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return mongoose;
  }

  try {
    // Validate environment variables
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodwaste';

    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required in production mode');
    }

    console.log('Attempting to connect to MongoDB...');

    // Mongoose connection options
    const options = {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 60000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      w: 'majority',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, options);
    isConnected = true;

    console.log(MongoDB Connected: ${conn.connection.host});

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error(MongoDB connection error: ${err});
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
      isConnected = false;
      setTimeout(connectDB, 5000); // Retry after 5 seconds
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully!');
      isConnected = true;
    });

    return conn;
  } catch (err) {
    console.error(Error connecting to MongoDB: ${err.message});
    console.error('Ensure the URI is correct and accessible. If using Atlas, verify the IP whitelist.');

    if (process.env.NODE_ENV === 'production') {
      console.error('Retrying MongoDB connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
};

// Export connection helpers
module.exports = {
  connectDB,
  getConnection: () => mongoose,
};
