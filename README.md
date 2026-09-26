# 👑 Shree Mithai & Royal Confectionery
### Premium Sweets & Food Restaurant — E-Commerce & Advance Event Booking Platform

A full-stack, production-grade e-commerce and advance bulk celebration booking platform designed for a heritage sweets and culinary establishment. Engineered with Next.js 14 (App Router), Node.js/Express, TypeScript, MongoDB, Mongoose, Razorpay Payments, and Cloudinary media handling.

---

## 🌟 Core Business Models

### Model A: Instant Ordering (Storefront)
* **Real-time Kitchen Orders:** Artisanal sweets, hot savories, Bengali milk delicacies, chaat, and daily gift hampers.
* **Fulfillment Choices:** Same-day doorstep express delivery or boutique store takeaway.
* **Dynamic Checkout:** Cart with tiered wholesale pricing, live coupon deduction, automatic tax & free delivery thresholds, and date/slot selection with live capacity constraints.

### Model B: Advance Event Booking (Bespoke Wholesale)
* **Celebration Pipeline:** Tailored bulk orders for Weddings, Receptions, Anniversaries, Corporate Galas, and Religious Festivals.
* **Event Specifics:** Guest count tracking, event venue location, dedicated delivery slots, and bespoke luxury packaging (Royal Velvet Hampers, Handcrafted Brass Thalis, Foil-Embossed Gift Boxes).
* **Tiered Wholesale Pricing:** Automatic quantity-based tiered discounts computed server-side without floating-point errors.
* **Split Settlement Engine:** Flexible 30% advance deposit or 100% full payment via Razorpay, with real-time balance tracking and one-click balance completion.
* **Inventory Reservation:** Distinguishes between live shelf stock and event reservation (`reservedStock`) to prevent overcommitting perishable sweets for future dates.

---

## 🏗️ Monorepo Architecture

```
/Mithai
├── /backend                    # Dedicated Express.js REST API Server
│   ├── /src
│   │   ├── /config             # MongoDB connection & environment validation
│   │   ├── /controllers        # Authoritative business logic controllers
│   │   ├── /middlewares        # JWT Auth, Admin verification, Zod validation
│   │   ├── /models             # Mongoose schemas with indexed relations
│   │   ├── /routes             # REST endpoint routing
│   │   ├── /services           # Razorpay SDK & Cloudinary integration
│   │   ├── /validators         # Strict Zod schemas for payload validation
│   │   ├── /seed               # Comprehensive database seeder
│   │   └── server.ts           # Express server bootstrap & security headers
│   ├── package.json
│   └── tsconfig.json
│
├── /frontend                   # Next.js 14 App Router Storefront & Admin Portal
│   ├── /app
│   │   ├── /admin              # Role-protected Admin Operations Suite
│   │   │   ├── page.tsx        # Real-time KPI Dashboard & SVG Revenue Chart
│   │   │   ├── /orders         # Instant kitchen orders table & status updates
│   │   │   ├── /bookings       # Advance event bookings & contract details
│   │   │   ├── /calendar       # Interactive booking schedule (Month & Agenda)
│   │   │   ├── /kanban         # 6-column production pipeline board
│   │   │   ├── /products       # Product CRUD with variants & bulk pricing
│   │   │   ├── /categories     # Category hierarchy & display order
│   │   │   ├── /delivery-slots # Time windows & daily capacity throttles
│   │   │   ├── /customers      # Patron spend history & account suspension
│   │   │   ├── /payments       # Cryptographic Razorpay payment audit trail
│   │   │   ├── /offers         # Promo coupons & percentage discounts
│   │   │   ├── /settings       # Platform fees, GST rates & booking rules
│   │   │   └── /audit-logs     # Immutable administrative action log
│   │   ├── /shop               # Product catalogue with debounced filters
│   │   ├── /products/[slug]    # SEO-rich product page with variant selectors
│   │   ├── /event-booking      # 5-Step mobile-friendly event booking wizard
│   │   ├── /cart               # Dynamic cart drawer and checkout review
│   │   ├── /checkout           # Slot selection, address & Razorpay checkout
│   │   ├── /account            # Patron profile, addresses, orders, bookings
│   │   ├── /login & /register  # Authentication with 1-click Demo Fill
│   │   ├── /terms & /privacy   # Customer governance & legal policies
│   │   ├── /cancellation-policy# Refund rules for fresh confections & events
│   │   └── /delivery-policy    # Temperature-controlled logistics standards
│   ├── /components             # Reusable UI component system
│   ├── /lib                    # API client with JWT interception & utilities
│   ├── /store                  # Zustand global state (Auth, Cart, Booking)
│   └── package.json
│
├── /shared                     # Shared TypeScript types & restaurant defaults
│   ├── types.ts
│   └── constants.ts
└── .env.example
```

---

## 🛡️ Security & Authoritative Backend

* **Zero Client-Side Trust:** Grand totals, discounts, taxes, delivery fees, and partial advance deposits are recalculated strictly on the server from raw database records.
* **Cryptographic Razorpay Signature Verification:** Payments are marked as `Paid` only after validating the `HMAC-SHA256` signature using the backend `RAZORPAY_KEY_SECRET`.
* **Delivery Slot Capacity Protection:** Slot capacity is calculated dynamically per calendar day (`bookedCount` vs `maxCapacity`) to prevent double-booking.
* **Role-Based Access Control:** All `/api/admin/*` endpoints strictly require JWT authentication and an `ADMIN` role. Unauthorized requests are rejected with `403 Forbidden`.
* **Security Headers & Sanitization:** Armed with `helmet`, CORS restrictions, rate limiting, and password hashing using `bcrypt`.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* **Node.js:** v18.0.0 or higher
* **MongoDB:** Local MongoDB instance running on `mongodb://127.0.0.1:27017` (or MongoDB Atlas URI)

### 2. Backend Setup
```bash
cd backend
npm install

# Seed the database with categories, products, delivery slots, and admin/customer accounts
npm run seed

# Start the backend API server (runs on port 5000)
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start the Next.js development server (runs on port 3000)
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 🔑 Default & Demo Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | Configured in `backend/.env` | Defined in `backend/.env` (`ADMIN_PASSWORD`) | Full access to `/admin` Operations Suite & Management |
| **Customer** | `customer@mithai.com` | `Customer@123456` | Storefront, cart, instant checkout & bookings |

> **Note:** Configure your private admin credentials securely in `backend/.env`. Admins automatically redirect to `/admin` upon sign-in.

---

## 💳 Razorpay Payment Simulation & Production

* In development mode (`NODE_ENV=development`), the system creates standard Razorpay orders.
* When testing locally without live bank credentials, the signature verification routine gracefully acknowledges simulated test flows while preserving the complete cryptographic verification workflow for production deployment.
* To switch to production, set `NODE_ENV=production` and provide your live `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `backend/.env`.

---

## 📄 License
Artisanal Confectionery Software Suite — Crafted with pride for royal hospitality and celebration events.
