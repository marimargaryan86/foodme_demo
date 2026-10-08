# FoodMe bugs in Jira

Case-to-ticket map kept by the `sync-jira-bugs` skill (project `KAN`, https://marimargaryan86.atlassian.net). The skill rewrites this table on every sync; edit it by hand only to fix a wrong match. `archive 20` means run 20 of an earlier regression batch that has since been deleted (it's in git history); the current history starts again at run 1.

| Case | Ticket | Ticket status | Kind | Last run | Last result | Last action |
|---|---|---|---|---|---|---|
| FM-TC-01 | KAN-5 | To Do | known issue, failing | archive 20 | FAIL | labelled (sync 1) |
| FM-TC-04 | KAN-4 | Done | bug regression (FM-BUG-07) | archive 20 | PASS | labelled (sync 1) |
| FM-TC-06 | KAN-6 | To Do | known issue | archive 20 | PASS | created (sync 1) |
