require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User.model');
const Organization = require('./models/Organization.model');
const Queue = require('./models/Queue.model');

const seed = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/crowdqueue';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  // ── Super Admin ──────────────────────────────────────────────────────────
  let admin = await User.findOne({ phone: process.env.SUPER_ADMIN_PHONE || '9999999999' });
  if (!admin) {
    const passwordHash = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'admin123456', 12);
    admin = await User.create({
      name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
      phone: process.env.SUPER_ADMIN_PHONE || '9999999999',
      passwordHash,
      role: 'super_admin',
      isPhoneVerified: true,
      isActive: true,
    });
    console.log('✅ Super admin created:', admin.phone);
  } else {
    console.log('ℹ️  Super admin already exists');
  }

  // ── Sample Organizations (near New Delhi) ─────────────────────────────────
  const orgsData = [
    {
      name: 'AIIMS Delhi',
      type: 'hospital',
      description: 'All India Institute of Medical Sciences — premier public hospital.',
      address: { line1: 'Sri Aurobindo Marg', city: 'New Delhi', state: 'Delhi', pincode: '110029' },
      longitude: 77.2090,
      latitude: 28.5665,
      phone: '01126588500',
      queues: [
        { name: 'OPD — General Medicine', description: 'Out-patient department for general consultations', maxCapacity: 300 },
        { name: 'OPD — Cardiology', description: 'Heart specialist consultations', maxCapacity: 150 },
        { name: 'Pharmacy Counter', description: 'Medicine dispensing counter', maxCapacity: 200 },
      ],
    },
    {
      name: 'State Bank of India — Connaught Place',
      type: 'bank',
      description: 'Main SBI branch in Connaught Place, New Delhi.',
      address: { line1: 'Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
      longitude: 77.2167,
      latitude: 28.6315,
      phone: '01123413100',
      queues: [
        { name: 'General Banking', description: 'Cash deposits, withdrawals and queries', maxCapacity: 100 },
        { name: 'Loan Department', description: 'Home and personal loan queries', maxCapacity: 50 },
      ],
    },
    {
      name: 'Safdarjung Hospital',
      type: 'hospital',
      description: 'Major government hospital serving Delhi NCR.',
      address: { line1: 'Ansari Nagar West', city: 'New Delhi', state: 'Delhi', pincode: '110029' },
      longitude: 77.2025,
      latitude: 28.5705,
      phone: '01126165060',
      queues: [
        { name: 'Emergency OPD', description: 'Emergency out-patient services', maxCapacity: 500 },
        { name: 'Radiology', description: 'X-ray, MRI and CT scan booking', maxCapacity: 80 },
      ],
    },
    {
      name: 'Delhi RTO — Saket',
      type: 'rto',
      description: 'Regional Transport Office for vehicle registration and licence.',
      address: { line1: 'Saket', city: 'New Delhi', state: 'Delhi', pincode: '110017' },
      longitude: 77.2167,
      latitude: 28.5244,
      phone: '01126851000',
      queues: [
        { name: 'Driving Licence', description: 'New DL applications and renewals', maxCapacity: 200 },
        { name: 'Vehicle Registration', description: 'RC book and transfer of ownership', maxCapacity: 150 },
      ],
    },
    {
      name: 'HDFC Bank — Karol Bagh',
      type: 'bank',
      description: 'HDFC Bank branch serving Karol Bagh and Patel Nagar areas.',
      address: { line1: 'Ajmal Khan Road, Karol Bagh', city: 'New Delhi', state: 'Delhi', pincode: '110005' },
      longitude: 77.1897,
      latitude: 28.6519,
      phone: '01123671000',
      queues: [
        { name: 'Customer Service', description: 'Account opening, KYC and general queries', maxCapacity: 80 },
        { name: 'Priority Banking', description: 'Premium customer services', maxCapacity: 30 },
      ],
    },
  ];

  for (const orgData of orgsData) {
    const existing = await Organization.findOne({ name: orgData.name });
    if (existing) {
      console.log(`ℹ️  Already exists: ${orgData.name}`);
      continue;
    }

    // Create org admin user for each org
    const adminPhone = `98${Math.floor(10000000 + Math.random() * 89999999)}`;
    const passwordHash = await bcrypt.hash('admin123456', 12);
    const orgAdmin = await User.create({
      name: `${orgData.name} Admin`,
      phone: adminPhone,
      passwordHash,
      role: 'org_admin',
      isPhoneVerified: true,
      isActive: true,
    });

    const { longitude, latitude, queues, ...rest } = orgData;
    const org = await Organization.create({
      ...rest,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      adminId: orgAdmin._id,
      isActive: true,
    });

    // Update admin with org reference
    await User.findByIdAndUpdate(orgAdmin._id, { organizationId: org._id });

    // Create queues for this org
    for (const qData of queues) {
      await Queue.create({
        ...qData,
        organizationId: org._id,
        status: 'active',
        currentToken: 0,
        lastTokenIssued: Math.floor(Math.random() * 40),
        avgServiceTimeMs: (3 + Math.random() * 7) * 60 * 1000,
        totalServedToday: Math.floor(Math.random() * 80),
      });
    }

    console.log(`✅ Created: ${orgData.name} with ${queues.length} queues`);
  }

  console.log('\n🎉 Seed complete!');
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
