const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String, // e.g., 'Admin-1 terminated User-2 at 2026-03-19T20:51:17'
    required: true
  },
  tenantId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'audit_logs_collection',
  timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
