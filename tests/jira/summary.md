# Jira sync batch 2: 10 syncs under /goal

Date: 2026-10-08. Each sync ran `/sync-jira-bugs` in its own forked subagent against project `KAN`. Newest regression run in every sync: run-010. This batch started from a reset: empty `sync-history.md`, `bugs.md` restored to its state before batch 1 (`archive 20` as last run), and `SKILL.md` with the new `Last action` rule (commit eb3baee). Batch 1 is in git at 12b8bcb.

## Stability

| Column | Result |
|---|---|
| Map | Identical in all 10 syncs: `01=KAN-5 04=KAN-4 06=KAN-6`. No ticket was created or relabelled. |
| Jira writes | Sync 1: 1 (a comment on KAN-6: FM-TC-06 passed in run 10, please verify and close). Syncs 2–10: 0. Total 1. |
| Ticket statuses | Unchanged: KAN-5 To Do, KAN-4 Done, KAN-6 To Do. |
| Needs a decision | Empty in every sync. |

Why Jira writes changed once: `bugs.md` still held `archive 20` as the last run, so run-010 was new evidence for KAN-6. Sync 1 commented and recorded run-010; from then on the evidence matched and the skill wrote nothing. Same as batch 1, as designed.

## Last action (the fix being tested)

In batch 1, `Last action` kept `commented (sync 1)` for FM-TC-06 through syncs 2–5, and only sync 6 reset it to `none`. In this batch it behaved the same in every sync: sync 2 reset it to `none` immediately (its report says so), and `bugs.md` shows `none` on all three rows at the end. No sync carried an old action forward. The fix worked.

## Durations

Seconds: 24, 16, 10, 11, 13, 11, 11, 15, 13, 10. Sync 1 was slowest (24s, the only one with a write); syncs 2–10 took 10–16s (median 11s). Total 134s.

## What the skill learned

Nothing new. `Lessons learned` is still empty and `SKILL.md` has no commits after eb3baee (the `Last action` rule, made before the batch from batch 1's observations). No sync reported a problem in how it was done, so step 6 added no lessons.

## Observations (not changed)

- **The "always rewrite" part of the rule was not followed uniformly.** Syncs 3, 4, 5, 9 and 10 report that they left `bugs.md` untouched because every row already said `none`; syncs 2, 6 and 7 say they rewrote it; sync 8's report is unclear. The result is the same either way (the file content is identical), so nothing visible depended on it. If a sync should always rewrite the file, the skill needs a stronger wording or a check; if not, the rule should say "rewrite only when a row changes".
- KAN-6 is still To Do although FM-TC-06 passed in run-010. The skill only comments and never transitions, so closing it is a manual step. KAN-6 now has two "passed in run 10" comments, one from each batch, because `bugs.md` was reset on purpose.
- Only run-010 was in the window, so the create, label and reopen-comment paths were not exercised.
