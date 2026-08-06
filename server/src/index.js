const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

// ✅ Load env vars FIRST before anything else reads them
dotenv.config();

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

// ✅ Build allowed origins list from env — supports Vercel + localhost
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  CLIENT_URL,
  // Allow any vercel.app subdomain automatically
  /https:\/\/.*\.vercel\.app$/,
  // Allow any onrender.com subdomain
  /https:\/\/.*\.onrender\.com$/,
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, Postman)
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some((o) =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    if (allowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-test-mode'],
};

// ✅ Initialize Socket.io with dynamic CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }
});

// Connect to MongoDB
connectDB();

// Express Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight for all routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    service: 'Real Estate Marketplace API Server',
    environment: process.env.NODE_ENV || 'development',
    clientUrl: CLIENT_URL
  });
});

const path = require('path');

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

// Serve Frontend Static Build if available
const clientDistPath = path.join(__dirname, '../../client/dist');
const fs = require('fs');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

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
