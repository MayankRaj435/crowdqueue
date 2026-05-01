const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number'],
  },
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['citizen', 'staff', 'org_admin', 'super_admin'],
    default: 'citizen',
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
  },
  pushSubscription: {
    type: Object,
  },
  trustScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 100,
  },
  noShowCount: {
    type: Number,
    default: 0,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLoginAt: Date,
  refreshTokenHash: String,
}, { timestamps: true });

userSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.model('User', userSchema);
