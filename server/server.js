import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import rideRoutes from './routes/rides.js';
import dashboardRoutes from './routes/dashboard.js';
import Driver from './models/Driver.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }
});

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'sawari-secret',
  resave: false,
  saveUninitialized: false
}));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sawari')
  .then(() => console.log('MongoDB connected'));

app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Maps for reconnect safety and direct socket targeting if needed
const userSockets = new Map();   // userId -> socketId
const driverSockets = new Map(); // driverId -> socketId

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('user:connect', async ({ userId, userType }) => {
    if (!userId) return;
    socket.data.userId = userId;
    socket.data.userType = userType;

    userSockets.set(String(userId), socket.id);

    if (userType === 'driver') {
      try {
        const driver = await Driver.findOne({ userId });
        if (driver) {
          driverSockets.set(String(driver._id), socket.id);
          socket.data.driverId = String(driver._id);
        }
      } catch (err) {
        console.error('Error mapping driver socket:', err);
      }
    }
  });

  // Both user and driver join the same room per ride for 1-1 messaging
  socket.on('ride:join', ({ rideId }) => {
    if (!rideId) return;
    const room = `ride:${rideId}`;
    socket.join(room);
  });

  socket.on('disconnect', () => {
    for (const [key, value] of userSockets.entries()) {
      if (value === socket.id) userSockets.delete(key);
    }
    for (const [key, value] of driverSockets.entries()) {
      if (value === socket.id) driverSockets.delete(key);
    }
  });
});

app.set('io', io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`🚕 Sawari backend running on port ${PORT}`)
);