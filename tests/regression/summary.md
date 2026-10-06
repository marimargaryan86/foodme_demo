# Regression: 10 runs under `/goal`

Goal: run `/run-regression` until `record.mjs status` reports 10 runs, and check whether the output was the same each time and what the skill learned. All 10 runs ran on 2026-10-06 (14:06–15:38 UTC) against the deployed app, each one in a fresh forked subagent (Sonnet) using only the Playwright MCP page tools.

## Was the output the same?

**Yes. Results and Values were identical in all 10 runs.**

| | |
|---|---|
| Results | `FPPPP PPPPP PSPPP` in 10/10 runs (13 pass, 1 fail, 1 skip, 0 error) |
| Values | all 51 observed values the same as the previous run in 9/9 comparisons |
| Fail | FM-TC-01 every time: the header says "6 chefs cooking near you" while 5 cards show (known issue, KAN-5). This is the **app**, and it was stable |
| Skip | FM-TC-12, human-only by design |

Nothing differed, so there is no app or agent cause to separate. The agent did make mistakes (see below), but each one was caught and redone inside the run, so none reached the result or the values. That is the point of the fixed key list and of `record.mjs finish`: run 3 and run 4 first wrote two values without quotes, `finish` flagged a false change, and the run fixed the format before recording.

Each run placed 3 real orders (FM-100103 … FM-100132, 30 in total, consecutive numbers, so the failed clicks never created an extra order). Every run ended with one DELIVERED, one REJECTED and one rejected by cleanup.

## Durations

| Run | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Duration | 10m18s | 8m17s | 9m28s | 7m55s | 6m57s | 6m54s | 7m27s | 8m25s | 6m43s | 15m25s |

Median 8m17s. Runs got faster as the lessons accumulated (about 10 min down to about 7 min from run 5 on). Run 10 is the outlier: it missed two short-lived admin toasts and waited out the timeouts, and it sent snapshot and click calls in parallel, which caused "Ref not found" retries.

## What the skill learned

Four runs changed `.agents/skills/run-regression/SKILL.md` (see `git log -p` on it, commits d76a823, 194ceb9, 8bb0919, cab6797). All of them added lines to **Lessons learned**; none changed the procedure steps.

| Run | Problem in how the run was done | Lesson added |
|---|---|---|
| 1 | Opened admin order `3` instead of `103`; "Ref not found" on Place order after a re-render | Admin id = order number − 100000; re-find the ref and click once, after checking nothing was placed |
| 4 | Loose `browser_find` regex returned a whole chef page; aria-label buttons not found as text; unquoted values made `finish` report a false change | Keep find patterns narrow; find `button "Remove item"`; quote text values |
| 5 | `cleanup-data.mjs --only` with a comma list rejected nothing, silently | Pass order numbers separated by spaces |
| 10 | Missed short-lived toasts; admin id wrong again; parallel snapshot + click | Find the toast text right after the click or check the status chip; compute the admin id first; no snapshot and click in one parallel call |
| 2, 3, 6–9 | Only problems already covered by a lesson | none |

### What worked, and what didn't

- **Worked:** the lessons that describe a *fact* fixed the problem for good. The cleanup separator (run 5) and the observed-value quoting (run 4) never came back. The "Ref not found" lesson turned a click error into a harmless re-find every time.
- **Didn't work:** the admin order id slip happened in runs 1, 4, 6, 8 and 10, with a lesson about it from run 1 onwards. A lesson the agent has to *remember to apply* while working doesn't stop it; run 10 even wrote the same lesson a second time instead of merging it. The skill's own rule says a lesson that changes the procedure should move into the steps. This one should: make step "Admin orders" say "navigate to `/backoffice/#/orders/<id>/show` where id is the last 3 digits of the order number, e.g. FM-100130 → `130`", and drop it from Lessons learned.
- **Missed by the self-review:** run 10 didn't click the **All orders** link in FM-TC-13 step 3 and still recorded the case as PASS. The run noted it under Execution problems, but the result format can't show a skipped step, so the 10/10 result hides it.
- **Unchanged procedure:** "fold a lesson into the steps" never happened in this batch, so Lessons learned grew from 4 to 8 lines (the 4 earlier ones come from previous batches and the one-off run before the reset). Self-improvement here meant more notes, not a better procedure.

In short: the skill is **stable** (the same app gave the same table 10 times) and it **learned** from its mistakes, but only the lessons about facts helped. The lessons about attention (the admin id) needed a procedure change, which the skill didn't make on its own.
