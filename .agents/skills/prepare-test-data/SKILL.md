---
name: prepare-test-data
description: Wake the deployed FoodMe app and create the customer and orders the manual test cases in tests/ need. Creates real data on prod, so it runs only when the user invokes it.
disable-model-invocation: true
argument-hint: "[--dry-run]"
---

# Prepare test data

Sets up a manual test session in `tests/` against the deployed app: wakes the free-tier service, then creates one customer and three NEW orders (one each for FM-TC-13, FM-TC-14, FM-TC-15).

## 1. Run the script

From the repo root:

```bash
node tests/prepare-data.mjs $ARGUMENTS
```

- `--dry-run` only wakes the app and checks that an orderable dish exists. Use it when the user just wants to know the app is ready.
- Without it the script creates data on the shared prod database. Run it once per test session, not once per test case.
- If the app doesn't answer within ~3 minutes, the script stops. Tell the user to check the Render dashboard; don't retry in a loop.

## 2. Report

Read `tests/.run-data.md` (git-ignored) and show the user its table: customer email and password, and each order number with the test case that uses it.

Then remind them:
- **Signing in is their step.** Claude doesn't type passwords into the site. They sign in as the customer (storefront) and as admin (`/backoffice/`) in the browser; Claude continues from there.
- **Run FM-TC-13 before FM-TC-14 and FM-TC-15** if they share a browser session, and only change the status of the orders listed in the file.
- Checkout cases (FM-TC-08 to FM-TC-11) create their own orders by design; this script doesn't prepare data for them.

## Don't

- Don't create extra customers or orders "just in case".
- Don't change chefs, dishes or anyone else's orders.
- Don't commit `tests/.run-data.md`.

## Lessons learned

