const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Holiday name is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Holiday date is required']
  },
  type: {
    type: String,
    enum: ['Public', 'Optional', 'Company-Specific'],
    default: 'Public'
  },
  isPaid: {
    type: Boolean,
    default: true
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  isCustom: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Transform output to match expected frontend structure (id instead of _id)
holidaySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

// Unique composite index to prevent duplicate holidays for the same company on the same date
holidaySchema.index({ tenantId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Holiday', holidaySchema);
