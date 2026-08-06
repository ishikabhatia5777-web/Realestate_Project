const mongoose = require('mongoose');
const dns = require('dns');

// Use Google & Cloudflare DNS to resolve MongoDB Atlas SRV records when on local Node
if (process.env.NODE_ENV !== 'production') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch (dnsErr) {
    // Ignore DNS override errors in cloud containers
  }
}

const DEFAULT_ATLAS_URI = 'mongodb+srv://ishikabhatia5777_db_user:New_password@cluster0.afbmlyd.mongodb.net/realestate_db?retryWrites=true&w=majority';

const connectDB = async () => {
  try {
    // Disable command buffering up front so operations fail fast if DB is disconnected
    mongoose.set('bufferCommands', false);

    const mongoUri = process.env.MONGO_URI || DEFAULT_ATLAS_URI;

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    // Re-enable command buffering once successfully connected
    mongoose.set('bufferCommands', true);

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Switching to offline mode...');
      mongoose.set('bufferCommands', false);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
      mongoose.set('bufferCommands', true);
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    console.log('⚠️  Running in offline fallback mode (using in-memory sample data)');
    mongoose.set('bufferCommands', false);
  }
};

module.exports = connectDB;
