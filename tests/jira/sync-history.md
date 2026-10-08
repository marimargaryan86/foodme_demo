# Jira sync history

One row per `sync-jira-bugs` run. `Map` is the case-to-ticket fingerprint (case numbers without `FM-TC-`). A repeat sync with no new regression run should show `Jira writes` = 0 and the same `Map`.

`bugs.md` is the sync's memory of which ticket belongs to which case; it carries over from earlier syncs.

Each sync runs in its own forked subagent. Run the batch of 10 with (type `/goal` by hand, then paste the rest on one line):

```
/goal Run /sync-jira-bugs once per turn until tests/jira/sync-history.md has 10 sync rows. Never start a sync while another is unfinished. If a sync can't reach Jira or reports anything under "Needs a decision", stop and tell me. After sync 10, write tests/jira/summary.md: whether the Map and Jira writes columns were stable across the 10 syncs (and why any changed), the durations, and what the skill learned (from each sync's Lessons learned changes and git log -p .agents/skills/sync-jira-bugs/SKILL.md). Stop after 14 turns at most.
```

| Sync | Started (UTC) | Duration | Regression run | Cases | Created | Labelled | Commented | Jira writes | Map | Changes vs previous |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 11:08:35 | 24s | run-010 | 3 | 0 | 0 | 1 | 1 | 01=KAN-5 04=KAN-4 06=KAN-6 | commented on KAN-6 (run 10 PASS); no map or status changes |
| 2 | 11:09:08 | 16s | run-010 | 3 | 0 | 0 | 0 | 0 | 01=KAN-5 04=KAN-4 06=KAN-6 | none |
| 3 | 11:09:34 | 10s | run-010 | 3 | 0 | 0 | 0 | 0 | 01=KAN-5 04=KAN-4 06=KAN-6 | none |
| 4 | 11:09:59 | 11s | run-010 | 3 | 0 | 0 | 0 | 0 | 01=KAN-5 04=KAN-4 06=KAN-6 | none |
| 5 | 11:10:20 | 13s | run-010 | 3 | 0 | 0 | 0 | 0 | 01=KAN-5 04=KAN-4 06=KAN-6 | none |
| 6 | 11:10:42 | 11s | run-010 | 3 | 0 | 0 | 0 | 0 | 01=KAN-5 04=KAN-4 06=KAN-6 | none |
| 7 | 11:11:02 | 11s | run-010 | 3 | 0 | 0 | 0 | 0 | 01=KAN-5 04=KAN-4 06=KAN-6 | none |
| 8 | 11:11:22 | 15s | run-010 | 3 | 0 | 0 | 0 | 0 | 01=KAN-5 04=KAN-4 06=KAN-6 | none |
| 9 | 11:11:48 | 13s | run-010 | 3 | 0 | 0 | 0 | 0 | 01=KAN-5 04=KAN-4 06=KAN-6 | none |
| 10 | 11:12:09 | 10s | run-010 | 3 | 0 | 0 | 0 | 0 | 01=KAN-5 04=KAN-4 06=KAN-6 | none |
