# Nithyasree A R — Developer Portfolio

A responsive portfolio built with Next.js, React, TypeScript, Tailwind CSS and Framer Motion, with an independent FastAPI contact service backed by PostgreSQL. The visual direction is warm editorial ivory with peach and coral details, expressive serif headlines, a real portrait, responsive pointer tilt, and reduced-motion fallbacks.

## Requirements

- Node.js 20.9 or later and npm
- Python 3.11 or later
- PostgreSQL 15 or later, or Docker Desktop with Compose

## Start PostgreSQL

For local PostgreSQL, create a database named `portfolio` and use a role with permission to create its tables. For Docker, from the repository root run `docker compose up -d db`. The backend reads `DATABASE_URL` from the process environment first, then `backend/.env`, then the repository root `.env.local`. Docker Compose points the backend at its `db` service by default; direct local runs use the configured URL.

## Start the backend

In PowerShell, from the repository root:

```powershell
Copy-Item backend/.env.example backend/.env
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

The API is at `http://localhost:8000`; API documentation is at `http://localhost:8000/docs`. Health check: `GET /api/health`. Contact endpoint: `POST /api/contact`.

### Contact email notifications

Submissions are saved to PostgreSQL before notification delivery is attempted. For Resend, configure `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `CONTACT_RECIPIENT_EMAIL` in `backend/.env` or the backend host environment. `RESEND_FROM_EMAIL` must use a domain verified in the same Resend account as the API key; do not use `onboarding@resend.dev` for production. Resend API keys restricted to a domain must also authorize the sender's domain. Gmail SMTP remains an optional fallback via `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, and `SMTP_FROM_EMAIL`; Gmail requires an app password, and some hosts block SMTP. Keep credentials private and only in the backend environment. The API returns `email_sent` separately, so a delivery failure does not undo the saved submission.

## Start the frontend

In a second PowerShell window, from the repository root:

```powershell
Copy-Item frontend/.env.example frontend/.env.local
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. To point the contact form at a hosted API, set `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.local` to its public origin.

## Docker backend

Copy `backend/.env.example` to `backend/.env`, then run `docker compose up --build`. Compose starts PostgreSQL and the backend, and runs the Alembic migration before the API starts. Start the frontend separately using the instructions above.

## Database migrations

Run `alembic upgrade head` from `backend` after configuring `DATABASE_URL`. Migration history lives in `backend/alembic/versions`. `DATABASE_URL` and `FRONTEND_ORIGINS` are server-side variables. For deployed frontend origins, set `FRONTEND_ORIGINS` to the exact comma-separated origin or origins permitted to call the API.

## Checks

Frontend: `npm run lint`, `npx tsc --noEmit`, `npm run build` (from `frontend`).

Backend: `python -m pytest` (from `backend`). Contact schema validation is covered without a live database. Exercise persistence and migrations against a configured PostgreSQL instance.

## Personal assets

- The supplied portrait is `frontend/public/images/nithyasree-ar.png`; replace it at this path to retain the current layout.
- The supplied portrait is `frontend/public/images/nithyasree-ar.jpeg`; replace it at this path to retain the current layout.
- The verified PDF at `frontend/public/documents/Nithyasree_AR_Resume.pdf` is linked by the header download button.
- Social profile URLs and project source/deployment URLs were not supplied, so none are invented or linked.

## Contact storage and privacy

Submissions are validated and stored in PostgreSQL before the API confirms receipt. When configured, Resend or SMTP sends the notification to the portfolio owner and sets `email_sent`; if delivery fails, the stored message remains saved and the frontend reports the email failure. The public form includes field length limits, server-side validation, a honeypot, and an in-memory limit of five submissions per client IP per minute. For multi-instance production hosting, move rate limiting to a shared store. Keep database and email credentials out of frontend variables and use restricted, strong credentials in production.
