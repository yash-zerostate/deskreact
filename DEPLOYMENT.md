# Deploying DeskDesk (SPA on Vercel, API on Render)

```
repo root
├── web/   → Vercel   (Root Directory: web)   static Vite build
└── api/   → Render   (Root Directory: api)   Express + MongoDB
```

This is the easiest of the three to deploy: the frontend is a pile of static
files, and it never needs the server to know who the user is.

## 1. API on Render

| Setting | Value |
|---|---|
| Root Directory | `api` |
| Build command | `npm ci && npm run build` |
| Start command | `npm start` |
| Health check path | `/health` |

Or import `api/render.yaml` as a Blueprint.

Environment variables:

```
NODE_ENV                production
MONGODB_URI             mongodb://…
MONGODB_DB              deskdesk_spa
AUTH_JWT_SECRET         <48 random bytes>
ACCESS_TOKEN_TTL_MIN    15
REFRESH_TOKEN_TTL_DAYS  30
WEB_ORIGIN              https://<your-spa>.vercel.app
COOKIE_SAMESITE         none
COOKIE_SECURE           true
COOKIE_DOMAIN           (empty)
```

Do not set `PORT` — Render provides it.

## 2. SPA on Vercel

| Setting | Value |
|---|---|
| Root Directory | `web` |
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |

Environment variable:

```
VITE_API_URL   https://deskdesk-api.onrender.com
```

`VITE_*` variables are inlined at **build time**, so changing this requires a
redeploy, not just a restart. That is fine — it is a public URL, not a secret.

`web/vercel.json` rewrites every unknown path to `index.html`; without it, a
hard refresh on `/tickets` would 404 because no such file exists on disk.

## No proxy needed here — and why

Unlike the Voyago app, this frontend has no server. Nothing renders on the
server, so nothing needs to read a cookie server-side. The split is:

- **access token** — travels in an `Authorization: Bearer` header, so it is
  completely unaffected by cookie rules;
- **refresh token** — an `httpOnly` cookie, sent only to `/auth/*` with
  `credentials: "include"`. Across different domains that requires
  `SameSite=None; Secure`, which the Render config above sets.

So cross-domain works directly. No rewrite, no shared parent domain.

## 3. Order of operations

1. Deploy the API, note its URL.
2. Deploy the SPA with `VITE_API_URL` set to it.
3. Set `WEB_ORIGIN` on Render to the Vercel URL and redeploy the API — CORS is
   an exact allow-list.

## MongoDB Atlas

Add `0.0.0.0/0` to Network Access. Seed from your machine:

```bash
cd api && MONGODB_URI="…" MONGODB_DB="deskdesk_spa" npm run seed
```

## Note on Render's free tier

Free services sleep after ~15 minutes idle. The first sign-in after a sleep will
hang for 30–60 s while the instance wakes. The SPA shows the button in its
"Signing in…" state rather than failing, but a paid instance (or a scheduled
ping to `/health`) is worth it for anything you demo live.
