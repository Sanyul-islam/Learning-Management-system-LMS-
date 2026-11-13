const path = require('path');
// Ensure environment variables are loaded regardless of process cwd
require('dotenv').config({ path: path.join(__dirname, '../../../server/.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config();

const mongoose = require('mongoose');

let isConnected = false;

// Auto-sanitize MongoDB URI if password contains unencoded special characters like '@'
const sanitizeMongoUri = (rawUri) => {
  if (!rawUri || typeof rawUri !== 'string') return rawUri;
  try {
    const match = rawUri.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
    if (!match) return rawUri;
    const protocol = match[1];
    const rest = match[2];

    const lastAtIndex = rest.lastIndexOf('@');
    if (lastAtIndex === -1) return rawUri;

    const userinfo = rest.substring(0, lastAtIndex);
    const hostAndOptions = rest.substring(lastAtIndex + 1);

    const firstColonIndex = userinfo.indexOf(':');
    if (firstColonIndex === -1) return rawUri;

    const username = userinfo.substring(0, firstColonIndex);
    let password = userinfo.substring(firstColonIndex + 1);

    // If password contains raw '@', URL-encode it to '%40'
    if (password.includes('@')) {
      password = password.replace(/@/g, '%40');
      return `${protocol}${username}:${password}@${hostAndOptions}`;
    }
  } catch (err) {
    // Return original if parsing error
  }
  return rawUri;
};

const connectDB = async () => {
  const rawUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lms_db';
  const uri = sanitizeMongoUri(rawUri);

  try {
    // Attempt connecting to the configured URI with a 3-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[Database] Successfully connected to MongoDB at: ${uri.replace(/\/\/[^@]+@/, '//***:***@')}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.log(
      `[Database] Note: Could not connect to MongoDB (${error.message}).`
    );
    console.log(
      `[Database] Operating with persistent local JSON database (server/data/db.json) for instant zero-config evaluation.`
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
