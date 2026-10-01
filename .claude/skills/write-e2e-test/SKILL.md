---
name: write-e2e-test
description: Write a Playwright e2e test for a FoodMe user flow (storefront or back office), then run it 3 times to detect flakiness.
disable-model-invocation: true
argument-hint: <flow to test, e.g. "customer reorders from order history">
---

# Write an e2e test

Flow to test: **$ARGUMENTS**

If no flow was given, ask for one and stop.

## 1. Check the backend is up

```bash
curl -sf -m 5 http://localhost:8081/actuator/health
```

If this fails or times out, **stop**. Don't write or run the test. Tell the user:

> The backend isn't responding on http://localhost:8081. Start it first:
> 1. Make sure Postgres is running on :5432 (db, user and password all `foodme`). Check with `pg_isready -h localhost -p 5432`.
> 2. `cd apps/backend && ./gradlew bootRun`, then wait for "Started FoodmeBackendApplication".
> 3. Re-run `/write-e2e-test $ARGUMENTS`.

## 2. Pick the suite and read what exists

- Storefront flows go in `apps/web/e2e/` and back-office flows in `apps/admin/e2e/`.
- Read the existing specs in that folder, plus `apps/web/e2e/auth.ts` (web), to reuse helpers and see which accessible names are already in use.
- Read the components behind the flow to find their roles, labels and button text. Don't guess names.
- If a spec already covers the flow, extend it instead of adding a near-duplicate.

## 3. Write the test

Follow `.claude/rules/e2e-tests.md`: role/label locators, existing helpers, no fixed waits, auto-waiting `expect`, longer timeouts on API-backed assertions, and a fresh customer per test. Name the file `<area>-<flow>.spec.ts`, and never start the name with `flake-`.

## 4. Run it three times

From the app folder (`apps/web` or `apps/admin`):

```bash
npx playwright test e2e/<file>.spec.ts --repeat-each=3 --reporter=list
```

## 5. Report

- A table with one row per run (run 1/2/3): pass or fail, duration, and the first error line for failures.
- The verdict:
  - **PASS**: all 3 runs passed.
  - **FAIL**: all 3 runs failed. This is probably a test bug or a real product bug; run the `triage-test-failure` skill on the output.
  - **FLAKY**: some runs passed and some failed. Say "This test is flaky", give the likely cause (a race with the simulated latency, shared data, an animation), then fix it and run all 3 again, or explain why you couldn't.
- The path of the new spec.

## Lessons learned
