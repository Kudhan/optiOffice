const mongoose = require('mongoose');

const roleSchema = mongoose.Schema({
  tenantId: {
    type: String,
    required: false,
    default: null
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  permissions: {
    type: [String],
    default: []
  },
  scopeType: {
    type: String,
    enum: ['Global', 'Departmental', 'DirectReport'],
    default: 'DirectReport'
  }
}, {
  collection: 'roles_collection',
  timestamps: true
});

// Create a compound index for unique role names within a tenant
roleSchema.index({ name: 1, tenantId: 1 }, { unique: true });

roleSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('Role', roleSchema);
