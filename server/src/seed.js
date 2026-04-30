require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User.model');

const seed = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/crowdqueue';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const phone = process.env.SUPER_ADMIN_PHONE || '9999999999';
  const existing = await User.findOne({ phone });

  if (existing) {
    console.log('Super admin already exists:', existing.name);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'admin123456', 12);

  const admin = await User.create({
    name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
    phone,
    passwordHash,
    role: 'super_admin',
    isPhoneVerified: true,
    isActive: true,
  });

  console.log('Super admin created:', admin.name, '| Phone:', admin.phone);
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
