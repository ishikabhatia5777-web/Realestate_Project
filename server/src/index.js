const dotenv = require('dotenv');
// Load environment variables BEFORE any other imports so that
// GMAIL_USER, GMAIL_PASS, MONGO_URI, etc. are available when
// modules (emailService, db config, etc.) are first required.
dotenv.config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const agencyRoutes = require('./routes/agencyRoutes');
const offerRoutes = require('./routes/offerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const chatRoutes = require('./routes/chatRoutes');
const aiRoutes = require('./routes/aiRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Connect to MongoDB
connectDB();

// Express Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Root endpoint welcome & status check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 AuraEstate API Server is Online & Running!',
    status: 'online',
    timestamp: new Date(),
    endpoints: {
      health: '/api/health',
      properties: '/api/properties',
      auth: '/api/auth'
    }
  });
});

// API Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    service: 'Real Estate Marketplace API Server',
    email: {
      configured: !!(process.env.GMAIL_USER && process.env.GMAIL_PASS),
      user: process.env.GMAIL_USER ? process.env.GMAIL_USER.replace(/(.{3}).*(@.*)/, '$1***$2') : 'not set'
    }
  });
});

// Email connectivity test endpoint (GET — safe, no email sent)
app.get('/api/health/email', async (req, res) => {
  try {
    const { verifyEmailConnection } = require('./services/emailService');
    const result = await verifyEmailConnection();
    res.json({
      status: result.ok ? 'connected' : 'failed',
      method: result.method || null,
      error: result.error || null,
      gmailUserSet: !!process.env.GMAIL_USER,
      gmailPassSet: !!process.env.GMAIL_PASS,
      nodeEnv: process.env.NODE_ENV
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Email send test endpoint (POST — sends a real test email)
app.post('/api/health/email/test', async (req, res) => {
  try {
    const { sendEmail } = require('./services/emailService');
    const to = req.body.to || process.env.GMAIL_USER || 'ishbhatia484@gmail.com';
    const result = await sendEmail({
      to,
      subject: '✅ AuraEstates Email Test — System Working',
      html: `<div style="font-family:Arial;padding:20px;background:#0f172a;color:#e2e8f0;border-radius:10px;">
        <h2 style="color:#f59e0b;">🏡 AuraEstates — Email System Test</h2>
        <p>This is a test email sent from the production server to confirm the email system is working correctly.</p>
        <p><strong>Server Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>NODE_ENV:</strong> ${process.env.NODE_ENV}</p>
        <p><strong>GMAIL_USER:</strong> ${process.env.GMAIL_USER || 'using fallback'}</p>
        <p style="color:#34d399;">✅ If you received this email, the email system is working correctly!</p>
      </div>`
    });
    res.json({ success: true, message: `Test email sent to ${to}`, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Socket.io Real-time Chat & Alert Handler
io.on('connection', (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  socket.on('join_chat', ({ userId }) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`User ${userId} joined their notification room.`);
    }
  });

  socket.on('send_message', (data) => {
    if (!data) return;
    const recId = typeof data.receiverId === 'object' ? data.receiverId?._id : data.receiverId;
    const sendId = typeof data.senderId === 'object' ? data.senderId?._id : data.senderId;

    if (recId) {
      io.to(recId.toString()).emit('receive_message', data);
    }
    if (sendId) {
      io.to(sendId.toString()).emit('receive_message', data);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket Disconnected: ${socket.id}`);
  });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Real Estate API Server running on port ${PORT}`);
  console.log(`📧 Email config — GMAIL_USER: ${process.env.GMAIL_USER ? '✅ set (' + process.env.GMAIL_USER + ')' : '❌ NOT SET (using fallback)'}`);
  console.log(`📧 Email config — GMAIL_PASS: ${process.env.GMAIL_PASS ? '✅ set (hidden)' : '❌ NOT SET (using fallback)'}`);
  console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`🔗 CLIENT_URL: ${process.env.CLIENT_URL || 'not set (using production fallback)'}`);
});
