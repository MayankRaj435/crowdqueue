const mongoose = require('mongoose');
const { Schema } = mongoose;

const tokenSchema = new Schema({
  queueId: {
    type: Schema.Types.ObjectId,
    ref: 'Queue',
    required: true,
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tokenNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['waiting', 'called', 'serving', 'served', 'skipped', 'cancelled', 'expired', 'no_show'],
    default: 'waiting',
  },
  estimatedWaitMs: Number,
  actualWaitMs: Number,
  calledAt: Date,
  servedAt: Date,
  cancelledAt: Date,
  cancelReason: {
    type: String,
    maxlength: 200,
  },
  isNotified: {
    type: Boolean,
    default: false,
  },
  notifiedAt: Date,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  feedback: {
    type: String,
    maxlength: 500,
  },
  counterNumber: Number,
  staffId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

tokenSchema.index({ queueId: 1, status: 1 });
tokenSchema.index({ userId: 1, status: 1 });
tokenSchema.index({ queueId: 1, tokenNumber: 1 }, { unique: true });
tokenSchema.index({ queueId: 1, servedAt: -1 });
tokenSchema.index({ createdAt: -1 });
tokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Token', tokenSchema);
