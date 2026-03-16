const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    default: 'default_tenant'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  assigned_to: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: "To Do"
  },
  priority: {
    type: String,
    default: "Medium"
  },
  due_date: {
    type: String,
    default: null
  }
}, {
  collection: 'tasks_collection',
  timestamps: true
});

taskSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('Task', taskSchema);
