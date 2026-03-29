const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const User = require('../models/User');

async function migrateIdentityFields() {
  try {
    const mongoUri = process.env.MONGO_URI;
    const uri = mongoUri.includes('?') 
      ? mongoUri.replace('?', 'optiflow_db?') 
      : `${mongoUri}/optiflow_db`;

    await mongoose.connect(uri);
    console.log('[MIGRATION] Connected to MongoDB');

    const users = await User.find({});
    let count = 0;

    for (const user of users) {
      let modified = false;
      
      // If taxId has data and panNumber doesn't, migrate
      if (user.privateIdentity?.taxId && !user.privateIdentity?.panNumber) {
        user.privateIdentity.panNumber = user.privateIdentity.taxId;
        modified = true;
      }

      // We don't have passportNumber in the schema anymore, so we use direct access
      // Since it was part of privateIdentity, it might still be in the raw document
      const rawUser = user.toObject({ virtuals: false });
      if (rawUser.privateIdentity?.passportNumber && !user.privateIdentity?.aadharNumber) {
        user.privateIdentity.aadharNumber = rawUser.privateIdentity.passportNumber;
        modified = true;
      }

      if (modified) {
        await user.save();
        count++;
      }
    }

    console.log(`[MIGRATION DONE] Updated ${count} users.`);
    process.exit(0);
  } catch (err) {
    console.error('[MIGRATION ERROR]', err);
    process.exit(1);
  }
}

migrateIdentityFields();
