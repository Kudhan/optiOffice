const mongoose = require('mongoose');

const activityLogSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Attendance', 'Task'],
    required: true
  },
  action: {
    type: String, // e.g., 'Checked In', 'Task Created'
    required: true
  },
  details: {
    type: String, // Flexible details
    default: ''
  },
  tenantId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'activity_logs_collection',
  timestamps: true
});

// Index for faster filtering
activityLogSchema.index({ tenantId: 1, timestamp: -1 });
activityLogSchema.index({ userId: 1, timestamp: -1 });

activityLogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
