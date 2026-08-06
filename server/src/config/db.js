const mongoose = require('mongoose');
const dns = require('dns');

// Use Google & Cloudflare DNS to resolve MongoDB Atlas SRV records
// (Router DNS often fails to resolve MongoDB SRV records)
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
  try {
    // Disable command buffering up front so operations fail fast if DB is disconnected
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
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
