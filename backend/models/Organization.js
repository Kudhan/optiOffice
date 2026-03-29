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
  },
  configuration: {
    expectedHours: {
      type: Number,
      default: 8
    },
    weeklyOffs: {
      type: [Number],
      default: [0, 6] // Sunday, Saturday
    },
    lateThreshold: {
      type: Number,
      default: 15 // minutes
    },
    leaveClassifications: {
      type: [{
        title: { type: String, required: true },
        code: { type: String, required: true },
        days: { type: Number, required: true, default: 0 },
        isDeductible: { type: Boolean, default: true }
      }],
      default: [
        { title: 'Earned Leave', code: 'EL', days: 15, isDeductible: true },
        { title: 'Sick Leave', code: 'SL', days: 12, isDeductible: true },
        { title: 'Casual Leave', code: 'CL', days: 8, isDeductible: true },
        { title: 'Work From Home', code: 'WFH', days: 30, isDeductible: false }
      ]
    }
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
