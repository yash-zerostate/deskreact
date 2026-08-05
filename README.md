# DeskDesk — static React SPA + its own Express API

A Vite-built React SPA (the kind of bundle you drop on a CDN, with no server of
its own) talking to a completely separate Express + MongoDB API.

```
web/  React 19 + Vite (port 4003)  ──Bearer access token + refresh cookie──►  api/  Express + Mongoose (port 5003)
```

This app has **its own database and its own backend** — it shares nothing with
the other two demos.

## Run it

```bash
cd api
cp .env.example .env      # Atlas URI + AUTH_JWT_SECRET
npm install
npm run seed
npm run dev               # http://localhost:5003

cd ../web
cp .env.example .env
npm install
npm run dev               # http://localhost:4003
```

## Pages

| Route | Access | What it does |
|-------|--------|--------------|
| `/login` | public | Signs in, stores the access token, redirects back to where you were |
| `/signup` | public | Creates a workspace; the first user becomes its admin |
| `/` | **protected** | Counts per status + the five highest-priority open tickets |
| `/tickets` | **protected** | Queue with server-side filter/search, create, status change, replies |
| `/profile` | **protected** | Edit display name and timezone |

## API

| Method | Route | Auth |
|--------|-------|------|
| `POST` | `/auth/register` | public, rate limited |
| `POST` | `/auth/login` | public, rate limited, lockout after 8 failures |
| `POST` | `/auth/refresh` | refresh **cookie** only — rotates with reuse detection |
| `POST` | `/auth/logout` | revokes the refresh family server-side |
| `GET/PATCH` | `/auth/me` | Bearer |
| `GET/POST` | `/tickets` | Bearer — workspace comes from the token, never the query |
| `GET/PATCH` | `/tickets/:id` | Bearer |
| `POST` | `/tickets/:id/comments` | Bearer |
| `DELETE` | `/tickets/:id` | Bearer + **admin** role |

## The token model

A static SPA has no server on its own origin, so it cannot use a session cookie
the way a full-stack app does. The split here is the usual production answer:

| | Where it lives | Lifetime | Readable by JS? |
|---|---|---|---|
| Access token | `localStorage` + memory, sent as `Authorization: Bearer` | 15 min | yes |
| Refresh token | `httpOnly` cookie scoped to `/auth`, sent with `credentials: "include"` | 30 days | **no** |

Consequences worth understanding:

- An XSS can read the access token — but only for the 15 minutes it is valid. It
  cannot read the refresh cookie, so it cannot mint new tokens forever.
- Because no state-changing route accepts a cookie for authentication, this API
  is not reachable by CSRF at all: a cross-site form cannot set an
  `Authorization` header.
- `src/lib/apiClient.ts` refreshes on a 401 and **replays the original request
  once**. Concurrent 401s share a single in-flight refresh — rotating the
  refresh token twice in parallel would look like token reuse and log the user
  out, which is exactly the bug this avoids.
- `AuthContext` also refreshes proactively one minute before expiry, so an idle
  tab is not one click away from a failed request.
- On a cold load with no access token it still tries `POST /auth/refresh` once —
  that is how "I closed the tab yesterday" stays signed in.

## Seeded accounts

All in the **Acme Support** workspace, password `Password123!`:

| Email | Role |
|-------|------|
| `admin@example.com` | admin (can delete tickets) |
| `pro@example.com` | supervisor |
| `free@example.com` | agent |

Sign in as `free@example.com` and call `DELETE /tickets/:id` — the API answers
`403 forbidden`. The role check is real, not a hidden button.
