import { useState, useEffect } from "react";
import api from "../utils/api";
import { useSocket } from "../contexts/SocketContext";

function DriverDashboard({ user, onLogout }) {
  const { socket } = useSocket();

  const [dashboardData, setDashboardData] = useState(null);
  const [pendingRides, setPendingRides] = useState([]);
  const [currentRide, setCurrentRide] = useState(null);
  const [newRideRequest, setNewRideRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  /* ---------------- INITIAL LOAD ---------------- */

  useEffect(() => {
    fetchDashboardData();
    fetchPendingRides();
    checkCurrentRide();
    goOnline();
  }, []);

  /* ---------------- SOCKET LISTENERS ---------------- */

  useEffect(() => {
    if (!socket) return;

    const handleNewRequest = ({ ride }) => {
      if (
        dashboardData?.driver?.vehicleType === ride.vehicleType &&
        !currentRide
      ) {
        setNewRideRequest(ride);
        setPendingRides((prev) => [ride, ...prev]);
      }
    };

    const handleRideEnded = ({ ride }) => {
      if (currentRide && ride._id === currentRide._id) {
        setCurrentRide(ride);
      }
    };

    const handlePaymentReceived = ({ rideId }) => {
      if (currentRide && rideId === currentRide._id) {
        setCurrentRide((prev) => ({ ...prev, paymentReceived: true }));
      }
    };

    socket.on("ride:request", handleNewRequest);
    socket.on("ride:ended", handleRideEnded);
    socket.on("payment:received", handlePaymentReceived);

    return () => {
      socket.off("ride:request", handleNewRequest);
      socket.off("ride:ended", handleRideEnded);
      socket.off("payment:received", handlePaymentReceived);
    };
  }, [socket, dashboardData, currentRide]);

  /* ---------------- API CALLS ---------------- */

  const fetchDashboardData = async () => {
    try {
      const res = await api.get("/dashboard/driver");
      setDashboardData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRides = async () => {
    try {
      const res = await api.get("/rides/driver/pending");
      setPendingRides(res.data.rides || []);
    } catch (err) {
      console.error(err);
    }
  };

  const checkCurrentRide = async () => {
    try {
      const res = await api.get("/rides/driver/current");
      setCurrentRide(res.data.ride || null);
    } catch (err) {
      console.error(err);
    }
  };

  const goOnline = async () => {
    await api.post("/rides/driver/availability", { isAvailable: true });
    setIsOnline(true);
  };

  const goOffline = async () => {
    await api.post("/rides/driver/availability", { isAvailable: false });
    setIsOnline(false);
  };

  /* ---------------- ACTIONS ---------------- */

  const acceptRide = async (rideId) => {
    const res = await api.post(`/rides/${rideId}/accept`);
    setCurrentRide(res.data.ride);
    setPendingRides((prev) => prev.filter((r) => r._id !== rideId));
    setNewRideRequest(null);
  };

  const startRide = async (rideId) => {
    const res = await api.post(`/rides/${rideId}/start`);
    setCurrentRide(res.data.ride);
  };

  const completeRide = async (rideId) => {
    const res = await api.post(`/rides/${rideId}/complete`);
    setCurrentRide(res.data.ride);
  };

  const confirmPayment = async (rideId) => {
    const res = await api.post(`/rides/${rideId}/payment-received`);
    setCurrentRide(res.data.ride);
    fetchDashboardData();
  };

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900 text-white">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* HEADER */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-black/90 backdrop-blur px-6 py-4 text-white shadow-lg">
        <h1 className="text-xl font-bold tracking-wide">Sawari Driver</h1>

        <div className="flex items-center gap-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold
              ${isOnline ? "bg-green-700 text-white animate-pulse" : "bg-red-100 text-red-700"}`}
          >
            {isOnline ? "ONLINE" : "OFFLINE"}
          </span>

          <button
            onClick={isOnline ? goOffline : goOnline}
            className="rounded-full border border-white/30 px-4 py-1.5 text-xs hover:bg-white hover:text-black transition"
          >
            {isOnline ? "Go Offline" : "Go Online"}
          </button>

          <button
            onClick={onLogout}
            className="rounded-full bg-red-600 px-4 py-1.5 text-xs hover:bg-red-900 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-5xl px-6 py-6">
        <h2 className="text-2xl font-semibold">
          Welcome, {dashboardData?.user?.name}
        </h2>
        <p className="text-sm text-neutral-500">
          {dashboardData?.driver?.vehicleModel} · {dashboardData?.driver?.vehicleNumber}
        </p>

        {/* STATS */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Rides", value: dashboardData?.stats?.totalRides || 0 },
            { label: "Total Earnings", value: `₹${dashboardData?.stats?.totalEarnings || 0}` },
            { label: "Status", value: isOnline ? "Online" : "Offline" }
          ].map((item, i) => (
            <div key={i} className="rounded-2xl bg-white p-5 shadow hover:shadow-xl transition">
              <p className="text-xs uppercase tracking-wider text-neutral-400">
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-bold">{item.value}</p>
            </div>
          ))}
        </section>

        {/* CURRENT RIDE */}
        {currentRide && (
          <section className="mt-8 rounded-2xl bg-white p-5 shadow-lg border-l-4 border-emerald-500">
            <h3 className="mb-3 text-lg font-semibold">🚗 Current Ride</h3>

            <p><b>Pickup:</b> {currentRide.pickupLocation.address}</p>
            <p><b>Drop:</b> {currentRide.dropLocation.address}</p>
            <p><b>Fare:</b> ₹{currentRide.fare}</p>

            <div className="mt-4 flex gap-3">
              {currentRide.status === "accepted" && (
                <button
                  onClick={() => startRide(currentRide._id)}
                  className="flex-1 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
                >
                  Start Ride
                </button>
              )}

              {currentRide.status === "started" && (
                <button
                  onClick={() => completeRide(currentRide._id)}
                  className="flex-1 rounded-lg bg-green-600 py-2 text-white hover:bg-green-700"
                >
                  End Ride
                </button>
              )}

              {currentRide.status === "ended" && !currentRide.paymentReceived && (
                <button
                  onClick={() => confirmPayment(currentRide._id)}
                  className="flex-1 rounded-lg bg-emerald-700 py-2 text-white hover:bg-emerald-700"
                >
                  Payment Received
                </button>
              )}
            </div>
          </section>
        )}

        {/* PENDING RIDES */}
        {!currentRide && pendingRides.length > 0 && (
          <section className="mt-8 rounded-2xl bg-white p-5 shadow">
            <h3 className="mb-4 text-lg font-semibold">Pending Requests</h3>

            <div className="space-y-3">
              {pendingRides.map((ride) => (
                <div key={ride._id} className="rounded-xl border p-4 hover:shadow-md transition">
                  <p><b>From:</b> {ride.pickupLocation.address}</p>
                  <p><b>To:</b> {ride.dropLocation.address}</p>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-semibold text-emerald-600">₹{ride.fare}</span>
                    <button
                      onClick={() => acceptRide(ride._id)}
                      className="rounded-lg bg-emerald-600 px-4 py-1.5 text-white hover:bg-emerald-700"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* FLOATING NEW RIDE */}
      {newRideRequest && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] rounded-2xl bg-white p-5 shadow-2xl border-t-4 border-emerald-500 animate-slideUp">
          <h3 className="mb-2 text-lg font-semibold">🚕 New Ride Request</h3>
          <p><b>From:</b> {newRideRequest.pickupLocation.address}</p>
          <p><b>To:</b> {newRideRequest.dropLocation.address}</p>
          <p className="mt-1 font-semibold text-emerald-600">
            Fare: ₹{newRideRequest.fare}
          </p>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => acceptRide(newRideRequest._id)}
              className="flex-1 rounded-lg bg-emerald-600 py-2 text-white hover:bg-emerald-700"
            >
              Accept
            </button>
            <button
              onClick={() => setNewRideRequest(null)}
              className="rounded-lg border px-4 py-2 hover:bg-neutral-100"
            >
              Ignore
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverDashboard;
