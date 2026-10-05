# Regression: 20 runs under `/goal`

Goal: run `/run-regression` until `history.md` has 20 runs (first a `/goal` to 10, then a second to 20), then report whether the Results column was identical across runs and what the skill learned. Run 19 was started twice and abandoned (user pause, tool outage) before the recorded attempt; nothing from those attempts is recorded and their orders were cleaned up.

## Was the output the same?

| Runs | Results | Notes |
|---|---|---|
| 1 | `FPPPP PPPPP PSPPP` | Baseline (8m33s) |
| 2 | `FPPPP PPPPP PSPPE` | FM-TC-15 ERROR: dialog-close check ran too early in the background admin tab (execution, not the app) |
| 3–16 | `FPPPP PPPPP PSPPP` | Identical in all 14 runs (5m04s–5m28s), across two days (2026-10-02 and 2026-10-05) |
| 17 | `FPPPP FPPPP PSPPP` | FM-TC-06 FAIL: the app showed "Chef not found" for an existing chef (`/chef/17`); a reload fixed it. **App issue, transient** |
| 18 | `FPPPP PPPPP PSPPP` | Back to the baseline (17m55s, including a pause while Claude Code's tool approval was down) |
| 19–20 | `FPPPP PPPPP PSPPP` | Baseline (7m19s, 10m50s; slower because the browser extension needed one call per script) |

**18 of 20 runs produced exactly the same result.** The two differences have different causes:

- **Run 2: the agent.** A step ran too early; the skill learned from it and it never came back.
- **Run 17: the app.** `apps/web/src/pages/Chef/index.tsx:71` shows "Chef not found" for any failed or slow chef request, not just a 404. The regression caught a real intermittent bug; it is now a known issue in `tests/cart.md` (FM-TC-06).

Stable throughout:

- **FM-TC-01 FAIL in all 20 runs:** real product bug ("6 chefs cooking near you" with 5 cards; `/api/chef/active` returns `count: 6` with 5 chefs). Consistent, so not flaky.
- **FM-TC-12 SKIP in all 20 runs:** human-only (sign-in/out).
- Every other case PASS in every run, except the two above.

## What the skill learned (self-improvement)

| After | Lesson | Effect |
|---|---|---|
| Run 1 | Inputs don't take focus via `ref` clicks; fields move when validation messages change | Replaced by JS value setting in run 2 |
| Run 1 | Cleanup must use `--only` | Manual-session orders no longer touched |
| Run 2 | Set form values with the native setter + `input` event | No more retries on checkout/search/reject reason |
| Run 2 | Open admin orders by URL (`#/orders/<number − 100000>/show`) | Admin list ordering no longer matters |
| Run 2 | Background admin tab throttles timers: short scripts + waits; wait ≥ 3 s after Cancel | Fixed FM-TC-15 ERROR → PASS from run 3 on |
| Run 2 | Reload the storefront before reading anything an admin action changed | Prevents a stale "Received" badge |
| Run 2 | Match statuses by full text, not single words | Prevents matching the progress bar |
| Run 2 | A "not connected" browser call may still have run: check order numbers before restarting | 3 stray orders found and cleaned up |
| Run 10 | Folded the proven lessons into the main procedure | Runs 11–16 had no execution problems |
| Run 17 | Pick dishes by name ("Mushroom soup"), never "the first card" | Card order isn't stable while the page loads; fixed data stays fixed |
| Run 17 | No top-level `return` in browser scripts; wrap in `async` function | A lost result had hidden 3 placed orders |
| Run 17 | "Chef not found" for a known chef → record FAIL with evidence, reload once, carry on | App bugs are reported, not retried away |
| Run 18 | If tool calls stop being approved, stop, note the last step and any orders, resume from there | No duplicate orders after an outage |
| Run 19 | When the extension needs permission per script, run scripts standalone; click **Remove item** via JavaScript, not `ref` | Run completed despite the changed browser permissions |
| Run 20 | Never send dependent browser calls in parallel; check the cart is empty before placing an order | One wrong order (2× dish) caught, rejected and redone |

Run duration fell from 8m33s (run 1) to ~5m20s (runs 3–16) as the procedure stabilised. Runs 17–20 reversed that trend (7–18 min), each with a new execution problem: see below.

Note: every execution problem after run 2 (runs 17–20) changed *how* a step was carried out, never the recorded result: the agent recovered and recorded the result the app actually showed.

## After run 20: from reactive lessons to structure

Runs 17–20 showed the limit of adding a lesson after each failure: every run failed in a new way, because the agent retyped its browser scripts each time and sent dependent calls in parallel. The skill was changed structurally rather than with more lessons:

- **Browser scripts are files** (`tests/regression/scripts/`, 16 scripts with a README). The agent fills in the parameters and passes the file to the browser tool; it never writes a script. The scripts were tested against the real storefront DOM and the admin app.
- **Guards instead of reminders:** `place-order.js` refuses to click unless the cart holds exactly the expected lines (run 20's 2× order can't happen again), and `add-dish.js` can require an empty cart first.
- **One browser call at a time**, each script as a standalone call, is now a rule in the procedure.
- **Lessons folded into the procedure are deleted** from Lessons learned: the list went from 14 entries to 3 (limit 10). Only lessons not yet in the procedure stay (run 18 outage, run 17 "Chef not found", run 2 "not connected").
- **Values, not just letters:** each run now records a fixed list of observed values per case, and history.md has a `Values` column, so a changed value under a PASS also counts as a difference.

Not measured yet: the next `/goal` batch (runs 21+) should show whether durations return to ~5–6 min with no execution problems, and whether the observed values stay identical. Run 21 compares values with run 20, which has none, so the first value comparison is run 22.

## Data

Each run placed 3 orders in the signed-in customer's account (one delivered, one rejected, one rejected by cleanup). Aborted or wrong attempts (runs 2, 17, 19, 20) placed extra orders; all were rejected in cleanup. No chefs or dishes were changed.

## Cost note

Each run is ~60–80 browser actions in one long conversation, so later runs cost more tokens than early ones. For future repeats, start each `/goal` batch in a fresh session. The step scripts are now in files (see above), which also cuts the tokens spent retyping them.
