# Jira sync: 10 runs under `/goal`

Goal: run `/sync-jira-bugs` until `sync-history.md` has 10 syncs, then report whether the `Map` and `Jira writes` columns were stable and what the skill learned. All 10 syncs ran on 2026-10-05 against Jira project `KAN`, with regression run 20 as the newest run throughout.

## Was the output the same?

| Syncs | Jira writes | Map | Notes |
|---|---|---|---|
| 1 | 3 | `01=KAN-5 04=KAN-4 06=KAN-6` | Created KAN-6 (FM-TC-06, "Chef not found"); labelled KAN-5 and KAN-4 with `fm-tc-NN` + `foodme` |
| 2–10 | 0 | `01=KAN-5 04=KAN-4 06=KAN-6` | Every action "none" |

- **Map: identical in all 10 syncs.** Each case always resolved to the same ticket; no duplicate was ever created.
- **Jira writes: 3, then 0 nine times.** That is the intended shape: the first sync brings Jira in line with `tests/`, and with no new regression run there is nothing new to write. The skill is idempotent in practice, not just on paper.
- **Needs a decision: none** in every sync.

Durations: syncs 1–6 were recorded as estimated or rounded minutes (see below); syncs 7–10, measured, took 6–14 s.

## What the skill learned (self-improvement)

Each problem was fixed in the procedure in the same sync, so `Lessons learned` stayed empty (the skill's rule: a lesson folded into the procedure is deleted).

| Sync | Problem | Change to the skill |
|---|---|---|
| 1 | JQL search results don't include `labels`, and a label edit replaces the whole list: an edit based on search results could have dropped existing labels | Label edits read the current labels with `getJiraIssue` first; lookups done in one JQL |
| 2 | One `getJiraIssue` per mapped ticket (3 calls) just to confirm label + status | One paired JQL `(key = KAN-5 AND labels = "fm-tc-01" …) OR (…)` confirms all pairs in one call |
| 3 | Sync 2's start time had been estimated (17:00) and was later than sync 3's real start (16:59) | Start and duration taken from `date -u`; sync 2's row corrected and marked |
| 4 | Syncs 3 and 4 collected the cases with different shell commands (the same retyping variation that destabilised regression runs 17–20) | One fixed collection command in step 2 |
| 7 | Syncs 4–6 recorded "1m" for runs that took seconds (rounding, not measurement) | Duration in seconds from a saved timestamp; start to the second |
| 5, 6, 8, 9, 10 | none | none |

The pattern matches the regression exercise: the result was stable from the start because the design is deterministic (fixed map, label lookup, "evidence changed" rule), and the improvements were about *how* the agent ran the procedure: fewer calls, measured instead of estimated values, and fixed commands instead of retyped ones. The improvements stopped after sync 7; syncs 8–10 ran the final procedure unchanged.

## Jira state after the goal

| Case | Ticket | Status | Labels added |
|---|---|---|---|
| FM-TC-01 | KAN-5 | To Do | `fm-tc-01`, `foodme` |
| FM-TC-04 | KAN-4 | Done | `fm-tc-04`, `foodme` |
| FM-TC-06 | KAN-6 (new) | To Do | created with `bug`, `foodme`, `fm-tc-06`, `basket`, `storefront` |

Not exercised by these 10 syncs: the comment paths (an open bug passing, or a Done bug failing again) need a new regression run. They will trigger on the first sync after the next `/run-regression`.
