# CaseHub — Dubai Mobile Accessories Store

E-commerce storefront for a Dubai-based mobile accessories shop (iPhone cases,
MagSafe accessories, watch bands, earbuds, etc). React + Express + Postgres,
monorepo with independent `client/` and `server/` packages.

See [docs/STATUS.md](docs/STATUS.md) for what's done vs. not, and
[docs/ROADMAP.md](docs/ROADMAP.md) for the prioritized path to production.

## Stack

- **Client**: React 19, Vite, TypeScript, Redux Toolkit, React Router 7, Tailwind CSS 4, Axios
- **Server**: Express 5, TypeScript, Prisma ORM, PostgreSQL, JWT auth (httpOnly cookies), Cloudinary (image hosting)

## Prerequisites

- Node.js 20+
- A PostgreSQL database (local install or a managed instance)
- A [Cloudinary](https://cloudinary.com) account (free tier is fine) for product image uploads

## Setup

### 1. Server

```bash
cd server
npm install
```

Create `server/.env` (copy `server/.env.example` once it exists — see
[ROADMAP.md](docs/ROADMAP.md) Phase 0) with:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SELLER_EMAIL` | Admin/seller login email (single hardcoded admin, no multi-user roles yet) |
| `SELLER_PASSWORD` | Admin/seller login password |
| `JWT_SECRET` | Secret for signing auth JWTs — required, no fallback should be relied on |
| `NODE_ENV` | `development` or `production` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FRONTEND_URL` | Client origin, for CORS allowlist (e.g. `http://localhost:5173` in dev) |
| `PORT` | Server port (defaults to 3000) |

Then apply the Prisma schema and start the dev server:

```bash
npx prisma migrate dev
npm run dev
```

Server runs on `http://localhost:3000` by default.

### 2. Client

```bash
cd client
npm install
```

Create `client/.env` with:

| Variable | Purpose |
|---|---|
| `VITE_CURRENCY` | Currency symbol/code shown in the UI (should be `AED`, see [ROADMAP.md](docs/ROADMAP.md) Phase 1) |
| `VITE_BACKEND_URL` | API base URL (e.g. `http://localhost:3000` in dev) |

```bash
npm run dev
```

Client runs on `http://localhost:5173` by default.

### 3. Admin/seller access

Log in at `/seller` using the `SELLER_EMAIL` / `SELLER_PASSWORD` credentials
from the server `.env`. This is a single shared admin account, not a
per-staff user/role system (see roadmap Phase 3 for multi-admin plans).

## Project structure

```
client/   React SPA (storefront + admin panel UI)
server/   Express API + Prisma schema/migrations
docs/     STATUS.md and ROADMAP.md — read these before starting new work
```

## Known issues before you start developing

There are a few real bugs in the current codebase (not just missing
features) — see **Phase 0** in [docs/ROADMAP.md](docs/ROADMAP.md) before
assuming something that looks broken is a new bug you're causing. Most
notably: session restore on page refresh is currently broken due to a
route-name mismatch between client and server.
