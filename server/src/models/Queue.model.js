const mongoose = require('mongoose');
const { Schema } = mongoose;

const queueSchema = new Schema({
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Queue name is required'],
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  maxCapacity: {
    type: Number,
    default: 200,
    min: 1,
  },
  currentToken: {
    type: Number,
    default: 0,
  },
  lastTokenIssued: {
    type: Number,
    default: 0,
  },
  avgServiceTimeMs: {
    type: Number,
    default: 300000,
  },
  recentServiceTimes: {
    type: [Number],
    default: [],
  },
  notifyThreshold: {
    type: Number,
    default: 3,
    min: 1,
    max: 20,
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'closed', 'full'],
    default: 'active',
  },
  operatesOn: [{
    type: Number,
    enum: [0, 1, 2, 3, 4, 5, 6],
  }],
  opensAt: {
    type: String,
    default: '09:00',
  },
  closesAt: {
    type: String,
    default: '17:00',
  },
  requirePhoneVerification: {
    type: Boolean,
    default: false,
  },
  totalServedToday: {
    type: Number,
    default: 0,
  },
  noShowCountToday: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

queueSchema.index({ organizationId: 1, status: 1 });

module.exports = mongoose.model('Queue', queueSchema);
