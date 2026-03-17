const mongoose = require('mongoose');

const departmentSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  }
}, {
  collection: 'departments_collection',
  timestamps: true
});

// Composite Index: Prevent duplicate department names within the same tenant
departmentSchema.index({ name: 1, tenantId: 1 }, { unique: true });

// Transform output to match expected frontend structure
departmentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('Department', departmentSchema);
