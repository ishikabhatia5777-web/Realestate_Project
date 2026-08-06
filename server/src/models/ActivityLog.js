const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    action: { type: String, required: true },
    details: { type: String, required: true },
    ipAddress: { type: String, default: '127.0.0.1' },
    level: { type: String, enum: ['info', 'warning', 'danger'], default: 'info' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
