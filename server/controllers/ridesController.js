import { validationResult } from 'express-validator';
import Ride from '../models/Ride.js';
import Driver from '../models/Driver.js';
import User from '../models/User.js';

/* ---------------- Helpers ---------------- */

const calculateFare = (distance, vehicleType) => {
  const baseFare = {
    economy: 50, comfort: 80, premium: 120, xl: 100, suv: 150
  };

  const perKmRate = {
    economy: 10, comfort: 15, premium: 25, xl: 20, suv: 30
  };

  return baseFare[vehicleType] + distance * perKmRate[vehicleType];
};

/* ---------------- Controllers ---------------- */

export const requestRide = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.session.userId);
    if (!user || user.userType !== 'user') {
      return res.status(403).json({ message: 'Only users can request rides' });
    }

    const { pickupLocation, dropLocation, vehicleType, distance, duration } = req.body;

    const ride = await Ride.create({
      userId: req.session.userId,
      pickupLocation,
      dropLocation,
      vehicleType,
      distance,
      duration,
      fare: calculateFare(distance, vehicleType),
      status: 'requested'
    });

    const io = req.app.get('io');
    if (io) {
      // Broadcast a new ride request to online drivers; each driver
      // can decide if it is relevant based on vehicleType.
      io.emit('ride:request', { ride });
    }

    res.status(201).json({ message: 'Ride requested', ride });
  } catch (err) {
    console.error('Request ride error:', err);
    res.status(500).json({ message: 'Ride request failed' });
  }
};

export const getAvailableDrivers = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user || user.userType !== 'user') {
      return res.status(403).json({ message: 'Only users can view drivers' });
    }

    const { vehicleType } = req.query;

    if (!vehicleType) {
      return res.status(400).json({ message: 'vehicleType is required' });
    }

    const drivers = await Driver.find({
      isAvailable: true,
      vehicleType
    }).populate('userId', 'name');

    const formattedDrivers = drivers.map((driver) => ({
      id: driver._id,
      name: driver.userId?.name || 'Driver',
      vehicleType: driver.vehicleType,
      vehicleModel: driver.vehicleModel,
      vehicleNumber: driver.vehicleNumber,
      rating: driver.rating || 4.5,
      totalRides: driver.totalRides || 0
    }));

    res.json({ drivers: formattedDrivers });
  } catch (error) {
    console.error('Available drivers error:', error);
    res.status(500).json({ message: 'Failed to fetch available drivers' });
  }
};

export const acceptRide = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user || user.userType !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can accept rides' });
    }

    const driver = await Driver.findOne({ userId: user._id });
    if (!driver || !driver.isAvailable) {
      return res.status(400).json({ message: 'Driver unavailable' });
    }

    const ride = await Ride.findById(req.params.rideId);
    if (!ride || ride.status !== 'requested') {
      return res.status(400).json({ message: 'Ride not available' });
    }

    ride.driverId = driver._id;
    ride.status = 'accepted';
    ride.acceptedAt = new Date();
    await ride.save();

    driver.isAvailable = false;
    await driver.save();

    const io = req.app.get('io');
    if (io) {
      // Notify only the user + driver in this ride room
      io.to(`ride:${ride._id}`).emit('ride:assigned', { ride });
      io.to(`ride:${ride._id}`).emit('ride:accepted', { ride });
    }

    res.json({ message: 'Ride accepted', ride });
  } catch (err) {
    console.error('Accept ride error:', err);
    res.status(500).json({ message: 'Accept failed' });
  }
};

export const rejectRide = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user || user.userType !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can reject rides' });
    }

    const driver = await Driver.findOne({ userId: user._id });
    const ride = await Ride.findById(req.params.rideId);

    if (!ride || ride.status !== 'requested') {
      return res.status(400).json({ message: 'Ride not rejectable' });
    }

    ride.status = 'rejected';
    ride.rejectedAt = new Date();
    ride.rejectedBy = driver?._id || null;
    ride.rejectReason = req.body.reason || 'Driver unavailable';
    await ride.save();

    const io = req.app.get('io');
    io?.to(`ride:${ride._id}`).emit('ride:rejected', { ride });

    res.json({ message: 'Ride rejected', ride });
  } catch (err) {
    console.error('Reject ride error:', err);
    res.status(500).json({ message: 'Reject failed' });
  }
};

export const getUserCurrentRide = async (req, res) => {
  const ride = await Ride.findOne({
    userId: req.session.userId,
    status: { $in: ['requested', 'accepted', 'started', 'rejected'] }
  }).populate('driverId');
  res.json({ ride });
};

export const getDriverPendingRides = async (req, res) => {
  const driver = await Driver.findOne({ userId: req.session.userId });
  const rides = await Ride.find({
    status: 'requested',
    vehicleType: driver.vehicleType
  }).populate('userId', 'name phone');
  res.json({ rides });
};

export const getDriverCurrentRide = async (req, res) => {
  const driver = await Driver.findOne({ userId: req.session.userId });
  const ride = await Ride.findOne({
    driverId: driver._id,
    status: { $in: ['accepted', 'started'] }
  });
  res.json({ ride });
};

export const setDriverAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user || user.userType !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can update availability' });
    }

    const driver = await Driver.findOne({ userId: user._id });
    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    const { isAvailable } = req.body;
    driver.isAvailable = Boolean(isAvailable);
    await driver.save();

    res.json({ message: 'Availability updated', driver });
  } catch (err) {
    console.error('Set availability error:', err);
    res.status(500).json({ message: 'Failed to update availability' });
  }
};

export const startRide = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user || user.userType !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can start rides' });
    }

    const driver = await Driver.findOne({ userId: user._id });
    const ride = await Ride.findById(req.params.rideId);

    if (!ride || String(ride.driverId) !== String(driver._id)) {
      return res.status(403).json({ message: 'Not your ride' });
    }

    if (ride.status !== 'accepted') {
      return res.status(400).json({ message: 'Ride cannot be started' });
    }

    ride.status = 'started';
    ride.startedAt = new Date();
    await ride.save();

    const io = req.app.get('io');
    io?.to(`ride:${ride._id}`).emit('ride:started', { ride });

    res.json({ message: 'Ride started', ride });
  } catch (err) {
    console.error('Start ride error:', err);
    res.status(500).json({ message: 'Start failed' });
  }
};

export const completeRide = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user || user.userType !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can end rides' });
    }

    const driver = await Driver.findOne({ userId: user._id });
    const ride = await Ride.findById(req.params.rideId);

    if (!ride || String(ride.driverId) !== String(driver._id)) {
      return res.status(403).json({ message: 'Not your ride' });
    }

    if (ride.status !== 'started') {
      return res.status(400).json({ message: 'Ride cannot be ended' });
    }

    ride.status = 'ended';
    ride.completedAt = new Date();
    await ride.save();

    driver.isAvailable = true;
    driver.totalRides += 1;
    driver.totalEarnings += ride.fare;
    await driver.save();

    const io = req.app.get('io');
    io?.to(`ride:${ride._id}`).emit('ride:ended', { ride });

    res.json({ message: 'Ride ended', ride });
  } catch (err) {
    console.error('Complete ride error:', err);
    res.status(500).json({ message: 'End ride failed' });
  }
};

export const confirmPaymentReceived = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user || user.userType !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can confirm payment' });
    }

    const driver = await Driver.findOne({ userId: user._id });
    const ride = await Ride.findById(req.params.rideId);

    if (!ride || String(ride.driverId) !== String(driver._id)) {
      return res.status(403).json({ message: 'Not your ride' });
    }

    if (ride.status !== 'ended') {
      return res.status(400).json({ message: 'Payment can only be confirmed after ride ends' });
    }

    ride.paymentReceived = true;
    ride.paymentReceivedAt = new Date();
    await ride.save();

    const io = req.app.get('io');
    io?.to(`ride:${ride._id}`).emit('payment:received', {
      rideId: ride._id,
      amount: ride.fare,
      paymentReceivedAt: ride.paymentReceivedAt
    });

    res.json({ message: 'Payment confirmed', ride });
  } catch (err) {
    console.error('Payment confirmation error:', err);
    res.status(500).json({ message: 'Payment confirmation failed' });
  }
};


