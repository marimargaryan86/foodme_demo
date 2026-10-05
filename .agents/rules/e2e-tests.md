---
paths:
  - "apps/web/e2e/**"
  - "apps/admin/e2e/**"
---
# E2E test rules
Playwright specs for the storefront and the back office. They run against the deployed app (`https://foodme-marimargaryan86.onrender.com`), not a local backend. New tests should be resilient to UI restyling, the simulated API latency and Render free-tier slowness.

## Target and URLs
- Run with all three env vars set to the deployed app. Without them the configs fall back to localhost and start a dev server:
  `PLAYWRIGHT_BASE_URL=<base>`, `VITE_API_BASE_URL=<base>`, `ADMIN_BASE_URL=<base>/backoffice/` (keep the trailing slash).
- Get the API base from `process.env.VITE_API_BASE_URL || "http://localhost:8081"`, as the existing specs do.
- Admin specs have extra rules in `admin-e2e.md` (relative `#/...` routes under `/backoffice/`, MUI locators).
- Wake the service before running (`curl -m 60 <base>/actuator/health`). If the URL doesn't answer when Playwright starts, its `webServer` block launches a local dev server instead.

## Data
- The deployed database is real and shared. Set up data (customers, orders) through the API, not the UI, and create a fresh, randomly named customer per test.
- Don't change shared seed data. Only change records the test created (e.g. its own order).

## Locators and waiting
- New locators use `getByRole` / `getByLabel` / `getByText`. Older specs use CSS classes (`a.cc_card`, `button.dc_card`, `aside.uc-panel`, `.cic_root`); don't copy that into new tests.
- Web: reuse `createAccountAtCheckout(page, name?)` and `registerCustomerViaApi(request, apiBase)` from `apps/web/e2e/auth.ts`, and put new shared helpers there too.
- Never use `page.waitForTimeout`, `setTimeout` or sleeps. Use web-first assertions (`await expect(locator).toBeVisible()` etc.), which retry automatically.
- A hook (`.agents/hooks/block-test-waits.mjs`) enforces this: a Write/Edit that adds a fixed wait to a spec here (except `flake-*.spec.ts`) is blocked. It doesn't see edits made through Bash, so the rule still applies there.
- Every API call adds 200–1500 ms of simulated latency plus network time, so give assertions that wait on API-backed UI `{ timeout: 15000 }` (see `loginAsAdmin`).
- The instance has 0.1 CPU. Run with `--workers=2` or fewer so parallel tests don't overload it into timeouts.
- Don't edit `flake-*.spec.ts` unless asked, and leave them out of runs against the deployed app. Their `waitForTimeout(300)` and CSS locators are deliberate.
