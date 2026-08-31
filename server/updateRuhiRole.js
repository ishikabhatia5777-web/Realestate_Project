const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./src/models/User');
  await User.updateOne({ email: 'ruhibhatia0022@gmail.com' }, { $set: { role: 'agent' } });
  console.log('Updated Ruhi role to agent');
  mongoose.connection.close();
};

run();
