const mongoose = require('mongoose');

const holidaySchema = mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    default: 'default_tenant'
  },
  name: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  }
}, {
  collection: 'holidays_collection',
  timestamps: true
});

holidaySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('Holiday', holidaySchema);
