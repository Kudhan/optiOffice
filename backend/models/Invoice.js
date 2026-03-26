const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Void', 'Refunded'],
    default: 'Paid'
  },
  billingDate: {
    type: Date,
    default: Date.now
  },
  items: [{
    description: String,
    quantity: Number,
    amount: Number
  }]
}, {
  timestamps: true
});

invoiceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
