# Jira sync history

One row per `sync-jira-bugs` run. `Map` is the case-to-ticket fingerprint (case numbers without `FM-TC-`). A repeat sync with no new regression run should show `Jira writes` = 0 and the same `Map`.

`bugs.md` is the sync's memory of which ticket belongs to which case; it carries over from earlier syncs.

To check consistency, run it repeatedly, e.g. `/goal Run /sync-jira-bugs until tests/jira/sync-history.md has 10 syncs, then summarise in tests/jira/summary.md whether the Map and Jira writes columns were stable and what the skill learned`. Run the regression batch first, so the syncs have new regression runs to react to.

| Sync | Started (UTC) | Duration | Regression run | Cases | Created | Labelled | Commented | Jira writes | Map | Changes vs previous |
|---|---|---|---|---|---|---|---|---|---|---|
