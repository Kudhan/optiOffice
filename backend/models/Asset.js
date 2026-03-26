const mongoose = require('mongoose');

const assetSchema = mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    default: 'default_tenant'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Furniture', 'Infrastructure', 'Software', 'Vehicles', 'Other'],
    default: 'Electronics'
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  serial_number: {
    type: String,
    unique: true,
    sparse: true
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['Available', 'Assigned', 'Maintenance', 'Retired', 'Lost'],
    default: "Available"
  },
  condition: {
    type: String,
    enum: ['New', 'Excellent', 'Good', 'Fair', 'Poor', 'Damaged'],
    default: 'New'
  },
  purchaseDate: {
    type: Date,
    default: null
  },
  warrantyExpiry: {
    type: Date,
    default: null
  },
  value: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
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
