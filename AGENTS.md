# AGENTS.md

FoodMe is a food-ordering demo app for a QA course. It runs as a single Render free-tier service, with a separate monitoring stack.

## Layout

- `apps/backend`: Spring Boot 3.3, Java 17, Gradle, Postgres + Flyway, JWT auth.
- `apps/web`: customer storefront (React 19, TypeScript, Vite, Tailwind, TanStack Query).
- `apps/admin`: back office (react-admin + MUI, plain JSX).
- `infra/monitoring`: Prometheus, Loki, Grafana and Grafana MCP in one container (`render-monitoring.yaml`).

`apps/backend/Dockerfile` builds from the repo root. It bundles the storefront at `/`, the admin at `/backoffice`, and serves the REST APIs at `/api/**` (public/customer) and `/admin/**` (admin, JWT). The admin UI is at `/backoffice` because `/admin` is taken by the API. The per-app Dockerfiles, `nginx.conf` and `vercel.json` aren't used by the Render deploy.

## Commands

Backend (`apps/backend`); the local DB is Postgres on :5432 with db, user and password all `foodme`:
```bash
./gradlew build                                   # compile + tests (CI)
./gradlew test --tests OrderControllerTest        # one class
./gradlew test --tests 'OrderControllerTest.name' # one method
./gradlew bootRun                                 # :8081, Swagger at /swagger-ui.html
```

Web (`apps/web`):
```bash
npm run dev     # calls the backend at http://localhost:8081 (no proxy)
npm run lint    # oxlint
npm run build   # tsc -b && vite build, so type errors fail the build
npx playwright test [e2e/file.spec.ts]   # starts dev server on :5180
```

Admin (`apps/admin`): `npm run dev`, `npm run lint` (eslint), `npm run build`, `npx playwright test` (dev server on :5174, runs serially).

E2E tests run against the deployed app, not a local backend. Wake it first (`curl -m 60 <base>/actuator/health`), then set all three base URLs, or the configs fall back to localhost and start a dev server:
```bash
BASE=https://foodme-marimargaryan86.onrender.com
PLAYWRIGHT_BASE_URL=$BASE VITE_API_BASE_URL=$BASE ADMIN_BASE_URL=$BASE/backoffice/ \
  npx playwright test --workers=2
```
`npm run test:e2e:all` in `apps/web` runs both suites (with the same env vars).

CI's e2e job uses `infra/docker-compose.yml`, which isn't in the repo, so that job is broken. The compose notes in `.env.example` are out of date for the same reason.

## Live environment

- The deployed monitoring stack exposes a Grafana MCP server (streamable-http) at `https://foodme-monitoring-<hash>.onrender.com/mcp`. Use it to query Prometheus (`up{app="foodme-backend"}`) and Loki (`{app="foodme-backend"}`) when debugging the live app. The endpoint has no auth and admin-level access. Setup configs are in `infra/monitoring/README.md`.
- Free-tier services sleep after about 15 minutes. If a request to the live app or the MCP times out, retry after 1–3 minutes before assuming it's broken.

## Testing conventions

- Backend tests are Spring Boot + MockMvc integration tests on the `test` profile. They use H2 in Postgres mode with Flyway off; the schema comes from `create-drop` and seed data from `src/test/resources/data.sql`. That profile turns latency off and disables the heartbeat job.
- E2E specs find elements by accessible role and label (see `apps/web/e2e/auth.ts`). Keep ARIA labels, tab names and form names stable when changing the UI.
- Tests create a fresh, randomly named customer per test instead of sharing accounts.

## Intentional course behavior: do not "fix" unless asked

- `SimulatedLatencyConfig` adds a random 200–1500 ms delay to `/api/**` and `/admin/**`.
- `FlakyHeartbeatJob` and `apps/*/src/lib/flakyHeartbeat.*` fail about 1 run in 10 on purpose and report it to Sentry/GlitchTip.
- `GET /api/debug/boom` throws on purpose.
- `e2e/flake-*.spec.ts` are deliberately flaky specs.
- CORS is `*`, and the JWT secret and admin credentials are hardcoded. This is a lab setup.

## Project conventions

- Every schema change needs a new `db/migration/V{n}__*.sql`. Hibernate runs `ddl-auto=validate` against the `foodme` schema.
- Images are stored in Postgres and served at `/api/images/**`. URLs are stored relative and made absolute by `ImageUrlResponseAdvice`; any new DTO with an image URL must be added there.
- `DATABASE_URL` accepts a raw `postgresql://` URI, which `DatabaseUrlEnvironmentPostProcessor` converts to JDBC.
- Both frontends resolve the API base the same way: `VITE_API_BASE_URL` if set, otherwise `localhost:8081` in dev and same-origin (`""`) in prod.
- Storefront cart is in IndexedDB (Dexie), not on the server. It holds dishes from one chef only, and the line key is `chefId-dishId-sortedAdditionIds`.
- The admin `dataProvider.js` maps plural resource names to singular API paths (`orders` → `/order`), and `{list,count}` responses to `{data,total}`. It sorts on the client.
- The Dockerfile JVM flags and `server.tomcat.threads.max=32` are tuned for Render's 512 MB / 0.1 CPU instance. Keep them.
- Frontend Sentry DSNs are baked in at build time (`VITE_SENTRY_DSN_WEB` / `_ADMIN` build args).
- `render.yaml` names the service `foodme-<github-username>`, set per fork.
- Bug-fix commits cite the ticket ID, e.g. `(FM-BUG-07)`.
