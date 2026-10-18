# Recruweb

Recruweb is a full-stack, AI-powered recruitment and HR-services platform. It combines a public marketing website, role-based portals for **candidates**, **clients** and **HR partners**, an **admin / CRM** back office, AI resume and CV tools, live chat and calling, interview scheduling, KYC and joining workflows, invoicing and payments, plus integration with an HRMS.

---

## Features

**Public website**
- Home, services, industries, pricing, how it works, testimonials, about and contact
- Job listings and job details, get-started and client inquiry forms
- Resource Center and SOP Center
- Website chat assistant and voice assistant

**AI and career tools**
- CV Maker, Resume Builder and Resume Checker
- CV Screening, JD Maker and Cover Letter Builder
- Interview scheduler and live meeting room
- Proposal builder

**Candidate portal**
- Registration, login, onboarding and profile
- Applications, interviews, interview tasks and joining tracker
- KYC document upload, support tickets, chat with recruiters

**Client portal**
- Requirements, submissions, hiring tracker, interviews
- Analytics, invoices, HRMS plans, chat

**HR partner portal**
- Vacancies, submissions, hiring tracker
- Wallet, profile, support chat

**Admin / CRM**
- Dashboard and CEO dashboard
- Candidates, clients, CRM companies, contacts, requirements, contracts, notes
- Leads and follow-ups, ATS pipeline, jobs, tasks
- Finance, invoices, KYC, employee joining forms, employee verification
- Roles and permissions (RBAC), audit logs, branches, settings, backups
- Automation, support tickets and support chat

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, React Router, Three.js (react-three-fiber), Framer Motion, Recharts, Axios, Socket.IO client |
| Mobile / PWA | Capacitor (Android), vite-plugin-pwa |
| Backend | Node.js (ES modules), Express, Socket.IO |
| Database | MySQL with Sequelize (`mysql2`) |
| Auth | JWT with refresh tokens, bcrypt, RBAC |
| AI | OpenAI API and Groq |
| Documents | pdf-parse, mammoth, pdfkit, tesseract.js (OCR), docx, jsPDF |
| Payments | Razorpay |
| Email | Nodemailer (SMTP) |
| Scheduling | node-cron |

---

## Repository Structure

```
.
├── Recruweb_BACKEND_UPDATED_FINAL/    # Express API, Socket.IO, Sequelize models
│   ├── index.js                       # App entry point
│   ├── start.cjs                      # Hostinger / Passenger startup file
│   ├── routes/                        # API route modules
│   ├── controllers/
│   ├── models/                        # Sequelize models
│   ├── middleware/
│   ├── modules/employee-verification/
│   ├── seeders/                       # RBAC, SOP and resource-center seeders
│   ├── scripts/                       # seed and migration scripts
│   ├── utils/
│   ├── frontend/dist/                 # Built frontend served by the backend
│   └── uploads/                       # Runtime uploads (git-ignored)
├── Recruweb_FRONTEND_UPDATED_FINAL/   # React + Vite app
│   ├── src/
│   │   ├── pages/                     # Public, admin, candidate, client, hrpartner pages
│   │   ├── components/
│   │   ├── context/
│   │   └── utils/
│   └── public/
├── DEPLOY_LIVE_CHAT.md                # Recruweb to HRMS live chat setup
├── FIX_NOTES_HINDI.txt
└── .gitignore
```

---

## Prerequisites

- Node.js 20 or newer
- MySQL 8 (or compatible)
- SMTP credentials (for example a Gmail app password)
- OpenAI / Groq API key for AI features
- Razorpay keys, only if you use payments

---

## Local Development

### 1. Clone

```bash
git clone https://github.com/ardhnarishwarcompany-cmd/Recruweb_website.git
cd Recruweb_website
```

### 2. Backend

```bash
cd Recruweb_BACKEND_UPDATED_FINAL
npm install
```

Create a `.env` file (see [Environment Variables](#environment-variables)) and an empty MySQL database, then:

```bash
npm run seed    # seeds initial data (roles, admin, etc.)
npm run dev     # starts the API with file watching
```

The server listens on `PORT` (default `5000`). Check it at `/api/health`, which should return `status: OK` and `db: connected`.

### 3. Frontend

```bash
cd Recruweb_FRONTEND_UPDATED_FINAL
npm install
npm run dev
```

Vite serves the app on `http://localhost:5173`. When the backend runs on a different origin during development, set `VITE_API_URL` (and `VITE_SOCKET_URL` if needed) in the frontend `.env`. For same-origin production deployment, leave them unset.

---

## Environment Variables

Never commit real `.env` files. They are git-ignored.

### Backend (`Recruweb_BACKEND_UPDATED_FINAL/.env`)

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default `5000`) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_LOGGING` | MySQL connection |
| `JWT_SECRET`, `JWT_EXPIRE`, `JWT_REFRESH_EXPIRE_DAYS` | Auth tokens |
| `FRONTEND_URL`, `FRONTEND_URLS`, `CORS_ORIGINS`, `API_BASE_URL` | Origins and links used in emails |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_APP_PASSWORD`, `SMTP_PASS`, `FROM_EMAIL`, `FROM_NAME`, `SMTP_TLS_REJECT_UNAUTHORIZED` | Email (verification, password reset, notifications) |
| `GROQ_API_KEY` | AI features |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Default admin account |
| `EXCHANGE_RATE_API_KEY` | Currency conversion |
| `RAZORPAY_MODE`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Razorpay payments |
| `HRMS_BRIDGE_URL`, `WB_BRIDGE_KEY` | Recruweb to HRMS bridge (see `DEPLOY_LIVE_CHAT.md`) |

For Gmail, use a 16-character App Password. The mailer strips spaces and tries ports 587 and 465 automatically.

### Frontend (`Recruweb_FRONTEND_UPDATED_FINAL/.env`)

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | API base URL (only when backend is on another origin) |
| `VITE_SOCKET_URL` | Socket.IO URL (only when backend is on another origin) |

---

## API Overview

All endpoints are served under `/api`:

| Area | Prefixes |
|------|----------|
| Auth and users | `/api/auth`, `/api/users`, `/api/roles`, `/api/permissions`, `/api/team`, `/api/branches` |
| Recruitment | `/api/jobs`, `/api/applications`, `/api/candidates`, `/api/interviews`, `/api/tracker`, `/api/recruiter` |
| Portals | `/api/candidate-portal`, `/api/client-portal`, `/api/hr-partners` |
| CRM | `/api/crm/clients`, `/api/crm/contacts`, `/api/crm/companies`, `/api/crm/requirements`, `/api/crm/notes`, `/api/crm/contracts`, `/api/crm/submissions`, `/api/crm/invoices`, `/api/leads`, `/api/lead-follow-ups` |
| AI and tools | `/api/ai-chat`, `/api/resumes`, `/api/cv-screen`, `/api/resume-checker`, `/api/cover-letter`, `/api/website-chat` |
| Chat and support | `/api/messages`, `/api/support-chat`, `/api/support-tickets`, `/api/crm/client-chat`, `/api/crm/candidate-chat` |
| Documents and HR | `/api/kyc`, `/api/employee-joining`, `/api/employee-verification`, `/api/sops`, `/api/resource-center` |
| Finance | `/api/finance`, `/api/finance/payments`, `/api/hrms` |
| Admin | `/api/dashboard`, `/api/analytics`, `/api/audit`, `/api/audit-logs`, `/api/settings`, `/api/backups`, `/api/tasks` |
| Public | `/api/contact`, `/api/get-started`, `/api/client-inquiry`, `/api/subscribers`, `/api/health` |
| Files | `/uploads` |

---

## Production Deployment (Hostinger, single Node.js app)

The backend serves the built frontend (`frontend/dist`), the API and Socket.IO from one origin, so no CORS or separate API domain is needed.

1. Build the frontend:
   ```bash
   cd Recruweb_FRONTEND_UPDATED_FINAL
   npm run build
   ```
   Do **not** set `VITE_API_URL` / `VITE_SOCKET_URL` for a same-origin build.
2. Copy the new `dist` into `Recruweb_BACKEND_UPDATED_FINAL/frontend/dist`.
3. Deploy the backend folder as a Node.js app. Startup file: `start.cjs` (or `index.js`). Node 20, 22 or 24.
4. Set the environment variables in the hosting panel (they override `.env`): `DB_*`, `JWT_SECRET`, SMTP, API keys, `HRMS_BRIDGE_URL`, `WB_BRIDGE_KEY`.
5. Do not keep old frontend files in `public_html`.
6. Verify `/api/health`:
   - `OK` and `db: connected`: everything works
   - `503 DB_UNAVAILABLE`: the app is running but the `DB_*` values are wrong (check runtime logs)
   - Hosting 404 page: the Node app did not start or is not attached to the domain

### HRMS live chat bridge

Set the same `WB_BRIDGE_KEY` on both the Recruweb backend and the HRMS backend. Details are in `DEPLOY_LIVE_CHAT.md`.

---

## Security Notes

- `.env` files and `uploads/` are git-ignored. The uploads folder holds KYC, ID, contract, invoice and resume files, so never commit it, and keep it backed up separately.
- Use strong, unique values for `JWT_SECRET` and the admin password, and change the default admin credentials after the first login.
- Restrict `CORS_ORIGINS` to your real domains.
- Rotate any key that has ever been exposed publicly.

---

## License

All rights reserved. Contact the repository owner for usage permission.
