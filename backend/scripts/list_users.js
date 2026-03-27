const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const User = require('../models/User');

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const users = await User.find({}).lean();
    console.log(`Found ${users.length} users:`);
    
    users.forEach(u => {
      console.log(`- Username: "${u.username}", Email: "${u.email}", Tenant: "${u.tenantId}", HasPassword: ${!!u.hashed_password}`);
      if (u.hashed_password && !u.hashed_password.startsWith('$2')) {
          console.warn(`  [WARNING] User "${u.username}" has invalid hash format: ${u.hashed_password}`);
      }
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listUsers();
