const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['IT', 'HR', 'Finance', 'Maintenance'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Open', 'In-Progress', 'Resolved', 'Closed'],
    default: 'Pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  comments: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: false
    }
  }]
}, {
  collection: 'tickets_collection',
  timestamps: true
});

// Robust Serialization Transforms
const transform = (doc, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  return ret;
};

ticketSchema.set('toJSON', { virtuals: true, transform });
ticketSchema.set('toObject', { virtuals: true, transform });

module.exports = mongoose.model('Ticket', ticketSchema);
