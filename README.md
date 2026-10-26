# FoodRescue — Intelligent Food Waste Reduction and Donation Platform

A full-stack **MERN (MongoDB, Express.js, ReactJS, Node.js)** web application built for academic syllabus evaluation and real-world surplus food recovery.

FoodRescue bridges the gap between commercial food establishments (hotels, banquet halls, restaurants, canteens) and hunger relief organizations (NGOs, shelters, community kitchens) through verified volunteer logistics and end-to-end chain-of-custody tracking.

---

## 1. Project Overview & Problem Statement

Surplus prepared meals and edible groceries from banquets, corporate dining, bakeries, and catered events are routinely discarded while community shelters and vulnerable families face chronic food insecurity. 

FoodRescue solves this coordination failure by providing:
1. **Donors:** Rapid listing of surplus food with hygiene specifications, use-by deadlines, and pickup protocols.
2. **NGOs:** Real-time discovery, matching, and requesting of wholesome food supplies.
3. **Volunteers:** Reliable pickup claiming, route tracking, and proof-of-delivery checkpoints.
4. **Administrators:** Comprehensive oversight, NGO charity credential verification, user management, and verified audit logging.

---

## 2. Mandatory Technology Stack

| Layer | Technology | Usage in Implementation |
| :--- | :--- | :--- |
| **Frontend Framework** | **ReactJS (Vite)** | Modular component-based SPA architecture (`frontend/src/`) |
| **Routing** | **React Router (v7)** | Client-side routing with role-protected route guards (`ProtectedRoute.jsx`) |
| **Styling & Grid** | **Bootstrap 5 + CSS3** | Responsive grid layout, modals, dropdowns, and custom glassmorphic styling system |
| **HTTP Client** | **Axios** | Interceptor-based API calls attaching JWT Bearer tokens to backend requests |
| **Visual Charts** | **Recharts** | Interactive bar charts & pie charts for real-time impact metrics |
| **Backend Runtime** | **Node.js** | Server-side JavaScript runtime environment |
| **Backend Framework** | **Express.js** | Modular RESTful API under `/api/v1` with centralized error handling |
| **Database** | **MongoDB (Local/Atlas)** | Persistent NoSQL database with genuine CRUD operations |
| **ODM** | **Mongoose** | Strictly typed schemas, lifecycle hooks, and aggregation pipelines |
| **Authentication** | **bcryptjs + JWT** | Salted password hashing (cost 10) and signed JSON Web Tokens |
| **API Testing** | **Postman** | Comprehensive JSON collection covering all endpoints and edge cases |

---

## 3. Architecture & Project Layout

```
FoodRescue/
├── backend/                        # Node.js + Express.js REST API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB Mongoose connection handler
│   │   ├── controllers/           # Business logic controllers
│   │   │   ├── adminController.js
│   │   │   ├── analyticsController.js
│   │   │   ├── authController.js
│   │   │   ├── donationController.js
│   │   │   ├── notificationController.js
│   │   │   ├── pickupController.js
│   │   │   ├── requestController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification & RBAC authorization
│   │   │   └── errorHandler.js    # Centralized error handler
│   │   ├── models/                # Mongoose database models
│   │   │   ├── Donation.js
│   │   │   ├── DonationRequest.js
│   │   │   ├── Notification.js
│   │   │   ├── Organization.js
│   │   │   ├── Pickup.js
│   │   │   ├── StatusHistory.js
│   │   │   └── User.js
│   │   ├── routes/                # Express endpoint definitions
│   │   ├── services/              # Status audit & in-app notification services
│   │   ├── validators/            # Request body input validation
│   │   ├── app.js                 # Express application configuration & CORS
│   │   ├── seed.js                # Database seeder with realistic demo accounts
│   │   └── server.js              # HTTP server entrypoint (Port 5000)
│   ├── .env                       # Backend environment configuration
│   ├── .env.example
│   └── package.json
│
├── frontend/                       # ReactJS SPA (Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js           # Pre-configured Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── common/            # Navbar, Footer, StatusBadge, StatCard, etc.
│   │   │   └── donation/          # DonationCard, DonationFilter, Timeline, Modal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # User authentication & token state
│   │   │   └── NotificationContext.jsx # In-app alert inbox state
│   │   ├── pages/                 # Home, Login, Register, Dashboards, Impact
│   │   ├── App.jsx                # Router & protected route definitions
│   │   ├── index.css              # Custom styling design system
│   │   └── main.jsx               # React DOM root entrypoint
│   ├── .env                       # Frontend environment configuration
│   ├── .env.example
│   └── package.json
│
├── docs/                           # Documentation
│   ├── architecture.md            # System diagrams, ER schema, lifecycle states
│   ├── demo-script.md             # Complete college viva demonstration script
│   └── test-cases.md              # Test matrix with expected vs actual results
│
├── postman/
│   └── FoodRescue.postman_collection.json # Ready-to-import Postman collection
│
├── .gitignore
└── README.md
```

---

## 4. Donation Lifecycle State Machine

Every food donation progresses strictly through an authenticated chain-of-custody:

$$\text{AVAILABLE} \longrightarrow \text{REQUESTED} \longrightarrow \text{ACCEPTED} \longrightarrow \text{PICKUP\_ASSIGNED} \longrightarrow \text{PICKED\_UP} \longrightarrow \text{DELIVERED} \longrightarrow \text{RECEIVED} \longrightarrow \text{COMPLETED}$$

* **AVAILABLE:** Food listed by donor; visible to all NGOs.
* **REQUESTED:** Verified NGO submits a request for the donation.
* **ACCEPTED:** Donor approves the NGO request; listing opens for volunteer pickup.
* **PICKUP_ASSIGNED:** A volunteer driver claims the transport mission.
* **PICKED_UP:** Volunteer confirms food was collected from the donor facility.
* **DELIVERED:** Volunteer confirms safe drop-off at the NGO premises.
* **RECEIVED:** NGO kitchen manager confirms receipt and inspects quality.
* **COMPLETED:** NGO records meals/people served, completing the audit cycle.
* **CANCELLED / EXPIRED:** Handled safely if withdrawn by donor or if use-by time elapses.

---

## 5. Development Demo Accounts & Credentials

The seed script (`npm run seed`) populates the database with realistic sample users and active donations across each lifecycle state:

| Role | Name / Organization | Email Address | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | System Administrator | `admin@foodrescue.org` | `Admin@123` |
| **Donor 1** | Grand Palace Hotel & Banquets | `donor@grandhotel.com` | `Donor@123` |
| **Donor 2** | Fresh Bakes Artisan Bakery | `bakery@freshbakes.com` | `Donor@123` |
| **NGO 1** | FeedHope Foundation (Verified) | `contact@feedhope.org` | `Ngo@123` |
| **NGO 2** | City Care Shelter (Pending Verification) | `shelter@citycare.org` | `Ngo@123` |
| **Volunteer 1** | Alex Rivera (Delivery Driver) | `alex.volunteer@gmail.com` | `Volunteer@123` |
| **Volunteer 2** | Sarah Chen (Delivery Driver) | `sarah.rider@gmail.com` | `Volunteer@123` |

> [!TIP]
> **1-Click Login:** The login page features convenient 1-click demo buttons that pre-fill credentials for all 4 roles to make your live viva demonstration quick and error-free!

---

## 6. Installation & Setup Instructions

### Prerequisites
1. **Node.js**: v18.0.0 or higher (`node -v`)
2. **NPM**: v9.0.0 or higher (`npm -v`)
3. **MongoDB**: v6.0 or higher installed and running locally as a service on port `27017`.

---

### Step 1: Clone or Navigate to Project
```bash
cd c:\Users\Dell\Desktop\FoodRescue
```

---

### Step 2: Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/foodrescue
JWT_SECRET=foodrescue_jwt_super_secret_key_development_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

### Step 3: Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 4: Seed Sample Database Records
```bash
cd ../backend
npm run seed
```
*This populates MongoDB with admin, donor, NGO, and volunteer accounts along with sample donations across various lifecycle stages.*

---

### Step 5: Start the Backend Server
```bash
cd backend
npm run dev
```
Backend will start and listen on **`http://localhost:5000`** with MongoDB connected.

---

### Step 6: Start the Frontend Application
In a separate terminal window:
```bash
cd frontend
npm run dev
```
Frontend will be accessible at **`http://127.0.0.1:5173`**.

---

## 7. REST API Endpoints Overview

All endpoints are organized under `/api/v1`:

### Authentication & Users
- `POST /api/v1/auth/register` — Register Donor, NGO, or Volunteer
- `POST /api/v1/auth/login` — Sign in and receive JWT token
- `GET /api/v1/auth/me` — Retrieve authenticated user profile
- `GET /api/v1/users` — List platform users (Admin only)
- `PATCH /api/v1/users/:id/status` — Toggle user account status (Active / Suspended)

### Donations
- `POST /api/v1/donations` — Create a new surplus food listing (Donor only)
- `GET /api/v1/donations` — Browse and filter donations (Public / Authenticated)
- `GET /api/v1/donations/:id` — Retrieve donation details with full audit timeline
- `PATCH /api/v1/donations/:id` — Edit an eligible available donation (Donor only)
- `POST /api/v1/donations/:id/cancel` — Cancel an eligible listing (Donor/Admin)

### NGO Requests & Distribution
- `POST /api/v1/donations/:id/request` — Request an available donation (NGO only)
- `GET /api/v1/requests/my` — View user's submitted or received requests
- `POST /api/v1/requests/:id/accept` — Accept an incoming request (Donor only)
- `PATCH /api/v1/requests/:id/cancel` — Cancel a pending request (NGO only)
- `POST /api/v1/donations/:id/receive` — Confirm food delivery receipt (NGO only)
- `POST /api/v1/donations/:id/distribute` — Record meals served & impact (NGO only)

### Volunteer Logistics
- `POST /api/v1/pickups` — Claim an accepted pickup task (Volunteer only)
- `GET /api/v1/pickups/available` — View accepted donations awaiting drivers
- `GET /api/v1/pickups/my` — View volunteer's active and completed missions
- `PATCH /api/v1/pickups/:id/status` — Advance checkpoint to `PICKED_UP` or `DELIVERED`

### Admin Governance & Notifications
- `GET /api/v1/admin/overview` — Platform summary statistics and metrics
- `GET /api/v1/organizations` — List all registered NGO organizations
- `PATCH /api/v1/admin/organizations/:id/verify` — Approve or reject NGO verification
- `GET /api/v1/notifications` — Fetch user's in-app notification alerts
- `PATCH /api/v1/notifications/:id/read` — Mark notifications as read
- `GET /api/v1/analytics/overview` — Aggregated real-time platform impact statistics

---

## 8. Postman Testing Guide

1. Open Postman and click **Import**.
2. Select `postman/FoodRescue.postman_collection.json`.
3. In collection variables, set `baseUrl` to `http://localhost:5000/api/v1`.
4. Execute `Login - Donor`, copy the returned JWT `token` into the collection variable `authToken`.
5. Execute requests sequentially across Authentication, Donations, Requests, Pickups, and Governance.

---

## 9. Known Limitations & Future Roadmap

* **Geolocation Routing:** Current implementation utilizes street address strings with simulated GPS checkpoint logs. Future enhancement: Leaflet / OpenStreetMap visual route optimization.
* **AI Image Quality Analysis:** Current implementation allows direct food image URLs with manual condition checks. Future enhancement: Gemini Vision API integration for real-time visual meal freshness validation.
* **Push Notifications:** Currently implemented using MongoDB persistent in-app notifications. Future enhancement: WebPush / SMS delivery driver alerts.

---

## 10. Production Deployment on Render

FoodRescue is pre-configured for automated 1-click deployment on [Render](https://render.com) using the included [`render.yaml`](file:///c:/Users/Dell/Desktop/FoodRescue/render.yaml) blueprint:

- **Backend:** Render Web Service (Node.js runtime, port dynamically configured, CORS whitelist)
- **Frontend:** Render Static Site (ReactJS Vite SPA, rewrite rules for SPA client routing)
- **Database:** Free MongoDB Atlas M0 cluster

For step-by-step instructions with environment variable tables and seed account guides, see the [Render Deployment Guide](file:///c:/Users/Dell/Desktop/FoodRescue/docs/render-deployment.md).

