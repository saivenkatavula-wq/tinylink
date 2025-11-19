## TinyLink

TinyLink is a full-stack URL shortener built with Next.js (App Router), Prisma, and Material UI. It supports creating custom short codes, viewing stats, deleting links, and exposes required API routes for automated grading:

- `POST /api/links` – create
- `GET /api/links` – list (with `?q=` filter)
- `GET /api/links/:code` – stats
- `DELETE /api/links/:code` – delete
- `/:code` – redirect
- `/code/:code` – stats page
- `/healthz` – health check

### Requirements

- Node.js 18+
- npm (or pnpm/yarn/bun)

### Environment

Create a `.env` file based on `.env.example`:

```
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

For production (e.g. Vercel + Neon), set `DATABASE_URL` to your Postgres connection string and `NEXT_PUBLIC_BASE_URL` to the deployed domain (e.g. `https://your-app.vercel.app`).

### Local setup

```bash
npm install
npx prisma db push
npm run dev
```

Visit http://localhost:3000 to access the dashboard.

### Deployment

- Run `npx prisma migrate deploy` with your production database
- Set `DATABASE_URL` and `NEXT_PUBLIC_BASE_URL`
- Deploy via Vercel/Render/Railway

### Features

- Dashboard with search, inline validation, copy buttons, delete confirmations
- Stats page (`/code/:code`) with metrics and quick actions
- Health page (`/health`) surfaces `/healthz` status and uptime
- Global snackbar notifications, health check UI, responsive layout
