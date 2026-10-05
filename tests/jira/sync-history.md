# Jira sync history

One row per `sync-jira-bugs` run. `Map` is the case-to-ticket fingerprint (case numbers without `FM-TC-`). A repeat sync with no new regression run should show `Jira writes` = 0 and the same `Map`.

To check consistency, run it repeatedly, e.g. `/goal Run /sync-jira-bugs until tests/jira/sync-history.md has 10 syncs, then summarise whether the Map and Jira writes columns were stable and what the skill learned`.

| Sync | Started (UTC) | Duration | Regression run | Cases | Created | Labelled | Commented | Jira writes | Map | Changes vs previous |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-10-05 16:54 | 4m | 20 | 3 | 1 | 2 | 0 | 3 | `01=KAN-5 04=KAN-4 06=KAN-6` | first sync: created KAN-6 (FM-TC-06); labelled KAN-5, KAN-4 with fm-tc-NN + foodme. Skill: label edits now read labels via getJiraIssue first (JQL results omit them); lookups in one JQL |
| 2 | 2026-10-05 16:58 (corrected; was estimated as 17:00) | ~1m | 20 | 3 | 0 | 0 | 0 | 0 | `01=KAN-5 04=KAN-4 06=KAN-6` | none (no new run; all labels present). Skill: mapped tickets confirmed with one paired JQL instead of one getJiraIssue per ticket |
| 3 | 2026-10-05 16:59 | 1m | 20 | 3 | 0 | 0 | 0 | 0 | `01=KAN-5 04=KAN-4 06=KAN-6` | none. Sync 2's start time had been estimated; corrected. Skill: start/duration now from `date -u` |
| 4 | 2026-10-05 17:00 | 1m | 20 | 3 | 0 | 0 | 0 | 0 | `01=KAN-5 04=KAN-4 06=KAN-6` | none. Skill: one fixed collection command in step 2 (syncs 3 and 4 had used different greps) |
| 5 | 2026-10-05 17:01 | 1m | 20 | 3 | 0 | 0 | 0 | 0 | `01=KAN-5 04=KAN-4 06=KAN-6` | none |
| 6 | 2026-10-05 17:02 | 1m | 20 | 3 | 0 | 0 | 0 | 0 | `01=KAN-5 04=KAN-4 06=KAN-6` | none |
| 7 | 2026-10-05 17:02:48 | 14s | 20 | 3 | 0 | 0 | 0 | 0 | `01=KAN-5 04=KAN-4 06=KAN-6` | none. Skill: start to the second and duration in seconds from a saved timestamp (syncs 4–6 were rounded to 1m) |
| 8 | 2026-10-05 17:03:14 | 6s | 20 | 3 | 0 | 0 | 0 | 0 | `01=KAN-5 04=KAN-4 06=KAN-6` | none |
