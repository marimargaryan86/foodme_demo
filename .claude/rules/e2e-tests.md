---
paths:
  - "apps/web/e2e/**"
  - "apps/admin/e2e/**"
---
# E2E test rules
Playwright specs for the storefront and the back office. New tests should be resilient to UI restyling and to the simulated API latency.

- New locators use `getByRole` / `getByLabel` / `getByText`. Older specs use CSS classes (`a.cc_card`, `button.dc_card`, `aside.uc-panel`, `.cic_root`); don't copy that into new tests.
- Web: reuse `createAccountAtCheckout(page, name?)` and `registerCustomerViaApi(request, apiBase)` from `apps/web/e2e/auth.ts`, and put new shared helpers there too.
- Admin can't import web's `auth.ts`. Reuse `loginAsAdmin` / `createOrderViaApi` in `apps/admin/e2e/admin-flows.spec.ts`.
- Get the API base from `process.env.VITE_API_BASE_URL || "http://localhost:8081"`, as the existing specs do. Set up data (customers, orders) through the API, not the UI.
- Never use `page.waitForTimeout`, `setTimeout` or sleeps. Use web-first assertions (`await expect(locator).toBeVisible()` etc.), which retry automatically.
- Every API call can take up to ~1.5 s, so give assertions that wait on API-backed UI a longer timeout, e.g. `{ timeout: 15000 }` (see `loginAsAdmin`).
- Don't edit `flake-*.spec.ts` unless asked. Their `waitForTimeout(300)` and CSS locators are deliberate.
