const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    default: 'default_tenant'
  },
  username: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  check_in: {
    type: Date,
    default: null
  },
  check_out: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    default: "Present"
  }
}, {
  collection: 'attendances_collection',
  timestamps: true
});

// Transform _id to id to match Python output
attendanceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
