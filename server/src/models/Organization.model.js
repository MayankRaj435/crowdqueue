const mongoose = require('mongoose');
const { Schema } = mongoose;

const organizationSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: 200,
  },
  type: {
    type: String,
    enum: ['hospital', 'rto', 'bank', 'government', 'other'],
    required: [true, 'Organization type is required'],
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  address: {
    line1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, match: /^\d{6}$/ },
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: [true, 'Location coordinates are required'],
    },
  },
  phone: String,
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  operatingHours: [{
    day: { type: Number, min: 0, max: 6 },
    open: { type: String, default: '09:00' },
    close: { type: String, default: '17:00' },
  }],
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  avgRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

organizationSchema.index({ location: '2dsphere' });
organizationSchema.index({ type: 1, isActive: 1 });
organizationSchema.index({ adminId: 1 });

module.exports = mongoose.model('Organization', organizationSchema);
