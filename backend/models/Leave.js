const mongoose = require('mongoose');

// Task 1: The Leave Schema
const leaveSchema = mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    default: 'default_tenant'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['EL', 'SL', 'CL', 'LWP'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: "Pending"
  },
  appliedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejection_reason: {
    type: String,
    default: null
  }
}, {
  collection: 'leaves_collection',
  timestamps: true
});

// Balance Model per User
const leaveBalanceSchema = mongoose.Schema({
  tenantId: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  annual_total: {
    type: Number,
    default: 30
  },
  used: {
    type: Number,
    default: 0
  },
  remaining: {
    type: Number,
    default: 30
  }
}, {
  collection: 'leave_balances',
  timestamps: true
});

const transforms = {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
};

leaveSchema.set('toJSON', transforms);
leaveBalanceSchema.set('toJSON', transforms);

const Leave = mongoose.model('Leave', leaveSchema);
const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);

module.exports = { Leave, LeaveBalance };
