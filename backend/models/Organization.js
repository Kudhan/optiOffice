const mongoose = require('mongoose');

const organizationSchema = mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    unique: true,
    default: 'default_tenant'
  },
  name: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    default: null
  },
  address: {
    type: String,
    default: null
  }
}, {
  collection: 'organizations_collection',
  timestamps: true
});

organizationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('Organization', organizationSchema);
