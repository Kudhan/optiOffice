const mongoose = require('mongoose');
const Attendance = require('./backend/models/Attendance');
const User = require('./backend/models/User');
const Shift = require('./backend/models/Shift');
require('dotenv').config({ path: './backend/.env' });

async function verify() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/optioffice');
  
  // Find a test user
  const user = await User.findOne({ role: 'admin' }).populate('shift_id');
  if (!user || !user.shift_id) {
    console.log("No user with shift found for testing.");
    process.exit(1);
  }

  console.log(`Testing user: ${user.full_name} with shift: ${user.shift_id.name} (${user.shift_id.startTime} - ${user.shift_id.endTime})`);
  
  // We can't easily mock 'new Date()' in the controller from here without a testing framework,
  // but we can manually verify the code logic or use the browser to test the real-time blocking.
  
  process.exit(0);
}

// verify();
