# Full-Stack Invoice Details Module

A complete Invoice management system with an Express/Mongoose backend and a React/Vite/Tailwind frontend.

## Features
- **JWT Authentication**: Secure login and session management (Bonus).
- **Invoice Overview**: Detailed view of invoice numbers, customer names, and statuses.
- **Automated Totals**: Real-time computation of subtotals, tax (Bonus), and totals.
- **Payment History**: Track partial payments with balance due updates.
- **Overdue Logic**: Visual badges for unpaid past-due invoices (Bonus).
- **Archive/Restore**: Soft-delete functionality for invoices.
- **Advanced UI**: Framer Motion animations and premium design (Bonus).

## Tech Stack
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Bcrypt.
- **Frontend**: React (Vite), Tailwind CSS v4, Framer Motion, Lucide Icons, Axios.

## Getting Started

### Backend Setup
1. `cd backend`
2. `npm install`
3. Configure `.env` (provided with local defaults).
4. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

### Demo Credentials
- **Email**: `admin@example.com`
- **Password**: `password123`

## API Endpoints
- `POST /api/auth/login`: Authenticate user.
- `GET /api/invoices/:id`: Fetch invoice with computed totals.
- `POST /api/invoices/:id/payments`: Record a new payment.
- `POST /api/invoices/archive`: Archive an invoice.
- `POST /api/invoices/restore`: Restore an invoice.
