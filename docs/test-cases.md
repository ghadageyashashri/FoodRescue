# FoodRescue — Comprehensive Test Cases & Verification Report

This document records the test cases designed and verified for the FoodRescue MERN application.

---

## 1. Authentication & Authorization Test Cases

| Test ID | Module | Scenario | Input / Action | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-AUTH-01** | Auth | User Registration with Valid Data | Name, valid email, 6+ char password, phone, role | 201 Created; JWT token returned; user persisted in MongoDB | **PASSED** |
| **TC-AUTH-02** | Auth | Duplicate Email Registration | Existing email address | 400 Bad Request: "An account with this email address already exists" | **PASSED** |
| **TC-AUTH-03** | Auth | Password Hashing Verification | Inspect database record for registered user | Password stored as bcrypt hash; plaintext never persisted | **PASSED** |
| **TC-AUTH-04** | Auth | Public Admin Registration Attempt | Registration payload with `role: "admin"` | Role forced to `"donor"`; prevents unauthorized admin creation | **PASSED** |
| **TC-AUTH-05** | Auth | Valid User Login | Correct email and password | 200 OK; JWT token returned; role-based profile attached | **PASSED** |
| **TC-AUTH-06** | Auth | Invalid Password | Correct email, wrong password | 401 Unauthorized: "Invalid email or password" | **PASSED** |
| **TC-AUTH-07** | Auth | Suspended User Access | Suspended account logs in | 403 Forbidden: "Your account has been suspended" | **PASSED** |
| **TC-AUTH-08** | RBAC | Unauthorized Endpoint Access | Volunteer calling Admin `/admin/overview` | 403 Forbidden with clear role restriction message | **PASSED** |

---

## 2. Food Donation CRUD & Validation Test Cases

| Test ID | Module | Scenario | Input / Action | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-DON-01** | Donation | Create Valid Food Listing | Complete fields, positive quantity, valid use-by date | 201 Created; status set to `AVAILABLE`; StatusHistory logged | **PASSED** |
| **TC-DON-02** | Donation | Missing Required Field | Empty `foodName` or empty `pickupAddress` | 400 Bad Request with specific validation error message | **PASSED** |
| **TC-DON-03** | Donation | Invalid Expiration Date | `useByDate` earlier than `preparationDate` | 400 Bad Request: "Use-by date must be after preparation date" | **PASSED** |
| **TC-DON-04** | Donation | Edit Available Donation | Donor modifies quantity of AVAILABLE donation | 200 OK; donation updated; StatusHistory logged | **PASSED** |
| **TC-DON-05** | Donation | Edit In-Transit Donation | Attempt to edit donation in `PICKED_UP` state | 400 Bad Request: Only `AVAILABLE` donations can be edited | **PASSED** |
| **TC-DON-06** | Donation | Cancel Eligible Donation | Donor cancels AVAILABLE donation | 200 OK; status updated to `CANCELLED` | **PASSED** |
| **TC-DON-07** | Donation | Auto-Expiry Handling | Donation with past `useByDate` queried | Status marked as `EXPIRED`; prevents subsequent NGO requests | **PASSED** |

---

## 3. NGO Request & Lifecycle Workflow Test Cases

| Test ID | Module | Scenario | Input / Action | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-REQ-01** | Request | NGO Requests Available Food | Verified NGO submits request with quantity | 201 Created; donation status becomes `REQUESTED` | **PASSED** |
| **TC-REQ-02** | Request | Duplicate Request Prevention | NGO submits second request for same item | 400 Bad Request: "You have already submitted a request" | **PASSED** |
| **TC-REQ-03** | Request | Request Expired Food | NGO requests donation whose `useByDate` passed | 400 Bad Request: "This donation has expired" | **PASSED** |
| **TC-REQ-04** | Request | Donor Accepts NGO Request | Donor accepts request from dashboard | 200 OK; donation status becomes `ACCEPTED` | **PASSED** |
| **TC-REQ-05** | Request | NGO Cancels Request | NGO cancels request while PENDING | 200 OK; donation reverts back to `AVAILABLE` | **PASSED** |

---

## 4. Volunteer Logistics & Delivery Checkpoints

| Test ID | Module | Scenario | Input / Action | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-VOL-01** | Pickup | Volunteer Claims Available Task | Volunteer clicks Accept on ACCEPTED donation | 201 Created; donation status becomes `PICKUP_ASSIGNED` | **PASSED** |
| **TC-VOL-02** | Pickup | Mark Food as Picked Up | Assigned volunteer confirms pickup | 200 OK; status becomes `PICKED_UP`; pickedUpAt saved | **PASSED** |
| **TC-VOL-03** | Pickup | Premature Delivery Confirmation | Attempt to mark DELIVERED before PICKED_UP | 400 Bad Request: "Must be PICKED_UP first" | **PASSED** |
| **TC-VOL-04** | Pickup | Mark Food as Delivered | Assigned volunteer confirms drop-off at NGO | 200 OK; status becomes `DELIVERED`; deliveredAt saved | **PASSED** |
| **TC-VOL-05** | Pickup | Non-assigned Volunteer Action | Unassigned user attempts status update | 403 Forbidden: "Only assigned volunteer can update" | **PASSED** |

---

## 5. NGO Confirmation & Community Impact

| Test ID | Module | Scenario | Input / Action | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-REC-01** | Impact | NGO Confirms Food Receipt | NGO clicks Confirm Receipt on DELIVERED item | 200 OK; status updated to `RECEIVED` | **PASSED** |
| **TC-REC-02** | Impact | Record Meals Distributed | NGO enters 40 people served with notes | 200 OK; status becomes `COMPLETED`; peopleServed logged | **PASSED** |
| **TC-REC-03** | Impact | Analytics Aggregation Check | `GET /api/v1/analytics/overview` | Total people served, category breakdown, and total rescues match DB | **PASSED** |

---

## 6. Administrator Governance

| Test ID | Module | Scenario | Input / Action | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-ADM-01** | Admin | NGO Organization Approval | Admin clicks Approve on pending NGO | 200 OK; verificationStatus becomes `verified`; NGO notified | **PASSED** |
| **TC-ADM-02** | Admin | User Account Suspension | Admin suspends offending account | 200 OK; accountStatus becomes `suspended`; subsequent login blocked | **PASSED** |
| **TC-ADM-03** | Admin | Live Audit Log Retrieval | Admin checks Activity tab | Complete list of all status transitions rendered in chronological order | **PASSED** |
