const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@sbworks.com',
      password: 'admin123456',
      role: 'admin',
    });

    console.log('Admin user created successfully:');
    console.log(`  Email: ${admin.email}`);
    console.log('  Password: admin123456');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
