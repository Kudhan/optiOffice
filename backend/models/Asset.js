const mongoose = require('mongoose');

const assetSchema = mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    default: 'default_tenant'
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  serial_number: {
    type: String,
    default: null
  },
  assigned_to: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: "Available"
  }
}, {
  collection: 'assets_collection',
  timestamps: true
});

assetSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('Asset', assetSchema);
