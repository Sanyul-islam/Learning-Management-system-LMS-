const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const initialData = {
  admins: [],
  courses: [],
  lectures: [],
};

const readStore = () => {
  try {
    ensureDataDir();
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content || '{}') || initialData;
  } catch (err) {
    console.error('Error reading JSON store:', err.message);
    return initialData;
  }
};

const writeStore = (data) => {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing JSON store:', err.message);
  }
};

const generateId = () => crypto.randomBytes(12).toString('hex');

module.exports = {
  readStore,
  writeStore,
  generateId,
  DATA_FILE,
};

