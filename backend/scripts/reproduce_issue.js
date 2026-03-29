const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ username: 'admin' });
  if (!user) {
    console.log('User not found');
  } else {
    console.log('User found:', user.username);
    const isMatch = await bcrypt.compare('admin123', user.hashed_password);
    console.log('Match result:', isMatch);
  }
  process.exit(0);
}
check();
