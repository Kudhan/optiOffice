const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const User = require('../models/User');

async function verify() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const username = 'MixedCaseUser_' + Date.now();
    const password = ' Password123 '; // Note the spaces
    const email = ' MixedCase@Example.Com '.trim().toLowerCase();

    console.log(`Step 1: Creating user "${username}" with email "${email}"...`);
    // Simulate userController.js logic (simplified for script)
    const salt = await bcrypt.genSalt(12);
    const hashed_password = await bcrypt.hash(password.trim(), salt);
    
    const user = await User.create({
      tenantId: 'verification_tenant',
      username: username,
      hashed_password: hashed_password,
      email: email,
      full_name: 'Verification User',
      role: 'employee'
    });
    console.log(`User created. ID: ${user._id}`);

    // Simulation of authController.js modified logic
    const testLogins = [
      { u: username, p: password, desc: 'Exact Username, Padded Password' },
      { u: username.toLowerCase(), p: password.trim(), desc: 'Lowercase Username, Trimmed Password' },
      { u: username.toUpperCase(), p: password, desc: 'Uppercase Username, Padded Password' },
      { u: email.toUpperCase(), p: 'Password123', desc: 'Uppercase Email, Exact Password' }
    ];

    for (const login of testLogins) {
      console.log(`\nTesting Login: ${login.desc}`);
      const trimmedU = login.u.trim();
      const trimmedP = login.p.trim();

      const foundUser = await User.findOne({ 
        $or: [
          { username: { $regex: new RegExp(`^${trimmedU}$`, 'i') } }, 
          { email: { $regex: new RegExp(`^${trimmedU}$`, 'i') } }
        ]
      });

      if (!foundUser) {
        console.log(`  FAIL: User not found for "${login.u}"`);
      } else {
        const isMatch = await bcrypt.compare(trimmedP, foundUser.hashed_password);
        console.log(`  ${isMatch ? 'SUCCESS' : 'FAIL'}: Password match for "${login.u}"`);
      }
    }

    // Cleanup
    await User.deleteOne({ _id: user._id });
    console.log('\nCleanup complete');
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verify();
