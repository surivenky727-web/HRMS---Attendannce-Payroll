# Employee Attendance & Payroll Management System (MERN)

Full-stack MVP: **MongoDB + Express + React (JavaScript) + Node**.

## Features
- JWT auth with bcrypt, role-based access (admin / employee)
- Employee CRUD with search/filter
- Attendance check-in / check-out, working hours, status, history
- Leave apply / approve / reject (casual, sick, earned, WFH)
- Payroll generation per month, PDF payslip download (pdfkit)
- Department CRUD
- Admin dashboard with Recharts (attendance + department charts)
- Employee dashboard (today status, month attendance, latest payslip)
- Responsive Tailwind UI, sidebar + topbar
- Seed script with demo admin + employees

## Prerequisites
- Node.js 18+
- MongoDB (local `mongodb://127.0.0.1:27017` or MongoDB Atlas connection string)

## Quick Start

```bash
# 1. Backend
cd server
cp .env.example .env       # edit MONGO_URI, JWT_SECRET
npm install
npm run seed               # creates demo admin + employees + departments
npm run dev                # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev                # http://localhost:5173
```

## Default Login
- **Admin:** `admin@demo.com` / `admin123`
- **Employee:** `john@demo.com` / `employee123`

## Environment Variables (server/.env)
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/attendance_payroll
JWT_SECRET=replace-me-with-a-long-random-string
CLIENT_URL=http://localhost:5173
```

The frontend reads `VITE_API_URL` (defaults to `http://localhost:5000/api`).
Optionally create `client/.env` with `VITE_API_URL=http://localhost:5000/api`.

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password` (returns reset token in dev — no SMTP)
- `POST /api/auth/reset-password`

### Employees (admin)
- `GET /api/employees`
- `POST /api/employees`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`

### Attendance
- `POST /api/attendance/checkin`
- `POST /api/attendance/checkout`
- `GET /api/attendance` (admin: all; employee: own)

### Leave
- `POST /api/leaves`
- `GET /api/leaves`
- `PUT /api/leaves/:id` (admin approve/reject)

### Payroll
- `POST /api/payroll/generate` (admin)
- `GET /api/payroll`
- `GET /api/payroll/payslip/:id` (PDF stream)

### Departments
- `GET /api/departments`
- `POST /api/departments`
- `PUT /api/departments/:id`
- `DELETE /api/departments/:id`

## Payroll Formula
```
gross  = basicSalary * (presentDays / workingDays) + overtimeHours * hourlyRate
net    = gross + bonus - tax - deductions
```

## Deployment
- **API:** Render / Railway / Fly.io — set env vars, `npm start`.
- **Client:** Vercel / Netlify — `npm run build`, set `VITE_API_URL` to your API URL.
- **DB:** MongoDB Atlas free tier.

## Deferred (next steps)
- Email delivery (nodemailer) for forgot-password and notifications
- Excel export, advanced report filters
- Profile photo upload (multer + S3/Cloudinary)
- Real-time notifications (socket.io)

## Project Structure
See `server/` and `client/` directories.
