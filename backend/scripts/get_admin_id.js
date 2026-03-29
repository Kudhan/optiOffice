const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const User = require('../models/User');

async function getAdminId() {
  const mongoUri = process.env.MONGO_URI;
  const uri = mongoUri.includes('?') 
    ? mongoUri.replace('?', 'optioffice_db?') 
    : `${mongoUri}/optioffice_db`;
    
  await mongoose.connect(uri);
  const user = await User.findOne({ username: 'admin' });
  if (user) {
    console.log(`ADMIN_ID: ${user._id}`);
  } else {
    console.log('Admin not found');
  }
  process.exit(0);
}
getAdminId();
