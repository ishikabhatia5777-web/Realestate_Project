# Real Estate Marketplace Platform - API Specification

Production-grade RESTful API endpoints and Socket.io events.

## Base URL
`http://localhost:5000/api`

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| font | --- | --- | --- |
| `POST` | `/auth/register` | Register new user account with role | No |
| `POST` | `/auth/login` | Sign in & receive JWT token | No |
| `GET` | `/auth/me` | Fetch authenticated profile & wishlist | Yes |
| `PUT` | `/auth/profile` | Update profile bio/phone/2FA | Yes |
| `POST` | `/auth/wishlist/:propertyId` | Toggle property in wishlist | Yes |

---

## 2. Properties (`/api/properties`)

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `GET` | `/properties` | Search & filter properties (suburb, price, beds, radius, status, sort) | No |
| `GET` | `/properties/:id` | Get property detail & trigger AI valuation model | No |
| `GET` | `/properties/:id/similar` | Fetch similar properties | No |
| `POST` | `/properties` | Create property (Agent / Agency / Owner) | Yes (RBAC) |
| `PUT` | `/properties/:id` | Update property listing | Yes (RBAC) |
| `DELETE` | `/properties/:id` | Remove property listing | Yes (RBAC) |
| `PATCH` | `/properties/:id/status` | Change workflow status (`Approved`, `Published`, `Under Offer`) | Yes (Admin) |

---

## 3. Offers & Buying Workflow (`/api/offers`)

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/offers` | Submit formal purchase/rental offer | Yes |
| `GET` | `/offers` | Get user offers (buyer or agent/owner) | Yes |
| `PUT` | `/offers/:id/respond` | Counter, Accept, or Reject offer | Yes |

---

## 4. Inspection Bookings (`/api/bookings`)

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/bookings` | Schedule private inspection or video walkthrough | Yes |
| `GET` | `/bookings` | View user inspection calendar | Yes |

---

## 5. Native AI Services (`/api/ai`)

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/ai/generate-description` | Generate engaging property copy | No |
| `POST` | `/ai/valuation` | Automated Valuation Model (AVM) estimate | No |
| `POST` | `/ai/fraud-check` | Fraud risk score scanner | No |
| `POST` | `/ai/chat` | AI Real Estate Concierge Chatbot | No |

---

## 6. Stripe Payments (`/api/payments`)

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/payments/checkout` | Process Stripe payment for Featured/Premium listing upgrade | Yes |
| `GET` | `/payments/history` | Transaction receipts history | Yes |

---

## 7. Socket.io Real-Time Events

- `join_chat`: Emitted on connection with `{ userId }`
- `send_message`: Emitted with `{ receiverId, propertyId, text }`
- `receive_message`: Listened by recipient for instant message delivery
