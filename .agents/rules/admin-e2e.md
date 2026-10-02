---
paths:
  - "apps/admin/e2e/**"
---
# Admin e2e rules
Back-office (react-admin + MUI) specs, run against the deployed app at `<base>/backoffice/`. These add to `e2e-tests.md`.

- Set `ADMIN_BASE_URL=<base>/backoffice/`, with the trailing slash.
- Admin uses hash routes. Navigate with relative URLs: `page.goto("#/login")`, `page.goto("#/orders")`. A leading slash (`"/#/login"`) drops `/backoffice/` and opens the storefront.
- Admin can't import web's `auth.ts`. Reuse `loginAsAdmin` and `createOrderViaApi` from `apps/admin/e2e/admin-flows.spec.ts`; if another admin spec needs them, move them to a shared `apps/admin/e2e/helpers.ts`.
- Admin has no `aria-label`s. Find elements by MUI field labels and menu names: "Username", "Password", "Sign in", and the `menuitem`s "Orders", "Chefs", "Dishes".
- A react-admin list can show cached data. After creating data through the API, click the "Refresh" button before asserting on the list, as the existing specs do.
- The prod database is shared. Only change the order the test created (e.g. its status). Never edit, deactivate or delete chefs or dishes; read-only checks on those lists are fine.
- The admin suite runs serially (`fullyParallel: false`). Keep new tests independent anyway: each one logs in and creates its own order.
