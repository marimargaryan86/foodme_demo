# Jira sync history

One row per `sync-jira-bugs` run. `Map` is the case-to-ticket fingerprint (case numbers without `FM-TC-`). A repeat sync with no new regression run should show `Jira writes` = 0 and the same `Map`.

`bugs.md` is the sync's memory of which ticket belongs to which case; it carries over from earlier syncs.

Each sync runs in its own forked subagent. Run the batch of 10 with (type `/goal` by hand, then paste the rest on one line):

```
/goal Run /sync-jira-bugs once per turn until tests/jira/sync-history.md has 10 sync rows. Never start a sync while another is unfinished. If a sync can't reach Jira or reports anything under "Needs a decision", stop and tell me. After sync 10, write tests/jira/summary.md: whether the Map and Jira writes columns were stable across the 10 syncs (and why any changed), the durations, and what the skill learned (from each sync's Lessons learned changes and git log -p .agents/skills/sync-jira-bugs/SKILL.md). Stop after 14 turns at most.
```

| Sync | Started (UTC) | Duration | Regression run | Cases | Created | Labelled | Commented | Jira writes | Map | Changes vs previous |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 15:50:05 | 19s | run-010 | 3 | 0 | 0 | 1 | 1 | 01=KAN-5 04=KAN-4 06=KAN-6 | commented KAN-6 (FM-TC-06 passed in run 10); map and statuses unchanged |
| 2 | 15:50:34 | 10s | run-010 | 3 | 0 | 0 | 0 | 0 | 01=KAN-5 04=KAN-4 06=KAN-6 | none (run-010 already recorded; map and statuses unchanged) |
| 3 | 15:50:53 | 9s | run-010 | 3 | 0 | 0 | 0 | 0 | 01=KAN-5 04=KAN-4 06=KAN-6 | none (run-010 already recorded; map and statuses unchanged) |
| 4 | 15:51:11 | 13s | run-010 | 3 | 0 | 0 | 0 | 0 | 01=KAN-5 04=KAN-4 06=KAN-6 | none (run-010 already recorded; map and statuses unchanged) |
| 5 | 15:51:33 | 15s | run-010 | 3 | 0 | 0 | 0 | 0 | 01=KAN-5 04=KAN-4 06=KAN-6 | none (run-010 already recorded; map and statuses unchanged) |
| 6 | 15:51:57 | 11s | run-010 | 3 | 0 | 0 | 0 | 0 | 01=KAN-5 04=KAN-4 06=KAN-6 | none (run-010 already recorded; map and statuses unchanged) |
| 7 | 15:52:16 | 10s | run-010 | 3 | 0 | 0 | 0 | 0 | 01=KAN-5 04=KAN-4 06=KAN-6 | none (run-010 already recorded; map and statuses unchanged) |
| 8 | 15:52:35 | 9s | run-010 | 3 | 0 | 0 | 0 | 0 | 01=KAN-5 04=KAN-4 06=KAN-6 | none (run-010 already recorded; map and statuses unchanged) |
| 9 | 15:52:54 | 9s | run-010 | 3 | 0 | 0 | 0 | 0 | 01=KAN-5 04=KAN-4 06=KAN-6 | none (run-010 already recorded; map and statuses unchanged) |
| 10 | 15:53:11 | 8s | run-010 | 3 | 0 | 0 | 0 | 0 | 01=KAN-5 04=KAN-4 06=KAN-6 | none (run-010 already recorded; map and statuses unchanged) |
