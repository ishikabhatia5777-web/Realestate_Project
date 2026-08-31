const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./src/models/User');
    
    // Find Ruhi
    const ruhi = await User.findOne({ email: 'ruhibhatia0022@gmail.com' });
    if (!ruhi) {
      console.log('Ruhi user not found');
      return process.exit(0);
    }
    
    // Set new password (the pre-save hook in User.js will hash it)
    ruhi.password = '123456';
    await ruhi.save();
    
    console.log('Successfully updated password for ruhibhatia0022@gmail.com to 123456');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.connection.close();
  }
};

run();
