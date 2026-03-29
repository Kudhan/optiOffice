const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['TicketUpdate', 'NewTicket', 'TaskAssignment'],
    default: 'TicketUpdate'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  read: {
    type: Boolean,
    default: false
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

const transform = (doc, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  return ret;
};

notificationSchema.set('toJSON', { virtuals: true, transform });
notificationSchema.set('toObject', { virtuals: true, transform });

module.exports = mongoose.model('Notification', notificationSchema);
