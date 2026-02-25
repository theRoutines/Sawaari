// import { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import mapboxgl from "mapbox-gl";
// import LocationInput from "../components/LocationInput";
// import api from "../utils/api";
// import "mapbox-gl/dist/mapbox-gl.css";

// mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// export default function TripBooking() {
//   const navigate = useNavigate();
//   const mapRef = useRef(null);
//   const map = useRef(null);

//   const pickupMarker = useRef(null);
//   const dropMarker = useRef(null);

//   const [pickup, setPickup] = useState(null);
//   const [drop, setDrop] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [duration, setDuration] = useState(null);
//   const [vehicleType, setVehicleType] = useState("economy");

//   /* =====================
//      MAP INIT
//   ====================== */
//   useEffect(() => {
//     map.current = new mapboxgl.Map({
//       container: mapRef.current,
//       style: "mapbox://styles/mapbox/streets-v12",
//       center: [75.7739, 31.224],
//       zoom: 12
//     });

//     map.current.addControl(new mapboxgl.NavigationControl());

//     return () => map.current.remove();
//   }, []);

//   /* =====================
//      MARKERS
//   ====================== */
//   useEffect(() => {
//     if (!pickup || !map.current) return;
//     pickupMarker.current?.remove();
//     pickupMarker.current = new mapboxgl.Marker({ color: "#22c55e" })
//       .setLngLat(pickup.center)
//       .addTo(map.current);
//     map.current.flyTo({ center: pickup.center, zoom: 14 });
//   }, [pickup]);

//   useEffect(() => {
//   if (!drop || !map.current) return;

//   dropMarker.current?.remove();
//   dropMarker.current = new mapboxgl.Marker({ color: "#ef4444" })
//     .setLngLat(drop.center)
//     .addTo(map.current);

//   map.current.flyTo({
//     center: drop.center,
//     zoom: 15,
//     speed: 1.4,
//     curve: 1.4,
//     essential: true
//   });
// }, [drop]);


//   /* =====================
//      ROUTE
//   ====================== */
//   useEffect(() => {
//     if (pickup && drop) drawRoute(pickup.center, drop.center);
//   }, [pickup, drop]);

//   const drawRoute = async (start, end) => {
//     const res = await fetch(
//       `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
//     );

//     const data = await res.json();
//     const route = data.routes[0];

//     setDistance((route.distance / 1000).toFixed(1));
//     setDuration(Math.ceil(route.duration / 60));

//     if (map.current.getSource("route")) {
//       map.current.removeLayer("route");
//       map.current.removeSource("route");
//     }

//     map.current.addSource("route", {
//       type: "geojson",
//       data: { type: "Feature", geometry: route.geometry }
//     });

//     map.current.addLayer({
//       id: "route",
//       type: "line",
//       source: "route",
//       paint: { "line-color": "#000", "line-width": 5 }
//     });
//   };

//   const handleSearchRides = () => {
//     if (!pickup || !drop) return;
    
//     navigate('/available-drivers', {
//       state: {
//         pickup,
//         drop,
//         distance,
//         duration,
//         vehicleType
//       }
//     });
//   };

//   return (
//     <div className="flex h-screen flex-col">
//       {/* ================= NAVBAR ================= */}
//       <header className="flex items-center justify-between bg-black px-6 py-3 text-white">
//         {/* LEFT */}
//         <div className="flex items-center gap-3">
//           <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black font-bold">
//             S
//           </div>
//           <span className="text-lg font-semibold tracking-wide">
//             SAWAARI
//           </span>
//         </div>

//         {/* RIGHT */}
//         <div className="flex gap-3">
//           <button
//             onClick={() => navigate("/")}
//             className="rounded-full border border-white/30 px-4 py-1.5 text-sm hover:bg-white hover:text-black transition"
//           >
//             Home
//           </button>
//           <button
//             onClick={() => navigate("/user/dashboard")}
//             className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black hover:bg-neutral-200 transition"
//           >
//             Dashboard
//           </button>
//         </div>
//       </header>

//       {/* ================= CONTENT ================= */}
//       <div className="flex flex-1">
//         {/* LEFT PANEL */}
//         <div className="w-[420px] border-r bg-white p-6">
//           <h1 className="mb-6 text-2xl font-semibold">Request a ride</h1>

//           <div className="mb-4">
//             <LocationInput
//               placeholder="Pickup location"
//               onSelect={setPickup}
//             />
//           </div>

//           <div className="mb-4">
//             <LocationInput
//               placeholder="Drop location"
//               onSelect={setDrop}
//             />
//           </div>

//           {distance && (
//             <div className="mb-4 rounded-lg bg-neutral-100 p-4 text-sm">
//               <p>Distance: <b>{distance} km</b></p>
//               <p>ETA: <b>{duration} mins</b></p>
//             </div>
//           )}

//           <select
//             value={vehicleType}
//             onChange={(e) => setVehicleType(e.target.value)}
//             className="mb-4 w-full rounded-lg border bg-neutral-50 p-3"
//           >
//             <option value="economy">Uber Go</option>
//             <option value="comfort">Comfort</option>
//             <option value="premium">Premier</option>
//             <option value="xl">XL</option>
//           </select>

//           <button
//             onClick={handleSearchRides}
//             disabled={!pickup || !drop}
//             className="w-full rounded-lg bg-black py-3 text-white disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-neutral-900 transition"
//           >
//             Search rides
//           </button>
//         </div>

//         {/* MAP */}
//         <div ref={mapRef} className="flex-1" />
//       </div>
//     </div>
//   );
// }




import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import LocationInput from "../components/LocationInput";
import api from "../utils/api";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  MapPinIcon,
  FlagIcon,
  TruckIcon,
  ClockIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function TripBooking() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const map = useRef(null);

  const pickupMarker = useRef(null);
  const dropMarker = useRef(null);

  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [vehicleType, setVehicleType] = useState("economy");

  /* =====================
     MAP INIT
  ====================== */
  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [75.7739, 31.224],
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    return () => map.current.remove();
  }, []);

  /* =====================
     MARKERS
  ====================== */
  useEffect(() => {
    if (!pickup || !map.current) return;

    pickupMarker.current?.remove();
    pickupMarker.current = new mapboxgl.Marker({ color: "#22c55e" })
      .setLngLat(pickup.center)
      .addTo(map.current);

    map.current.flyTo({ center: pickup.center, zoom: 14 });
  }, [pickup]);

  useEffect(() => {
    if (!drop || !map.current) return;

    dropMarker.current?.remove();
    dropMarker.current = new mapboxgl.Marker({ color: "#ef4444" })
      .setLngLat(drop.center)
      .addTo(map.current);

    map.current.flyTo({
      center: drop.center,
      zoom: 15,
      speed: 1.4,
      curve: 1.4,
      essential: true,
    });
  }, [drop]);

  /* =====================
     ROUTE
  ====================== */
  useEffect(() => {
    if (pickup && drop) drawRoute(pickup.center, drop.center);
  }, [pickup, drop]);

  const drawRoute = async (start, end) => {
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
    );

    const data = await res.json();
    const route = data.routes[0];

    setDistance((route.distance / 1000).toFixed(1));
    setDuration(Math.ceil(route.duration / 60));

    if (map.current.getSource("route")) {
      map.current.removeLayer("route");
      map.current.removeSource("route");
    }

    map.current.addSource("route", {
      type: "geojson",
      data: { type: "Feature", geometry: route.geometry },
    });

    map.current.addLayer({
      id: "route",
      type: "line",
      source: "route",
      paint: {
        "line-color": "#000",
        "line-width": 5,
      },
    });
  };

  const handleSearchRides = () => {
    if (!pickup || !drop) return;

    navigate("/available-drivers", {
      state: {
        pickup,
        drop,
        distance,
        duration,
        vehicleType,
      },
    });
  };

  return (
    <div className="flex h-screen flex-col">
      {/* ================= NAVBAR ================= */}
      <header className="flex items-center justify-between bg-black px-6 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black font-bold">
            S
          </div>
          <span className="text-lg font-semibold tracking-wide">SAWAARI</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/")}
            className="rounded-full border border-white/30 px-4 py-1.5 text-sm hover:bg-white hover:text-black transition"
          >
            Home
          </button>
          <button
            onClick={() => navigate("/user/dashboard")}
            className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black hover:bg-neutral-200 transition"
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <div className="flex flex-1">
        {/* LEFT PANEL */}
        <div className="w-[420px] border-r bg-white p-6 flex flex-col">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Request a ride
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Choose pickup, drop & vehicle
            </p>
          </div>

          {/* Pickup */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Pickup location
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <LocationInput
                placeholder="Enter pickup location"
                onSelect={setPickup}
                className="pl-10"
              />
            </div>
          </div>

          {/* Drop */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Drop location
            </label>
            <div className="relative">
              <FlagIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <LocationInput
                placeholder="Enter drop location"
                onSelect={setDrop}
                className="pl-10"
              />
            </div>
          </div>

          {/* Distance / ETA */}
          {distance && (
            <div className="mb-4 rounded-xl border bg-neutral-50 p-4 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <ArrowsRightLeftIcon className="h-5 w-5" />
                  Distance
                </div>
                <span className="font-semibold text-gray-900">
                  {distance} km
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <ClockIcon className="h-5 w-5" />
                  ETA
                </div>
                <span className="font-semibold text-gray-900">
                  {duration} mins
                </span>
              </div>
            </div>
          )}

          {/* Vehicle */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Vehicle type
            </label>
            <div className="relative">
              <TruckIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full rounded-lg border bg-neutral-50 p-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="economy">Uber Go</option>
                <option value="comfort">Comfort</option>
                <option value="premium">Premier</option>
                <option value="xl">XL</option>
              </select>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleSearchRides}
            disabled={!pickup || !drop}
            className="mt-auto w-full rounded-xl bg-black py-3 text-sm font-semibold text-white mb-60
                       hover:bg-neutral-900 transition
                       disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Search rides
          </button>
        </div>

        {/* MAP */}
        <div ref={mapRef} className="flex-1" />
      </div>
    </div>
  );
}
