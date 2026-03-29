const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const User = require('../models/User');

async function check() {
  const mongoUri = process.env.MONGO_URI;
  const uri = mongoUri.includes('?') 
    ? mongoUri.replace('?', 'optiflow_db?') 
    : `${mongoUri}/optiflow_db`;
    
  await mongoose.connect(uri);
  const users = await User.find({});
  console.log('Users in optiflow_db:');
  users.forEach(u => {
    console.log(`- ID: ${u._id}, Username: ${u.username}, Email: ${u.email}`);
  });
  process.exit(0);
}
check();
