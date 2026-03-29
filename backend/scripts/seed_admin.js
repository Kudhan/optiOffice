const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const User = require('../models/User');
const Role = require('../models/Role');

async function seedAdmin() {
  try {
    const mongoUri = process.env.MONGO_URI;
    const uri = mongoUri.includes('?') 
      ? mongoUri.replace('?', 'optioffice_db?') 
      : `${mongoUri}/optioffice_db`;

    await mongoose.connect(uri);
    console.log('[SEED] Connected to MongoDB (optioffice_db)');
    
    // Create Admin Role
    const adminRole = await Role.findOneAndUpdate(
      { name: 'admin', tenantId: 'default_tenant' },
      { 
        permissions: ['can_manage_users', 'can_view_sensitive_data'], 
        scopeType: 'Global' 
      },
      { upsert: true, new: true }
    );
    console.log('[SEED] Admin role ensured');

    // Create Admin User
    const existing = await User.findOne({ username: 'admin' });
    if (!existing) {
      const salt = await bcrypt.genSalt(12);
      const hashed_password = await bcrypt.hash('admin123', salt);
      
      await User.create({
        username: 'admin',
        email: 'admin@optioffice.com',
        full_name: 'Master Admin',
        role: 'admin',
        tenantId: 'default_tenant',
        hashed_password
      });
      console.log('[SEED] Admin user created (login: admin / admin123)');
    } else {
      console.log('[SEED] Admin user already exists');
    }

    process.exit(0);
  } catch (err) {
    console.error('[SEED ERROR]', err);
    process.exit(1);
  }
}

seedAdmin();
