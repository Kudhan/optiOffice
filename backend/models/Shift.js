const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Shift name is required'],
    trim: true
  },
  startTime: {
    type: String, // HH:mm format
    required: [true, 'Start time is required'],
    match: [/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Please provide a valid time format (HH:mm)']
  },
  endTime: {
    type: String, // HH:mm format
    required: [true, 'End time is required'],
    match: [/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Please provide a valid time format (HH:mm)']
  },
  gracePeriod: {
    type: Number, // in minutes
    default: 0
  },
  workDays: {
    type: [Number], // 0: Sunday, 1: Monday, ..., 6: Saturday
    default: [1, 2, 3, 4, 5] // Mon-Fri default
  },
  tenantId: {
    type: String, // Or ObjectId depending on how tenant is stored
    required: true,
    index: true
  }
}, {
  collection: 'shifts_collection',
  timestamps: true
});

module.exports = mongoose.model('Shift', shiftSchema);
