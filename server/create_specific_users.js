const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

const usersToCreate = [
  { name: 'Agent Upansh', email: 'upansh769@gmail.com', password: '123456', role: 'agent' },
  { name: 'Agent Reet', email: 'reet67711@gmail.com', password: '123456', role: 'agent' },
  { name: 'Agent Ruhi', email: 'ruhibhatia0022@gmail.com', password: '123456', role: 'agent' },
  { name: 'Agent Saghun', email: 'saghun8699@gmail.com', password: '123456', role: 'agent' },
  { name: 'Admin Ish', email: 'ishbhatia484@gmail.com', password: '123456', role: 'admin' },
];

async function run() {
  try {
    await connectDB();
    console.log('\n--- Creating Users ---');
    
    for (const userData of usersToCreate) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists. Updating password and role...`);
        existingUser.role = userData.role;
        existingUser.password = userData.password;
        existingUser.isVerified = true;
        await existingUser.save();
        console.log(`Updated ${userData.email} successfully.`);
      } else {
        const newUser = new User({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          isVerified: true
        });
        await newUser.save();
        console.log(`Created ${userData.email} as ${userData.role} successfully.`);
      }
    }
    
    console.log('--- All users processed successfully ---\n');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
