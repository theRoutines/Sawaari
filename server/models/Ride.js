import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },

  pickupLocation: {
    address: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  },

  dropLocation: {
    address: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  },

  vehicleType: {
    type: String,
    enum: ['economy', 'comfort', 'premium', 'xl', 'suv'],
    required: true
  },

  status: {
    type: String,
    enum: [
      'requested',
      'accepted',
      'rejected',
      'started',
      'ended',
      'cancelled'
    ],
    default: 'requested'
  },

  fare: { type: Number, default: 0 },
  distance: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },

  requestedAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date, default: null },
  rejectedAt: { type: Date, default: null },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },

  paymentReceived: {
    type: Boolean,
    default: false
  },
  paymentReceivedAt: {
    type: Date,
    default: null
  },

  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },

  rejectReason: {
    type: String,
    default: null
  }
});

export default mongoose.model('Ride', rideSchema);
