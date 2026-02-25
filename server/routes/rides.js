import express from 'express';
import { body } from 'express-validator';
import {
  requestRide,
  getAvailableDrivers,
  acceptRide,
  rejectRide,
  getUserCurrentRide,
  getDriverPendingRides,
  getDriverCurrentRide,
  startRide,
  completeRide,
  confirmPaymentReceived,
  setDriverAvailability
} from '../controllers/ridesController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

/* ---------------- REQUEST RIDE ---------------- */
router.post(
  '/request',
  requireAuth,
  [
    body('pickupLocation.address').notEmpty(),
    body('pickupLocation.coordinates.latitude').isNumeric(),
    body('pickupLocation.coordinates.longitude').isNumeric(),
    body('dropLocation.address').notEmpty(),
    body('dropLocation.coordinates.latitude').isNumeric(),
    body('dropLocation.coordinates.longitude').isNumeric(),
    body('vehicleType').isIn(['economy', 'comfort', 'premium', 'xl', 'suv']),
    body('distance').isNumeric(),
    body('duration').isNumeric()
  ],
  requestRide
);

/* ---------------- AVAILABLE DRIVERS ---------------- */
router.get('/available-drivers', requireAuth, getAvailableDrivers);

/* ---------------- LIFECYCLE (driver) ---------------- */
router.post('/:rideId/accept', requireAuth, acceptRide);
router.post('/:rideId/reject', requireAuth, rejectRide);
router.post('/:rideId/start', requireAuth, startRide);
router.post('/:rideId/complete', requireAuth, completeRide);
router.post('/:rideId/payment-received', requireAuth, confirmPaymentReceived);
router.post('/driver/availability', requireAuth, setDriverAvailability);

/* ---------------- CURRENT RIDES ---------------- */
router.get('/user/current', requireAuth, getUserCurrentRide);
router.get('/driver/pending', requireAuth, getDriverPendingRides);
router.get('/driver/current', requireAuth, getDriverCurrentRide);

export default router;
