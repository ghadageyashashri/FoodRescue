# FoodRescue — System Architecture & Design Specification

## 1. High-Level System Architecture

```mermaid
graph TD
    Client["React Frontend (Vite + Bootstrap 5)<br/>Port: 5173"] --> |REST API / JSON| API["Express.js Server (Node.js)<br/>Port: 5000"]
    API --> |JWT & RBAC Middleware| Auth["Authentication & Authorization"]
    API --> |Mongoose ODM| DB[(MongoDB Database<br/>Port: 27017)]
    
    subgraph Frontend Architecture
        Client --> Pages["Pages: Home, Donor, NGO, Volunteer, Admin, Details, Impact"]
        Client --> Context["State: AuthContext & NotificationContext"]
        Client --> Services["Axios API Client + Interceptors"]
    end
    
    subgraph Backend Architecture
        API --> Routes["Express Routes (/api/v1)"]
        Routes --> Controllers["Controllers (Donations, Requests, Pickups, Users, Admin)"]
        Controllers --> ServicesBack["History Service & Notification Service"]
        Controllers --> Models["Mongoose Models & Schemas"]
        Models --> DB
    end
```

---

## 2. Database Entity Relationship (ER) Schema

```mermaid
erDiagram
    User ||--o{ Donation : "creates as donor"
    User ||--o{ Organization : "manages as NGO"
    User ||--o{ DonationRequest : "submits as NGO"
    User ||--o{ Pickup : "carries out as Volunteer"
    User ||--o{ Notification : "receives"
    
    Donation ||--o{ DonationRequest : "receives"
    Donation ||--o{ Pickup : "triggers"
    Donation ||--o{ StatusHistory : "maintains audit log"
    
    User {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string phone
        string role "donor | ngo | volunteer | admin"
        string accountStatus "active | suspended"
        string address
        date createdAt
    }
    
    Organization {
        ObjectId _id PK
        ObjectId user FK
        string organizationName
        string registrationNumber
        string address
        string verificationStatus "pending | verified | rejected"
        date verifiedAt
    }
    
    Donation {
        ObjectId _id PK
        ObjectId donor FK
        string foodName
        string description
        string category
        number quantity
        string unit
        boolean isVegetarian
        date preparationDate
        date useByDate
        string storageConditions
        string pickupAddress
        string status
        ObjectId requestedBy FK
        ObjectId assignedVolunteer FK
        number peopleServed
    }
    
    StatusHistory {
        ObjectId _id PK
        ObjectId donation FK
        string previousStatus
        string newStatus
        ObjectId actor FK
        string note
        date timestamp
    }
```

---

## 3. Donation Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> AVAILABLE : Donor creates listing
    AVAILABLE --> REQUESTED : NGO submits donation request
    AVAILABLE --> CANCELLED : Donor cancels listing
    AVAILABLE --> EXPIRED : Expiration reached (useByDate)
    
    REQUESTED --> ACCEPTED : Donor accepts NGO request
    REQUESTED --> AVAILABLE : NGO cancels request
    REQUESTED --> CANCELLED : Donor cancels listing
    
    ACCEPTED --> PICKUP_ASSIGNED : Volunteer accepts pickup task
    
    PICKUP_ASSIGNED --> PICKED_UP : Volunteer confirms pickup at donor location
    
    PICKED_UP --> DELIVERED : Volunteer delivers food to NGO facility
    
    DELIVERED --> RECEIVED : NGO confirms food inspection & receipt
    
    RECEIVED --> COMPLETED : NGO records meals served & impact
    
    COMPLETED --> [*]
    CANCELLED --> [*]
    EXPIRED --> [*]
```

---

## 4. Role-Based Access Control (RBAC) Matrix

| Endpoint | Method | Public | Donor | NGO | Volunteer | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `/api/v1/auth/login` | POST | Yes | Yes | Yes | Yes | Yes |
| `/api/v1/auth/register` | POST | Yes | Yes | Yes | Yes | No (Seed) |
| `/api/v1/donations` | GET | Yes | Yes | Yes | Yes | Yes |
| `/api/v1/donations` | POST | No | **Yes** | No | No | Yes |
| `/api/v1/donations/:id` | PATCH | No | **Owner** | No | No | Yes |
| `/api/v1/donations/:id/cancel` | POST | No | **Owner** | No | No | Yes |
| `/api/v1/donations/:id/request` | POST | No | No | **Yes** | No | Yes |
| `/api/v1/requests/:id/accept` | POST | No | **Owner** | No | No | Yes |
| `/api/v1/pickups` | POST | No | No | No | **Yes** | Yes |
| `/api/v1/pickups/:id/status` | PATCH | No | No | No | **Assigned** | Yes |
| `/api/v1/donations/:id/receive`| POST | No | No | **Requester** | No | Yes |
| `/api/v1/donations/:id/distribute`| POST | No | No | **Requester** | No | Yes |
| `/api/v1/admin/*` | ALL | No | No | No | No | **Yes** |
| `/api/v1/users` | GET | No | No | No | No | **Yes** |
