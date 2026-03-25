const mongoose = require('mongoose');
const path = require('path');
const envPath = path.join(__dirname, 'backend', '.env');
console.log('Loading env from:', envPath);
require('dotenv').config({ path: envPath });

const Shift = require(path.join(__dirname, 'backend', 'models', 'Shift'));

async function checkShifts() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/optioffice';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    const shifts = await Shift.find();
    console.log('Shifts found:', shifts.length);
    console.log(JSON.stringify(shifts, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

checkShifts();
