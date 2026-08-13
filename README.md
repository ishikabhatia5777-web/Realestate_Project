# Production-Ready Real Estate Marketplace Platform (MERN Stack)

A high-performance, enterprise-scale luxury Real Estate Marketplace built from scratch with **MongoDB, Express.js, React (Vite), Node.js, Tailwind CSS, Framer Motion, Leaflet Maps, Stripe Payments, Socket.io Chat, and Built-in AI Engines**.

---

## Key Features

- 🏆 **Luxury UI/UX Design**: Glassmorphic styling, gold accents, smooth micro-animations, and full mobile-first dark mode.
- 🔐 **Complete Role-Based Access Control (RBAC)**:
  1. `super_admin` / `admin`: Full platform control, metrics, user management, listing approval queue, audit logs.
  2. `agency`: Agency profile, agent roster management, team analytics.
  3. `agent`: Assigned listing management, customer lead pipeline, offer counter system.
  4. `owner` (FSBO): Direct property publishing, AI description generator, Stripe boost upgrades.
  5. `buyer` / `renter`: Wishlist, saved searches, offer submission, inspection booking, live chat.
- 🗺️ **Interactive Geospatial Map**: Leaflet OpenStreetMap integration with custom price pin markers, popups, and radius filtering.
- 🤖 **Native Real Estate AI Suite**:
  - AI Property Description Generator.
  - Automated Valuation Model (AVM) with confidence scoring & suburb growth metrics.
  - Listing Fraud Risk Scanner.
  - Floating AI Real Estate Concierge Chatbot.
- 💬 **Real-Time Communication**: Buyer-to-agent Socket.io instant messaging.
- 💳 **Stripe Payments**: Listing package upgrades (Featured Listing, Premium Listing, Boosted).
- 🧮 **Interactive EMI Calculator**: Monthly mortgage repayment estimator with down payment & interest sliders.

---

## Project Structure

```
realestate/
├── server/                    # Node.js + Express API & Socket.io Server
│   ├── src/
│   │   ├── config/            # DB Configuration
│   │   ├── controllers/       # Auth, Property, Agency, Offer, Booking, Chat, AI, Payment, Admin
│   │   ├── models/            # Mongoose Schemas (User, Property, Agency, Offer, Booking, Chat, Review, etc.)
│   │   ├── routes/            # REST Express Routes
│   │   ├── middlewares/       # Auth JWT & RBAC Middlewares
│   │   ├── utils/             # AI Engine & Seeder Utilities
│   │   └── index.js           # Server Entry Point
│   ├── Dockerfile
│   └── package.json
├── client/                    # Vite + React 18 + Tailwind CSS
│   ├── src/
│   │   ├── components/        # Navbar, Footer, PropertyCard, PropertyMap, PropertyFilters, AIChatbot, EMI
│   │   ├── context/           # AuthContext, ThemeContext, SocketContext
│   │   ├── pages/             # Home, Properties, PropertyDetail, Agencies, AgencyDetail, Blogs, Dashboards
│   │   ├── services/          # Axios API Services
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml         # Container Orchestration
├── nginx.conf                 # Nginx Proxy Configuration
└── README.md
```

---

## Quick Start Guide

### 1. Backend Setup & Seeder

```bash
cd server
npm install
npm run seed       # Populates MongoDB with standard sample Australian properties, agencies, & users
npm run seed:large # Run this to generate ~600 realistic properties assigned to the 4 demo agents
npm run dev        # Starts API server on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev      # Starts Vite React dev server on http://localhost:3000
```

---

## Demo Login Credentials

You can test any role instantly using the quick role switcher on the login page:

- **Super Admin**: `admin@realestate.com` / `password123`
- **Agency Owner**: `agency@prestigerealty.com.au` / `password123`
- **Real Estate Agent**: `samantha@prestigerealty.com.au` / `password123`
- **FSBO Owner**: `owner@gmail.com` / `password123`
- **Buyer / Renter**: `buyer@gmail.com` / `password123`

---

## Docker Deployment

To launch the entire platform via Docker:

```bash
docker-compose up --build
```
Access the application at `http://localhost`.
"# AuraEstate" 
"# AuraEstate2" 
