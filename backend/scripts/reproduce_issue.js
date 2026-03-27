const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const User = require('../models/User');

async function reproduce() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const username = 'TestUser_' + Date.now();
    const password = 'TemporaryPassword123!';
    const email = 'test@example.com';

    console.log(`Step 1: Creating user "${username}"...`);
    // Simulate userController.js logic
    const salt = await bcrypt.genSalt(12);
    const hashed_password = await bcrypt.hash(password, salt);
    
    const user = await User.create({
      tenantId: 'reproduction_tenant',
      username,
      hashed_password,
      email,
      full_name: 'Test Reproduction',
      role: 'employee'
    });
    console.log(`User created. ID: ${user._id}`);

    console.log(`Step 2: Simulating login with EXACT username "${username}"...`);
    // Simulate authController.js logic
    const foundUser = await User.findOne({ 
      $or: [
        { username: username }, 
        { email: username }
      ]
    });

    if (!foundUser) {
      console.error('FAIL: User not found with exact username');
    } else {
      const isMatch = await bcrypt.compare(password, foundUser.hashed_password);
      console.log(`Login with exact username: ${isMatch ? 'SUCCESS' : 'FAIL'}`);
    }

    console.log(`Step 3: Simulating login with LOWERCASE username "${username.toLowerCase()}"...`);
    const foundUserLower = await User.findOne({ 
      $or: [
        { username: username.toLowerCase() }, 
        { email: username.toLowerCase() }
      ]
    });
    console.log(`Login with lowercase username: ${foundUserLower ? 'User Found' : 'User NOT Found'}`);

    // Cleanup
    await User.deleteOne({ _id: user._id });
    console.log('Cleanup complete');
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

reproduce();
