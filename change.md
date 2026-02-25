# Changes Made for Hosting Readiness and UI Fixes

## 1. Hosting Readiness (Security & Configuration)

- **Environment-based Backend Configuration**:
    - `server/server.js`: Replaced hardcoded session secret `'sawari-secret'` with `process.env.SESSION_SECRET`.
    - `server/server.js`: Replaced hardcoded CORS origin `'http://localhost:5173'` with `process.env.CORS_ORIGIN`.
    - `server/server.js`: Replaced hardcoded port `5000` with `process.env.PORT`.
- **Environment-based Frontend Configuration**:
    - `src/utils/api.js`: Replaced hardcoded `'http://localhost:5000/api'` with `import.meta.env.VITE_API_URL`.
    - `src/contexts/SocketContext.jsx`: Replaced hardcoded `'http://localhost:5000'` with `import.meta.env.VITE_SOCKET_URL`.
- **Mapbox Integration**:
    - `src/components/LocationInput.jsx`: Replaced hardcoded Mapbox token with `import.meta.env.VITE_MAPBOX_TOKEN`.
    - `src/pages/TripBooking.jsx`: Replaced hardcoded Mapbox token with `import.meta.env.VITE_MAPBOX_TOKEN`.
- **Git Safety**:
    - Updated `.gitignore` to ensure `.env` and `server/.env` are properly excluded.
    - Created `.env.example` and `server/.env.example` to provide templates for hosting platforms.

## 2. UI Alignment and Layout Fixes

- **Landing Page Header (`src/pages/LandingPage.jsx`)**:
    - Changed `nav` classes from `ml-105 mt-5 max-w-3xl` to `mx-auto mt-5 max-w-5xl`.
    - **Why**: `ml-105` was pushing the navbar 105 units from the left, which only looks centered on a specific screen size. `mx-auto` centers it automatically on any screen.
    - Removed `mr-120` from the logo container.
    - **Why**: `mr-120` was creating a massive gap to the right of the logo, breaking the layout. Used standard `justify-between` and `gap-6` instead.
- **Hero Section (`src/pages/LandingPage.jsx`)**:
    - Removed `ml-20` from the video container.
    - **Why**: The hardcoded left margin was causing the video to overflow or be misaligned. Used standard responsive flex layout.
