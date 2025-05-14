const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const orderRoutes = require('./routes/order');
const messageRoutes = require('./routes/message');
const notificationRoutes = require('./routes/notification');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join room based on userId
  socket.on('join', (userId) => {
    socket.join(userId);
  });
  
  // Handle real-time messages
  socket.on('sendMessage', async (messageData) => {
    try {
      // Save message to database
      const message = await prisma.message.create({
        data: {
          content: messageData.content,
          senderId: messageData.senderId,
          receiverId: messageData.receiverId,
          timestamp: new Date()
        }
      });
      
      // Send message to receiver
      io.to(messageData.receiverId).emit('newMessage', message);
      
      // Send confirmation to sender
      socket.emit('messageSent', message);
    } catch (error) {
      socket.emit('messageError', { error: error.message });
    }
  });
  
  // Handle notifications
  socket.on('notification', (data) => {
    io.to(data.userId).emit('newNotification', data.notification);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'সার্ভার এরর',
    error: err.message
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
