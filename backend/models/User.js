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
  leave_balance: {
    type: Number,
    default: 20
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
  department: {
    type: String,
    default: "General"
  },
  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'blocked', 'suspended', 'Active', 'frozen'],
    default: 'active',
    set: v => v.toLowerCase()
  },
  joining_date: {
    type: String,
    default: ""
  },
  sessionVersion: {
    type: Number,
    default: 0
  },
  preferences: {
    language: { type: String, default: "en" },
    timezone: { type: String, default: "UTC" },
    notifications: { type: String, default: "email" }
  },
  shift_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    default: null
  }

}, {
  collection: 'users_collection',
  timestamps: true
});

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('User', userSchema);
