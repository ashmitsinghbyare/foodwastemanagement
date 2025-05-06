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

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Track connection status
let isConnected = false;

const connectDB = async () => {
  // If already connected, return the existing connection
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return mongoose;
  }

  try {
    // Always require MONGODB_URI in production
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required in production mode');
    }
    
    // Default to a local connection string if MONGODB_URI is not set (development only)
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodwaste';
    
    console.log('Attempting to connect to MongoDB...');
    
    // Connection options
    const options = {
      serverSelectionTimeoutMS: 60000, // 60 seconds timeout for initial connection
      socketTimeoutMS: 45000, // Increased socket timeout
      connectTimeoutMS: 60000, // 60 seconds timeout for connection
      heartbeatFrequencyMS: 10000, // Check server health more frequently
      retryWrites: true,
      w: 'majority', // Write to primary and wait for acknowledgment from a majority
      // Ensure we're using the new URL parser and unified topology
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
    
    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, options);
    
    // Mark as connected
    isConnected = true;
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Add error handlers to maintain connection
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
      isConnected = false;
      setTimeout(connectDB, 5000); // Try to reconnect after 5 seconds
    });
    
    // Log when successfully reconnected
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully!');
      isConnected = true;
    });
    
    return conn;
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    console.error('Please make sure your MongoDB connection string is correct and the database is accessible');
    console.error('Check that your MongoDB Atlas IP whitelist includes your server\'s IP address');
    
    if (process.env.NODE_ENV === 'production') {
      console.error('Retrying connection in 5 seconds...');
      // In production, retry the connection instead of exiting
      setTimeout(connectDB, 5000);
    } else {
      // In development, it's helpful to exit so the developer notices the problem
      process.exit(1);
    }
  }
};

// Export the connection function
module.exports = {
  connectDB,
  getConnection: () => mongoose
};

