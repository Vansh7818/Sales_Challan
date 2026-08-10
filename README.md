# Mini ERP + CRM Operations Portal

This is a Full-Stack Web Application built for a wholesale/distribution company to manage customers (CRM), products (Inventory), and Sales Challans.

## Tech Stack
- **Frontend**: React (Vite), TypeScript, Custom Premium CSS
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Security**: JWT Authentication, Role-based Access Control (Admin, Sales, Warehouse, Accounts)

## Prerequisites
- Node.js (v20+ recommended)
- A PostgreSQL database (e.g., Neon.tech, Supabase, or local Postgres)

## Local Setup Instructions

### 1. Database Setup
1. Create a free PostgreSQL database on [Neon.tech](https://neon.tech/) or any provider.
2. Get the connection string (e.g., `postgresql://user:pass@host/db?sslmode=require`).

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env` and update the `DATABASE_URL` with your actual PostgreSQL connection string.
4. Run database migrations:
   ```bash
   npx prisma db push
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

### 4. Application Access
- The frontend will be running at `http://localhost:5173`
- Use the following test accounts (Password: `123456`):
  - Admin: `admin@erp.com`
  - Sales: `sales@erp.com`
  - Warehouse: `warehouse@erp.com`

> **Note on Initial Data:** Since the database is fresh, you will need to create the initial users. For testing purposes, you can use the `/api/auth/register` endpoint via Postman to create the first admin user, or run a seed script.

## Deployment Guide
- **Frontend (Vercel)**: Connect your GitHub repo to Vercel and set the Root Directory to `frontend`.
- **Backend (Render)**: Connect your GitHub repo to Render, set Root Directory to `backend`, Build command to `npm install && npx prisma generate && npm run build`, and Start command to `npm start`. Add `DATABASE_URL` and `JWT_SECRET` in environment variables.

## Known Limitations & Assumptions
- Invoice PDF export is not implemented in this MVP.
- Cloud image upload is skipped; assuming local simple text-based SKUs.
