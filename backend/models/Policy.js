const mongoose = require('mongoose');

const policySchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Policy title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Policy content is required']
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: 'FileText'
  },
  category: {
    type: String,
    enum: ['General', 'HR', 'IT', 'Attendance'],
    default: 'General'
  },
  isSystemGenerated: {
    type: Boolean,
    default: false
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  }
}, {
  collection: 'policies_collection',
  timestamps: true
});

// Text index for searchability
policySchema.index({ title: 'text', content: 'text' });

policySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('Policy', policySchema);
