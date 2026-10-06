---
name: cleanup-test-data
description: End a manual test session on the deployed FoodMe app. Neutralises the test orders from /prepare-test-data (and any order numbers given), then closes the browser tabs Claude opened for the run. Changes prod data, so it runs only when the user invokes it.
disable-model-invocation: true
argument-hint: "[FM-… order numbers placed during the run] [--dry-run]"
---

# Clean up test data

Run at the end of a manual test session started with `/prepare-test-data`.

## 1. Collect order numbers

`tests/.run-data.md` already lists the orders `/prepare-test-data` created. Orders placed **during** the run (checkout cases FM-TC-09 to FM-TC-11) aren't in it: take their numbers from this conversation (the success pages showed them) and pass them as arguments. If you're not sure an order is a test order, leave it out and ask the user.

## 2. Preview, then clean up

```bash
node tests/cleanup-data.mjs --dry-run $ARGUMENTS
node tests/cleanup-data.mjs $ARGUMENTS
```

Show the user the dry-run output and run the real command only after they confirm.

What the script does, and doesn't:
- The API has **no delete endpoints**, so nothing is deleted. Each test order still NEW or ACCEPTED is set to **REJECTED** with the reason "Test data cleanup (date)", which takes it out of the kitchen's queue and the dashboard totals.
- DELIVERED and REJECTED orders are final and stay as they are.
- The test customer stays; customers can't be deleted.
- It only touches orders that belong to the run's customer or that were passed explicitly. Anything else is skipped and reported.
- It appends a "Cleaned up" section to `tests/.run-data.md`; the next `/prepare-test-data` replaces the file.

## 3. Close the browser tabs

Close every tab Claude opened for this run, in the browser the run used: Playwright MCP (`browser_tabs` `list`, then `close` by index, or `browser_close` for the whole browser; the sign-ins stay in its profile) or Claude in Chrome (`tabs_context_mcp`, then `tabs_close_mcp` for each). Don't touch the user's own tabs.

## 4. Report

A short table: order, before → after status. Then one line each on the customer (kept) and the tabs (closed).

## Lessons learned

