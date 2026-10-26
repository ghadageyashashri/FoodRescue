# FoodRescue — Render Deployment Guide

This guide walks you through deploying the **FoodRescue** full-stack MERN application to [Render](https://render.com) with production-ready configuration.

---

## Architecture on Render

```
                ┌────────────────────────────────────────┐
                │        Users / Browsers                │
                └──────────────────┬─────────────────────┘
                                   │
         ┌─────────────────────────┴────────────────────────┐
         │                                                  │
         ▼                                                  ▼
┌───────────────────────────────┐          ┌───────────────────────────────┐
│       Frontend (Static Site)  │          │      Backend (Web Service)    │
│  foodrescue-frontend.onrender │          │  foodrescue-backend.onrender  │
│  - ReactJS Vite SPA           │          │  - Express.js REST API        │
│  - Global CDN & Auto HTTPS    │───API────│  - Node.js Runtime            │
│  - Client Routing (/* Rewrite)│          │  - Port 5000 / Auto PORT      │
└───────────────────────────────┘          └───────────────┬───────────────┘
                                                           │
                                                           ▼
                                           ┌───────────────────────────────┐
                                           │     MongoDB Atlas (Cloud M0)  │
                                           │  - Free 512MB Cluster         │
                                           │  - Network: 0.0.0.0/0 Allowed │
                                           └───────────────────────────────┘
```

---

## Step 1: Set Up Free MongoDB Atlas Database

Render does not host free MongoDB instances, so MongoDB Atlas (official cloud database) is used:

1. Sign up / Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new **M0 (Free)** cluster (choose any cloud provider/region close to your users).
3. Under **Security > Database Access**:
   - Click **Add New Database User**.
   - Create a user (e.g. `foodrescue_admin`) and a secure password. Make sure the role is **Read and write to any database**.
4. Under **Security > Network Access**:
   - Click **Add IP Address**.
   - Select **Allow Access From Anywhere** (`0.0.0.0/0`).
   - *Note:* Render uses dynamic outgoing IPs, so allowing `0.0.0.0/0` is required.
5. Under **Deployment > Database**:
   - Click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy your connection string. It will look like:
     ```text
     mongodb+srv://foodrescue_admin:<password>@cluster0.xxxxx.mongodb.net/foodrescue?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual database user password.

---

## Step 2: Push Your Code to GitHub

Render builds your application by syncing with your Git repository:

1. Initialize git and commit your files (if not already done):
   ```bash
   git init
   git add .
   git commit -m "feat: prepare production deployment for Render"
   ```
2. Create a new repository on [GitHub](https://github.com/new).
3. Connect and push your local repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/FoodRescue.git
   git push -u origin main
   ```

---

## Step 3: Deploy on Render

Choose either **Method A** (Fastest: 1-Click Blueprint) or **Method B** (Manual Dashboard Configuration).

### Method A: 1-Click Blueprint Deployment (Recommended)

This repository includes a pre-configured `render.yaml` blueprint.

1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** in the top right, then select **Blueprint**.
3. Connect your GitHub account and select your `FoodRescue` repository.
4. Render will detect `render.yaml` and display the two services to create:
   - `foodrescue-backend` (Web Service)
   - `foodrescue-frontend` (Static Site)
5. Fill in the required environment variable when prompted:
   - `MONGODB_URI`: Paste your MongoDB Atlas connection string from Step 1.
6. Click **Apply**.
7. Render will automatically build both the backend and frontend!

---

### Method B: Manual Dashboard Configuration

If you prefer configuring the services manually:

#### 1. Deploy the Backend (Web Service)
1. In Render Dashboard, click **New + > Web Service**.
2. Select your `FoodRescue` repository.
3. Configure the settings:
   - **Name:** `foodrescue-backend`
   - **Region:** Any (e.g., Oregon or Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. Expand **Environment Variables** and add:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: `mongodb+srv://...` (your Atlas URI)
   - `JWT_SECRET`: (Click *Generate* or enter a random string)
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: `https://foodrescue-frontend.onrender.com` (your frontend Render URL)
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (e.g. `https://foodrescue-backend.onrender.com`).

#### 2. Deploy the Frontend (Static Site)
1. In Render Dashboard, click **New + > Static Site**.
2. Select your `FoodRescue` repository.
3. Configure the settings:
   - **Name:** `foodrescue-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Expand **Environment Variables** and add:
   - `VITE_API_BASE_URL`: `https://foodrescue-backend.onrender.com/api/v1` (replace with your backend URL)
5. Go to the **Redirects / Rewrites** tab:
   - Click **Add Rule**
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - *(Crucial: This ensures React Router works on page refreshes without 404 errors)*
6. Click **Create Static Site**.

---

## Step 4: Seed Initial Demo Data

Once your backend is running and connected to MongoDB Atlas, populate it with realistic seed data:

### Option 1: Via Render Backend Shell (Easiest)
1. Go to your `foodrescue-backend` service in the Render Dashboard.
2. Click on the **Shell** tab on the left.
3. Run:
   ```bash
   npm run seed
   ```
4. You will see confirmation logs with created accounts and donations.

### Option 2: From Local Machine
1. Open your terminal in the `backend/` directory.
2. Run with your Atlas URI:
   ```bash
   MONGODB_URI="your-atlas-uri-here" npm run seed
   ```

---

## Seed Accounts for Testing

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@foodrescue.org` | `Admin@123` |
| **Donor** | `donor@grandhotel.com` | `Donor@123` |
| **Donor** | `bakery@freshbakes.com` | `Donor@123` |
| **NGO** | `ngo@hopefeeding.org` | `Ngo@123` |
| **NGO** | `director@carekitchen.org` | `Ngo@123` |
| **Volunteer** | `volunteer@foodrescue.org` | `Volunteer@123` |
| **Volunteer** | `rider@citylogistics.org` | `Volunteer@123` |

---

## Troubleshooting & FAQ

### 1. Backend takes 45-50 seconds to respond on first request
- **Cause:** Render's free tier spins down inactive web services after 15 minutes of inactivity.
- **Solution:** The first request will wake up the container. Subsequent requests will be fast. For academic demos, open the app 1 minute before your presentation.

### 2. MongooseServerSelectionError / Database connection fails
- **Cause:** MongoDB Atlas IP whitelist is blocking Render's outgoing IPs.
- **Solution:** Go to **MongoDB Atlas > Network Access**, ensure `0.0.0.0/0` is added to the IP Access List.

### 3. Page refresh shows "Page Not Found" (404) on frontend
- **Cause:** React Router uses client-side routing.
- **Solution:** In Render Static Site settings, add a rewrite rule from `/*` to `/index.html`. (If using `render.yaml`, this is already configured).

### 4. CORS error in browser console
- **Cause:** Frontend domain does not match backend `CLIENT_URL`.
- **Solution:** The backend automatically authorizes any `.onrender.com` domain, but make sure your `CLIENT_URL` environment variable matches your frontend URL.
