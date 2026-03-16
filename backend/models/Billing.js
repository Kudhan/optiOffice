const mongoose = require('mongoose');

const billingSchema = mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    unique: true
  },
  planType: {
    type: String,
    enum: ['Free', 'Pro', 'Enterprise'],
    default: 'Free'
  },
  status: {
    type: String,
    enum: ['Active', 'Past Due', 'Unpaid', 'Canceled'],
    default: 'Active'
  },
  billingCycle: {
    type: String,
    enum: ['Monthly', 'Annually'],
    default: 'Monthly'
  },
  nextPaymentDate: {
    type: Date,
    default: null
  },
  userLimit: {
    type: Number,
    default: 10 // E.g., Free plan allows 10 users
  }
}, {
  collection: 'billing_collection',
  timestamps: true
});

billingSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('Billing', billingSchema);
