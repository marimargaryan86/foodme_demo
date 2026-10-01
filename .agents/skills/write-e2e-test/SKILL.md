---
name: write-e2e-test
description: Write a Playwright e2e test for a FoodMe user flow (storefront or back office), run it 3 times against the deployed app, and flag flakiness.
disable-model-invocation: true
argument-hint: <flow to test, e.g. "customer reorders from order history">
---

# Write an e2e test

Flow to test: **$ARGUMENTS**

If no flow was given, ask for one and stop.

## 1. Check the deployed app is up

```bash
BASE=${PLAYWRIGHT_BASE_URL:-https://foodme-marimargaryan86.onrender.com}
curl -sf -m 60 "$BASE/actuator/health"
```

The free-tier service sleeps after ~15 minutes and takes up to a minute to wake. If the check fails, wait 1–3 minutes and try once more. If it still fails, **stop**: don't write or run the test, and tell the user the deployed app at `$BASE` isn't responding.

## 2. Pick the suite and read what exists

- Storefront flows go in `apps/web/e2e/` and back-office flows in `apps/admin/e2e/`.
- Read the existing specs in that folder, plus `apps/web/e2e/auth.ts` (web), to reuse helpers and see which accessible names are already in use.
- Read the components behind the flow to find their roles, labels and button text. Don't guess names. The deployed build can lag behind local source; if a name doesn't match, check the live page.
- If a spec already covers the flow, extend it instead of adding a near-duplicate.

## 3. Write the test

Follow `.claude/rules/e2e-tests.md`: role/label locators, existing helpers, no fixed waits, auto-waiting `expect`, longer timeouts on API-backed assertions, a fresh customer per test, no changes to shared seed data, and relative `#/...` URLs in admin specs. Name the file `<area>-<flow>.spec.ts`, and never start the name with `flake-`.

## 4. Run it three times

From the app folder (`apps/web` or `apps/admin`), after `npm install`:

```bash
PLAYWRIGHT_BASE_URL=$BASE VITE_API_BASE_URL=$BASE ADMIN_BASE_URL=$BASE/backoffice/ \
  npx playwright test e2e/<file>.spec.ts --repeat-each=3 --workers=2 --reporter=list
```

## 5. Report

- A table with one row per run (run 1/2/3): pass or fail, duration, and the first error line for failures.
- The verdict:
  - **PASS**: all 3 runs passed.
  - **FAIL**: all 3 runs failed. This is probably a test bug or a real product bug; run the `triage-test-failure` skill on the output.
  - **FLAKY**: some runs passed and some failed. Say "This test is flaky", give the likely cause (a race with the simulated latency, a cold start, shared data, an animation), then fix it and run all 3 again, or explain why you couldn't.
- The path of the new spec.

## Lessons learned

