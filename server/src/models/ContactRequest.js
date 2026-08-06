const mongoose = require('mongoose');

// ─── Expert Connection Request Model ─────────────────────────────────────────
// Stores every "connect me to an expert" request from buyers in the live chat.
// Agents can see these in their dashboard without needing email.

const contactRequestSchema = new mongoose.Schema(
  {
    buyerName:     { type: String, required: true },
    buyerEmail:    { type: String, default: '' },
    buyerId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    agentId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    agentName:     { type: String, default: '' },
    propertyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null },
    propertyTitle: { type: String, default: '' },
    buyerMessage:  { type: String, default: '' },
    status:        { type: String, enum: ['pending', 'contacted', 'closed'], default: 'pending' },
    isRead:        { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactRequest', contactRequestSchema);
