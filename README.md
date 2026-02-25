# Sawari - Uber Clone

A full-stack MERN (MongoDB, Express, React, Node.js) application that replicates Uber's core functionality. This project allows users to book rides and drivers to accept and complete rides.

## Features

### User Features
- User registration and login
- Trip booking with pickup and dropoff location selection
- Interactive map with route visualization using MapboxGL
- Driver selection based on vehicle type
- Real-time ride status updates
- User dashboard showing ride history and total spending

### Driver Features
- Driver registration with vehicle details
- View and accept ride requests
- Start and complete rides
- Driver dashboard showing completed rides and earnings
- Real-time notifications for new ride requests

## Tech Stack

### Frontend
- React 19
- React Router DOM
- MapboxGL for maps
- Axios for API calls
- CSS3 for styling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Express Session for authentication
- Bcrypt for password hashing
- Express Validator for input validation

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd sawari
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd server
npm install
cd ..
```

### 4. Set up Environment Variables

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sawari
```

If using MongoDB Atlas, replace the URI with your Atlas connection string.

### 5. Start MongoDB

Make sure MongoDB is running on your system:
```bash
# On Windows
mongod

# On macOS/Linux
sudo systemctl start mongod
```

## Running the Application

### Start the Backend Server

Open a terminal and run:
```bash
cd server
npm start
```

For development with auto-reload:
```bash
cd server
npm run dev
```

The backend server will run on `http://localhost:5000`

### Start the Frontend Development Server

Open another terminal and run:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Project Structure

```
sawari/
├── server/                 # Backend code
│   ├── models/            # MongoDB models
│   │   ├── User.js
│   │   ├── Driver.js
│   │   └── Ride.js
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   ├── rides.js
│   │   └── dashboard.js
│   ├── server.js          # Express server setup
│   └── package.json
├── src/                   # Frontend code
│   ├── pages/            # React pages
│   │   ├── Login.jsx
│   │   ├── UserSignup.jsx
│   │   ├── DriverSignup.jsx
│   │   ├── TripBooking.jsx
│   │   ├── UserDashboard.jsx
│   │   └── DriverDashboard.jsx
│   ├── utils/            # Utility functions
│   │   └── api.js
│   ├── App.jsx           # Main app component
│   └── main.jsx         # Entry point
└── package.json
```

## Database Schema

### User Collection
- name (String, required)
- email (String, required, unique)
- password (String, required, hashed)
- phone (String, required)
- userType (String, enum: 'user' or 'driver')

### Driver Collection
- userId (ObjectId, reference to User)
- vehicleType (String, enum: 'economy', 'comfort', 'premium', 'xl', 'suv')
- vehicleModel (String)
- vehicleNumber (String)
- licenseNumber (String)
- isAvailable (Boolean)
- totalRides (Number)
- totalEarnings (Number)

### Ride Collection
- userId (ObjectId, reference to User)
- driverId (ObjectId, reference to Driver)
- pickupLocation (Object with address and coordinates)
- dropLocation (Object with address and coordinates)
- vehicleType (String)
- status (String, enum: 'pending', 'accepted', 'started', 'completed', 'cancelled')
- fare (Number)
- distance (Number, in kilometers)
- duration (Number, in minutes)

## API Endpoints

### Authentication
- `POST /api/auth/signup/user` - User registration
- `POST /api/auth/signup/driver` - Driver registration
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Rides
- `POST /api/rides/request` - Create ride request
- `GET /api/rides/available-drivers` - Get available drivers
- `POST /api/rides/:rideId/accept` - Accept ride (driver)
- `POST /api/rides/:rideId/start` - Start ride
- `POST /api/rides/:rideId/complete` - Complete ride
- `GET /api/rides/user/current` - Get current ride (user)
- `GET /api/rides/driver/current` - Get current ride (driver)
- `GET /api/rides/driver/pending` - Get pending rides (driver)

### Dashboard
- `GET /api/dashboard/user` - User dashboard data
- `GET /api/dashboard/driver` - Driver dashboard data

## Usage Guide

### For Users

1. **Sign Up**: Create a user account at `/signup/user`
2. **Login**: Sign in with your credentials
3. **Book a Ride**: 
   - Enter pickup and dropoff locations
   - Select vehicle type
   - Click "Search" to see available drivers
   - Click "Request Ride" on a driver
4. **Track Ride**: Monitor ride status (pending → accepted → started → completed)
5. **View Dashboard**: Check ride history and total spending

### For Drivers

1. **Sign Up**: Create a driver account at `/signup/driver` with vehicle details
2. **Login**: Sign in with your credentials
3. **Accept Rides**: View pending ride requests and accept them
4. **Manage Rides**: Start and complete rides
5. **View Dashboard**: Check completed rides and earnings

## Mapbox Token

The Mapbox token is already configured in the code. If you need to use your own token, update it in `src/pages/TripBooking.jsx`.

## Notes

- This project uses session-based authentication (no JWT)
- Real-time updates are implemented using polling (3-second intervals)
- The fare calculation is based on distance and vehicle type
- All passwords are hashed using bcrypt before storing

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check the connection string in `.env`
- Verify MongoDB port (default: 27017)

### CORS Issues
- Ensure backend server is running
- Check CORS configuration in `server/server.js`

### Map Not Loading
- Verify Mapbox token is valid
- Check browser console for errors

## Future Enhancements

- WebSocket integration for real-time updates
- Payment gateway integration
- Rating system
- Push notifications
- Advanced route optimization
- Multiple stop support

## License

This project is for educational purposes.
