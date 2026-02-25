import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useSocket } from '../contexts/SocketContext';

export default function RideStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();
  
  const { rideId, pickup, drop, distance, duration, vehicleType } = location.state || {};
  
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('requested'); // requested, accepted, started

  useEffect(() => {
    if (!rideId) {
      navigate('/trip');
      return;
    }

    fetchRideStatus();

    if (socket) {
      socket.emit('ride:join', { rideId });

      const handleAccepted = (data) => {
        if (data.ride._id === rideId) {
          setStatus('accepted');
          setRide(data.ride);
        }
      };

      const handleStarted = (data) => {
        if (data.ride._id === rideId) {
          setStatus('started');
          setRide(data.ride);
        }
      };

      const handleEnded = (data) => {
        if (data.ride._id === rideId) {
          setStatus('ended');
          setRide(data.ride);
          navigate('/ride-complete', {
            state: { rideId, fare: data.ride.fare }
          });
        }
      };

      socket.on('ride:accepted', handleAccepted);
      socket.on('ride:started', handleStarted);
      socket.on('ride:ended', handleEnded);

      return () => {
        socket.off('ride:accepted', handleAccepted);
        socket.off('ride:started', handleStarted);
        socket.off('ride:ended', handleEnded);
      };
    }
  }, [rideId, socket, navigate]);

  const fetchRideStatus = async () => {
    try {
      const response = await api.get('/rides/user/current');
      const currentRide = response.data.ride;

      if (currentRide && currentRide._id === rideId) {
        setRide(currentRide);
        setStatus(currentRide.status);
      }
    } catch (error) {
      console.error('Error fetching ride status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="text-sm text-neutral-600">Loading ride status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="flex items-center justify-between bg-black px-6 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black font-bold">
            S
          </div>
          <span className="text-lg font-semibold tracking-wide">SAWAARI</span>
        </div>
        <button
          onClick={() => navigate('/trip')}
          className="rounded-full border border-white/30 px-4 py-1.5 text-sm hover:bg-white hover:text-black transition"
        >
          Home
        </button>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Status Card */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 text-center">
            {status === 'requested' && (
              <>
                <div className="mb-4 inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-neutral-300 border-t-black"></div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  Waiting for driver...
                </h2>
                <p className="mt-2 text-sm text-neutral-600">
                  Your ride request has been sent. A driver will accept shortly.
                </p>
              </>
            )}
            {status === 'accepted' && (
              <>
                <div className="mb-4 inline-block h-16 w-16 rounded-full bg-emerald-100 p-4">
                  <svg
                    className="h-full w-full text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  Ride Accepted!
                </h2>
                <p className="mt-2 text-sm text-neutral-600">
                  Your driver is on the way to pick you up.
                </p>
              </>
            )}
            {status === 'started' && (
              <>
                <div className="mb-4 inline-block h-16 w-16 rounded-full bg-blue-100 p-4">
                  <svg
                    className="h-full w-full text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  Ride Has Started!
                </h2>
                <p className="mt-2 text-sm text-neutral-600">
                  You're on your way to your destination.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Ride Details */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">Ride Details</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-green-500"></div>
              <div className="flex-1">
                <p className="text-xs font-medium uppercase text-neutral-500">Pickup</p>
                <p className="text-sm text-neutral-900">
                  {pickup?.place_name || pickup?.text}
                </p>
              </div>
            </div>
            
            <div className="ml-1.5 h-4 w-0.5 bg-neutral-300"></div>
            
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-red-500"></div>
              <div className="flex-1">
                <p className="text-xs font-medium uppercase text-neutral-500">Drop</p>
                <p className="text-sm text-neutral-900">
                  {drop?.place_name || drop?.text}
                </p>
              </div>
            </div>
          </div>

          {ride?.driverId && (
            <div className="mt-6 border-t border-neutral-200 pt-4">
              <h4 className="mb-3 text-sm font-semibold text-neutral-900">Driver Info</h4>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-lg font-semibold text-neutral-700">
                  {ride.driverId.userId?.name?.charAt(0).toUpperCase() || 'D'}
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    {ride.driverId.userId?.name || 'Driver'}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {ride.driverId.vehicleModel} · {ride.driverId.vehicleNumber}
                  </p>
                  <p className="text-xs text-neutral-500">
                    ⭐ {ride.driverId.rating?.toFixed(1) || '0.0'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4">
            <div>
              <p className="text-xs text-neutral-500">Distance</p>
              <p className="text-sm font-semibold text-neutral-900">{distance} km</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Estimated Fare</p>
              <p className="text-sm font-semibold text-neutral-900">
                ₹{ride?.fare || 'Calculating...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
