const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lms_db';

  try {
    // Attempt connecting to the configured URI with a 2-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`[Database] Successfully connected to MongoDB at: ${uri}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.log(
      `[Database] Note: Could not connect to MongoDB at ${uri} (${error.message}).`
    );
    console.log(
      `[Database] Automatically running with persistent local JSON database (server/data/db.json) for instant zero-config evaluation.`
    );
    return false;
  }
};

const getDBStatus = () => ({
  isMongo: isConnected,
  type: isConnected ? 'MongoDB (Mongoose)' : 'Local JSON Database (Persistent)',
});

const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
};

module.exports = { connectDB, disconnectDB, getDBStatus };
