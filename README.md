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
| `/welcome` | public | Long marketing page — hero, logo wall, features, four-step flow, testimonials, pricing teaser, FAQ, sticky bar, its own footer |
| `/knowledge` | public | Knowledge base index: search, category sidebar, article cards, FAQ accordion |
| `/knowledge/:slug` | public | Full article with table of contents, code blocks, callout, feedback widget, related reading |
| `/pricing` | public | Plan cards with monthly/annual toggle, 16-row comparison table, testimonials, FAQ, sales modal |
| `/status` | public | Six components × 60 days of uptime bars, incident history with update timelines |
| `/changelog` | public | Filterable release timeline, six releases, versioning notes |
| `/` | **protected** | Status counts, stat tiles, activity feed, weekday chart, quick links, reading list |
| `/tickets` | **protected** | Queue with server-side filter/search, create, status change, replies |
| `/reports` | **protected** | Tabbed analytics — volume, response time, channel mix, per-agent table, scheduled reports |
| `/team` | **protected** | Member table, role legend, hourly coverage chart, invite modal, member detail modal |
| `/settings` | **protected** | Five tabs — business hours, notification toggles, integrations, sessions, danger zone |
| `/profile` | **protected** | All six profile attributes, shown and editable |
| anything else | public | A real 404 page with suggested destinations |

Static page copy and sample data live in [`web/src/lib/content.ts`](web/src/lib/content.ts);
shared presentational primitives (banners, tabs, toggles, modals, charts) live in
[`web/src/components/ui.tsx`](web/src/components/ui.tsx). Injectable regions carry
`data-preta-slot` attributes (`hero`, `banner`, `cta`, `stat-tile`, `plan-card`,
`sticky-bar`, `section`, `modal`, …) so a loader has stable hooks to target.

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
| `DELETE` | `/tickets/:id` | Bearer + **security or compliance** role |

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

All in the **Acme Support** workspace, password `Password123!`. The full
attribute matrix is in the root README.

Sign in as `free@example.com` (role `marketing`) and call `DELETE /tickets/:id` —
the API answers `403 forbidden`. Switch the role to `compliance` on `/profile`,
sign in again, and the same call succeeds. The role check is real, not a hidden
button.
