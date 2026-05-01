require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Organization = require('./models/Organization.model');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected, testing geo query...');
  
  const orgs = await Organization.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [77.209, 28.6139] },
        $maxDistance: 50000,
      },
    },
    isActive: true,
  }).select('name location').lean();

  console.log('Results found:', orgs.length);
  orgs.forEach(o => console.log(' -', o.name, o.location.coordinates));
  
  await mongoose.disconnect();
}).catch(e => { console.error('Error:', e.message); process.exit(1); });
