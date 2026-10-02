# Regression: 10 runs under `/goal`

Goal: run `/run-regression` until `history.md` has 10 runs, then report whether the Results column was identical across runs and what the skill learned.

## Was the output the same?

| Runs | Results | Notes |
|---|---|---|
| 1 | `FPPPP PPPPP PSPPP` | Baseline (8m33s) |
| 2 | `FPPPP PPPPP PSPPE` | FM-TC-15 ERROR: dialog-close check ran too early in the background admin tab (execution, not the app) |
| 3–10 | `FPPPP PPPPP PSPPP` | Identical in all 8 runs (5m14s–5m28s) |

**9 of 10 runs produced the identical result; the one difference (run 2) came from how the agent executed a step, not from the app, and disappeared once the skill learned from it.** The app itself behaved the same every time:

- **FM-TC-01 FAIL in all 10 runs:** the real product bug ("6 chefs cooking near you" with 5 cards; `/api/chef/active` returns `count: 6` with 5 chefs). Consistent, so not flaky.
- **FM-TC-12 SKIP in all 10 runs:** human-only (sign-in/out).
- Everything else PASS in every completed check.

## What the skill learned (self-improvement)

| After | Lesson | Effect |
|---|---|---|
| Run 1 | Inputs don't take focus via `ref` clicks; fields move when validation messages change | Replaced by JS value setting in run 2 |
| Run 1 | Cleanup must use `--only` | Manual-session orders no longer touched |
| Run 2 | Set form values with the native setter + `input` event | No more retries on checkout/search/reject reason |
| Run 2 | Open admin orders by URL (`#/orders/<number − 100000>/show`) | Admin list ordering no longer matters |
| Run 2 | Background admin tab throttles timers: short scripts + waits; wait ≥ 3 s after Cancel | Fixed FM-TC-15 ERROR → PASS from run 3 on |
| Run 2 | Reload the storefront before reading anything an admin action changed | Prevents stale "Received" badge |
| Run 2 | Match statuses by full text, not single words | Prevents matching the progress bar |
| Run 2 | A "not connected" browser call may still have run: check order numbers before restarting | 3 stray orders found and cleaned up |
| Run 10 | Folded the proven lessons into the main procedure | Next runs follow them by default |

Run duration fell from 8m33s (run 1) to ~5m20s (runs 4–10) as the procedure stabilised.

## Data

Each run placed 3 orders in the signed-in customer's account (one delivered, one rejected, one rejected by cleanup); the aborted run-2 attempt placed 3 more, also rejected. No chefs or dishes were changed.
