const mongoose = require('mongoose');
const { Schema } = mongoose;

const analyticsSchema = new Schema({
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
  date: {
    type: Date,
    required: true,
  },
  totalTokensIssued: {
    type: Number,
    default: 0,
  },
  totalServed: {
    type: Number,
    default: 0,
  },
  totalNoShows: {
    type: Number,
    default: 0,
  },
  totalCancelled: {
    type: Number,
    default: 0,
  },
  avgWaitTimeMs: Number,
  avgServiceTimeMs: Number,
  avgRating: Number,
  peakHour: {
    type: Number,
    min: 0,
    max: 23,
  },
  hourlyTokens: {
    type: Map,
    of: Number,
    default: {},
  },
}, { timestamps: true });

analyticsSchema.index({ queueId: 1, date: -1 });
analyticsSchema.index({ organizationId: 1, date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
