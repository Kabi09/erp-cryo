const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config');
const Employee = require('./models/Employee');

const seedSuperAdmin = async () => {
  try {
    const existingSuperAdmin = await Employee.findOne({ role: 'superadmin' });

    if (existingSuperAdmin) {
      console.log('Super Admin already exists. Skipping seed.');
      return;
    }

    const superAdmin = await Employee.create({
      name: 'Super Admin',
      email: 'superadmin@cryo.com',
      password: 'SuperAdmin@123',
      role: 'superadmin',
      department: 'management',
      isActive: true,
    });

    console.log(`Super Admin seeded successfully: ${superAdmin.email}`);
  } catch (error) {
    console.error('Error seeding Super Admin:', error.message);
  }
};

// If run directly: connect, seed, disconnect
if (require.main === module) {
  (async () => {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected for seeding.');
    await seedSuperAdmin();
    await mongoose.disconnect();
    console.log('Seed complete. Disconnected.');
    process.exit(0);
  })();
}

module.exports = seedSuperAdmin;
