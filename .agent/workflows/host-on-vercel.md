---
description: How to host the Sawari project on Vercel
---

Follow these steps to host your Sawari project on Vercel after pushing to GitHub.

### 1. Push Code to GitHub
Ensure you have committed all changes and pushed to your GitHub repository:
```bash
git add .
git commit -m "Prepare for hosting"
git push origin main
```

### 2. Connect to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New"** > **"Project"**.
3. Import your GitHub repository.

### 3. Configure the Frontend (Vite)
Vercel will usually autodetect Vite. In the **Build & Development Settings**, ensure:
- **Framework Preset**: `Vite`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Setup Environment Variables
Before clicking "Deploy", scroll down to **Environment Variables** and add the following from your `.env.example`:
- `VITE_API_URL`: Your backend URL (e.g., `https://your-backend.onrender.com/api`)
- `VITE_SOCKET_URL`: Your backend root URL (e.g., `https://your-backend.onrender.com`)

### 5. Hosting the Backend (Express)
Since your backend is in a subfolder (`/server`), you have two options:

#### Option A: Separate Hosting (Recommended)
Host the backend on **Render.com** or **Railway.app**. 
1. Connect the same GitHub repo.
2. Set the **Root Directory** to `server`.
3. Use Build Command: `npm install` and Start Command: `npm start`.
4. Set Environment Variables: `MONGODB_URI`, `SESSION_SECRET`, `CORS_ORIGIN` (your Vercel URL).

#### Option B: Vercel Serverless Functions
To host on Vercel, you need a `vercel.json` in the root (requires minor code changes for serverless).
```json
{
  "rewrites": [{ "source": "/api/(.*)", "destination": "/api/server.js" }]
}
```
*(Note: Option A is usually more stable for real-time apps using WebSockets/Socket.io as Vercel functions have timeout limits and don't support traditional WebSockets well).*

### 6. Update CORS
Once you have your Vercel URL, go to your backend settings (on Render/Railway) and update the `CORS_ORIGIN` variable to your new Vercel URL.
