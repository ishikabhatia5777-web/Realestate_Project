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
    service: 'Real Estate Marketplace API Server'
  });
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
});
