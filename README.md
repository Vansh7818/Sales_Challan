# 🏢 Mini ERP + CRM Operations Portal

A full-stack ERP and CRM system for a wholesale/distribution company to manage customers, products, inventory, and sales challans. Built as a professional case study demonstrating end-to-end full-stack development.

**Live Application:** https://sales-challan-erp.vercel.app  
**Backend API:** https://sales-challan-erp.vercel.app/api  
**GitHub Repository:** https://github.com/Vansh7818/Sales_Challan

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Vanilla CSS |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL (Neon.tech) via Prisma ORM |
| **Auth** | JWT (JSON Web Tokens) + bcrypt |
| **Deployment** | Vercel (Frontend + Serverless API) |
| **Validation** | Zod |

---

## 🔐 Test Credentials (Password for all: `123456`)

| Role | Email |
|---|---|
| Admin | admin@erp.com |
| Sales | sales@erp.com |
| Warehouse | warehouse@erp.com |
| Accounts | accounts@erp.com |

---

## 📦 Core Modules

### 1. Authentication & Role-Based Access
- JWT-based login system
- 4 roles: **Admin**, **Sales**, **Warehouse**, **Accounts**
- Role-based UI permissions (e.g. only Admin/Sales can create challans)
- Protected API routes using middleware

### 2. Customer CRM Module
- Full customer records: Name, Mobile, Email, Business Name, GST Number (optional), Type (Retail/Wholesale/Distributor), Address, Status (Lead/Active/Inactive), Follow-up Date, Notes
- Search customers by name, business, or mobile
- Filter by status
- Create and update customer records

### 3. Product & Inventory Module
- Product records: Name, SKU, Category, Unit Price, Current Stock, Min Stock Alert, Location/Warehouse
- Low stock visual alerts when stock falls below minimum threshold
- Stock Movement Log: tracks every IN/OUT movement with reason, quantity, user, and timestamp

### 4. Sales Challan Module
- Select customer and add multiple products with quantities
- Auto-generated unique challan number
- Save as **Draft** or **Confirmed**
- On confirmation: stock is automatically reduced
- Negative stock protection (API returns error if stock is insufficient)
- Challan stores **product snapshot** (name, SKU, unit price at time of creation)

---

## 🏗️ Architecture Overview

```
Sales_Challan/
├── frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── pages/          # Login, Dashboard, Customers, Products, Challans
│   │   ├── contexts/       # AuthContext (JWT token management)
│   │   └── App.tsx         # React Router configuration
│   └── vite.config.ts      # Dev proxy → localhost:5000/api
│
├── backend/                # Node.js + Express API
│   ├── src/
│   │   ├── controllers/    # auth, customer, product, challan logic
│   │   ├── middleware/      # JWT authentication middleware
│   │   ├── routes/         # Express route definitions
│   │   └── server.ts       # App entry point
│   └── prisma/
│       ├── schema.prisma   # Database schema (Users, Customers, Products, Challans)
│       └── seed.ts         # Seeds initial users and sample data
│
└── vercel.json             # Monorepo deployment config (frontend + serverless API)
```

**Request Flow:**
`Browser → Vercel CDN (Static React) → /api/* → Vercel Serverless (Express) → Neon PostgreSQL`

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js v20+
- A PostgreSQL database (e.g., [Neon.tech](https://neon.tech) — free tier works)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Vansh7818/Sales_Challan.git
cd Sales_Challan
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"
JWT_SECRET="your-secret-key-here"
PORT=5000
```

Push the database schema and seed initial data:
```bash
npx prisma db push
npx prisma db seed
```

Start the backend dev server:
```bash
npm run dev
# Server runs at http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

> The Vite dev server automatically proxies all `/api/*` requests to `http://localhost:5000`, so no CORS issues arise locally.

---

## ☁️ Deployment Guide

### Deployed On: Vercel (Monorepo)

Both the frontend (static build) and backend (Express as Serverless Functions) are hosted together on a single Vercel project using `vercel.json` configuration at the root.

**Environment Variables set on Vercel:**
```
DATABASE_URL  → Neon PostgreSQL connection string
JWT_SECRET    → Secret key for signing JWT tokens
```

**To redeploy manually:**
```bash
npx vercel deploy --prod
```

### How Environment Variables Are Managed
- **Local**: Stored in `backend/.env` (excluded from Git via `.gitignore`)
- **Production**: Stored securely in Vercel's encrypted Environment Variables dashboard — never hardcoded in source code

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/login` | Login and receive JWT token | No |
| POST | `/api/auth/register` | Create new user account | No |
| GET | `/api/customers` | List all customers (search, filter) | Yes |
| GET | `/api/customers/:id` | Get single customer with challans | Yes |
| POST | `/api/customers` | Create new customer | Yes |
| PUT | `/api/customers/:id` | Update customer | Yes |
| GET | `/api/products` | List all products (search) | Yes |
| GET | `/api/products/:id` | Get single product | Yes |
| POST | `/api/products` | Create new product | Yes |
| PUT | `/api/products/:id` | Update product | Yes |
| GET | `/api/challans` | List all challans | Yes |
| GET | `/api/challans/:id` | Get challan with items | Yes |
| POST | `/api/challans` | Create new challan (Draft/Confirmed) | Yes |
| PATCH | `/api/challans/:id/status` | Update challan status | Yes |
| GET | `/health` | Health check | No |

---

## ⚙️ Assumptions & Known Limitations

- **Invoice PDF export** is not implemented (noted as a bonus feature).
- **Product image upload to S3** is not implemented (bonus feature, paid AWS service).
- **Docker setup** is not included (bonus feature).
- The application assumes a single-tenant setup (one company, multiple internal users).
- Pagination is implemented at the API level via query parameters but not exposed in the UI yet.
- The Accounts role can view all data but does not have a dedicated invoicing module in this MVP.
