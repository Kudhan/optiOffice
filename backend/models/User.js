const mongoose = require('mongoose');

// Mongoose schema designed to precisely match the structure used by the Python codebase in MongoDB
const userSchema = mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    default: 'default_tenant'
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  full_name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ""
  },
  profile_photo: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    default: ""
  },
  disabled: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    required: true
  },
  hashed_password: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    default: ""
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  status: {
    type: String,
    default: "Active"
  },
  joining_date: {
    type: String,
    default: ""
  },
  preferences: {
    language: { type: String, default: "en" },
    timezone: { type: String, default: "UTC" },
    notifications: { type: String, default: "email" }
  }
}, {
  collection: 'users_collection' 
});

module.exports = mongoose.model('User', userSchema);
