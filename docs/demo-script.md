# FoodRescue — College Project Viva Demonstration Script

Use this step-by-step script to demonstrate the complete, functional FoodRescue application to your examiner or evaluation panel.

---

## Pre-Demonstration Checklist
1. Verify MongoDB is running locally (`net start MongoDB` or service status).
2. Start Backend: `cd backend && npm run dev` (Runs on `http://localhost:5000`).
3. Start Frontend: `cd frontend && npm run dev` (Runs on `http://localhost:5173`).
4. Ensure the database was seeded: `cd backend && npm run seed`.

---

## Demonstration Workflow: 8 Clear Steps

### Step 1: Landing Page & Public Transparency
1. Open browser at `http://localhost:5173/`.
2. **Explain to Examiner:**
   - *"FoodRescue is a full-stack MERN platform built to reduce surplus food waste by connecting food establishments directly with verified charities and volunteer logistics."*
   - Point out the **Live Database Impact Counters** (Total donations rescued, meals distributed, active NGOs).
   - Point out the **How It Works** section and **Recent Available Food Listings**.
3. Click **"Live Impact"** in the navigation bar to showcase the interactive **Recharts visualizations** (Rescued food by category and lifecycle pipeline distribution) calculated directly from MongoDB aggregations.

---

### Step 2: Donor Experience — Creating Surplus Listing
1. Click **"Sign In"** in the top navigation.
2. Click the **"🏢 Donor (Hotel)"** 1-Click Demo button (fills `donor@grandhotel.com` / `Donor@123`).
3. Click **"Sign In"**. You are redirected to the **Donor Dashboard**.
4. **Showcase Donor Dashboard:**
   - Metric summary cards (Total Listed, Available Now, In Transit, Rescued & Delivered).
   - Filterable list of previous donations.
5. Click **"Create Food Listing"** button:
   - Food Title: `Fresh Veg Biryani & Mint Raita (30 Servings)`
   - Description: `Corporate seminar excess. Hygienically held in food-grade thermoboxes.`
   - Category: `Cooked Meals`
   - Veg toggle: `🥬 Pure Vegetarian`
   - Quantity: `30` | Unit: `Meals`
   - Storage: `Hot Holding (60°C+)`
   - Pickup Address: `Grand Palace Banquet Kitchen Portico`
6. Click **"Submit Food Listing"**.
7. The listing appears instantly in status **`AVAILABLE`**. Click on it to show the **Lifecycle Audit Timeline** showing `INITIAL -> AVAILABLE` recorded with the donor's ID and timestamp.
8. Sign out from the user menu in the top right.

---

### Step 3: NGO Relief Experience — Requesting Food Match
1. Go to **Sign In** and click the **"🤝 NGO (FeedHope)"** 1-Click Demo button (`contact@feedhope.org` / `Ngo@123`).
2. Point out the **"Verified Organization"** badge on the NGO portal.
3. In the **"Browse Available Food"** tab, locate the newly created listing `Fresh Veg Biryani & Mint Raita`.
4. Click **"Request This Donation"**:
   - Quantity: `30`
   - Message: `Urgent need for evening community shelter distribution.`
   - Click **"Confirm Request"**.
5. Switch to **"My Food Requests"** tab to see the pending request.
6. Check the **Notification Bell** in the navbar to show real-time alerts. Sign out.

---

### Step 4: Donor Accepts the NGO Match
1. Log back in as **Donor** (`donor@grandhotel.com`).
2. Notice the notification badge: *"New Donation Request from FeedHope Community Foundation"*.
3. Open the donation details or click the notification.
4. Under **"Incoming NGO Requests"**, click **"Accept Request"**.
5. The status advances to **`ACCEPTED`**.
6. Show the **Lifecycle Audit Timeline**: it records `REQUESTED -> ACCEPTED` with actor details! Sign out.

---

### Step 5: Volunteer Logistics — Claiming & Transporting Food
1. Log in as **Volunteer** using the **"🚚 Volunteer (Driver)"** button (`alex.volunteer@gmail.com` / `Volunteer@123`).
2. In the **"Available Deliveries"** tab, see the accepted biryani listing awaiting a driver.
3. Click **"Accept Task"**.
4. The system updates the status to **`PICKUP_ASSIGNED`** and moves the task to **"My Active Tasks"**.
5. Show the route coordinates:
   - Point 1: Donor pickup address.
   - Point 2: NGO destination facility.
6. Click **"Confirm Food Picked Up"** -> Enter note: *"Loaded into vehicle in thermobox."* -> Status updates to **`PICKED_UP`**.
7. Click **"Confirm Delivered to NGO"** -> Enter note: *"Handed over at FeedHope kitchen."* -> Status updates to **`DELIVERED`**. Sign out.

---

### Step 6: NGO Confirms Receipt & Records Impact
1. Log in as **NGO** (`contact@feedhope.org`).
2. Navigate to **"Active Deliveries & Impact"** tab.
3. Locate the delivered donation. Click **"Confirm Receipt"**. Status changes to **`RECEIVED`**.
4. Click **"Record Distribution"**:
   - Number of People Served: `30`
   - Note: `Served 30 families at our dinner relief counter.`
   - Click **"Save & Mark Completed"**.
5. Status changes to **`COMPLETED`**! The rescue mission is 100% fulfilled.

---

### Step 7: Administrator Governance & NGO Verification
1. Log in as **Admin** using the **"👑 Admin"** button (`admin@foodrescue.org` / `Admin@123`).
2. **Showcase Admin Dashboard:**
   - Platform metrics: Total Users, Total Donations, Active Rescues, Pending Verifications.
   - **NGO Verifications Tab:** Review "City Care Night Shelter" (Pending). Click **"Approve"** to verify the charity.
   - **User Directory Tab:** Demonstrate role oversight and account status toggle.
   - **Live Activity Audit:** Show the immutable trail of all actions just executed!

---

### Step 8: Postman API Demonstration (Optional / If Examiner Asks)
1. Open Postman and import `postman/FoodRescue.postman_collection.json`.
2. Demonstrate `POST /api/v1/auth/login` and `GET /api/v1/analytics/overview`.
3. Explain error handling: invalid token, duplicate requests, or unauthorized role returns structured HTTP status codes.
