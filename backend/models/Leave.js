const mongoose = require('mongoose');

const leaveSchema = mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    default: 'default_tenant'
  },
  username: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  start_date: {
    type: String,
    required: true
  },
  end_date: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: "Pending"
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  hr_notified: {
    type: Boolean,
    default: false
  },
  rejection_reason: {
    type: String,
    default: null
  }
}, {
  collection: 'leaves_collection',
  timestamps: true
});

leaveSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('Leave', leaveSchema);
