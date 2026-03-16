const mongoose = require('mongoose');

// Because policies are huge nested objects in the Python backend, we can store it flexibly
const policySchema = mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    unique: true, 
    default: 'default_tenant'
  },
  password_policy: { type: Object, default: {} },
  login_policy: { type: Object, default: {} },
  user_policy: { type: Object, default: {} },
  attendance_policy: { type: Object, default: {} },
  leave_policy: { type: Object, default: {} },
  task_policy: { type: Object, default: {} },
  document_policy: { type: Object, default: {} },
  notification_policy: { type: Object, default: {} },
  security_policy: { type: Object, default: {} },
  billing_policy: { type: Object, default: {} },
  automation_policy: { type: Object, default: {} },
  customization_policy: { type: Object, default: {} }
}, {
  collection: 'policies_collection',
  timestamps: true
});

policySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('Policy', policySchema);
