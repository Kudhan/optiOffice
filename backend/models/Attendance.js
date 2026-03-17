const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['Present', 'Late', 'Half-Day'],
    default: 'Present'
  },
  workHours: {
    type: Number,
    default: 0
  }
}, {
  collection: 'attendances_collection',
  timestamps: true
});

// Composite Index: Ensure { user, date } is unique so a user can't check in twice on the same day.
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

// Transform output to match expected frontend structure (id instead of _id)
attendanceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
