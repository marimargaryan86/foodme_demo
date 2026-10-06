# Jira sync history

One row per `sync-jira-bugs` run. `Map` is the case-to-ticket fingerprint (case numbers without `FM-TC-`). A repeat sync with no new regression run should show `Jira writes` = 0 and the same `Map`.

`bugs.md` is the sync's memory of which ticket belongs to which case; it carries over from earlier syncs.

Each sync runs in its own forked subagent. Run the batch of 10 with (type `/goal` by hand, then paste the rest on one line):

```
/goal Run /sync-jira-bugs once per turn until tests/jira/sync-history.md has 10 sync rows. Never start a sync while another is unfinished. If a sync can't reach Jira or reports anything under "Needs a decision", stop and tell me. After sync 10, write tests/jira/summary.md: whether the Map and Jira writes columns were stable across the 10 syncs (and why any changed), the durations, and what the skill learned (from each sync's Lessons learned changes and git log -p .agents/skills/sync-jira-bugs/SKILL.md). Stop after 14 turns at most.
```

| Sync | Started (UTC) | Duration | Regression run | Cases | Created | Labelled | Commented | Jira writes | Map | Changes vs previous |
|---|---|---|---|---|---|---|---|---|---|---|
