# Jira sync batch: 10 syncs under /goal

Date: 2026-10-06. Each sync ran `/sync-jira-bugs` in its own forked subagent against project `KAN`. Newest regression run in every sync: run-010.

## Stability

| Column | Result |
|---|---|
| Map | Identical in all 10 syncs: `01=KAN-5 04=KAN-4 06=KAN-6`. No ticket was created or relabelled. |
| Jira writes | Sync 1: 1 (a comment on KAN-6: FM-TC-06 passed in run 10, please verify and close). Syncs 2–10: 0. Total 1. |
| Ticket statuses | Unchanged: KAN-5 To Do, KAN-4 Done, KAN-6 To Do. |
| Needs a decision | Empty in every sync. |

Why Jira writes changed once: `bugs.md` still held the "archive 20" entries from the deleted earlier batch, so run-010 counted as new evidence for KAN-6. Sync 1 commented and recorded run-010; from then on the evidence matched and the skill wrote nothing, as designed. The idempotency rule held.

## Durations

Seconds: 19, 10, 9, 13, 15, 11, 10, 9, 9, 8. Sync 1 was slowest (19s, the only one with a write); syncs 2–10 took 8–15s (median 10s). Total about 113s.

## What the skill learned

Nothing. `git log -p` shows `SKILL.md` has no uncommitted changes and no commits during this batch (last commit c2b10cb, before it), and `Lessons learned` is still empty. No sync hit a problem in how it was done, so step 6 correctly added no lessons.

## Observations (not changed)

- `bugs.md` "Last action" kept `commented (sync 1)` for FM-TC-06 through syncs 2–5; sync 6 reset it to `none`. The skill doesn't say whether to rewrite `bugs.md` when nothing changed, so syncs differed. A one-line rule in step 5 would make this uniform.
- KAN-6 is still To Do although FM-TC-06 passed in run-010; the sync only comments and never transitions, so closing it is a manual step.
- The regression had only one run (run-010) in the window, so the batch did not exercise the create, label or reopen-comment paths.
