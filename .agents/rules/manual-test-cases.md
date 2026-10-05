---
paths:
  - "tests/*.md"
---
# Manual test case rules
The manual cases in `tests/*.md` (`browsing`, `cart`, `checkout`, `account`, `back-office`) and their index in `tests/README.md`. Human testers and `/run-regression` both run them, so a wording change changes what gets tested. Keep the format below exactly.

## Case format
- Heading: `## FM-TC-NN: Title`. `NN` is two digits and unique across all files. A new case takes the next free number; never renumber existing ones (run history and bug notes refer to them).
- Metadata lines, in this order:
  - `- **Priority:** High|Medium · **Type:** …` (e.g. `Functional`, `Negative`, `Business rule`; a bug regression adds `regression for FM-BUG-NN (what was wrong)`)
  - `- **Preconditions:** …` (the README's P1/P2/P3, or "none")
  - `- **Agent run:** full | steps N–M | step N only | human-only`, with the reason for any human-only part (e.g. "needs a private window"). `/run-regression` reads this line and reports steps outside it as `SKIP`.
- Steps are a table `| # | Step | Expected result |`, numbered from 1, one action per step. Quote UI text exactly as the page shows it; buttons and links in bold (**Place order**).
- Optional `**Note:**` paragraph after the table for facts that explain an expectation.
- A confirmed product bug goes in a `**Known issue (found YYYY-MM-DD):** …` paragraph after the table (add `, regression run N` when a run found it): which step fails, what the app shows, and the cause if known (file:line). Keep it while the bug exists, and don't change the step.

## Expected results
- Never rewrite an expected result to match what the app does. If the app disagrees with a case, the case stands unless the requirement itself changed (say so in the commit message). Otherwise record a Known issue, and the run reports FAIL.

## Keep in sync
- A new, renamed or re-scoped case needs its row in the `tests/README.md` index: ID link with the right `#fm-tc-…` anchor, title, area, type, priority, agent run. Update the case count wherever it's stated ("15 manual test cases", the `run-regression` skill).
- If a change affects the regression's fixed data or case order, update `.agents/skills/run-regression/SKILL.md` too.

## Test data
- Follow the README's "Test data rules": prod data is shared. Create your own customers and orders; never edit, deactivate or delete chefs or dishes; only change the status of orders you placed.
- Emails `qa-<yourname>-<yyyymmdd>-<n>@example.com`, password `secret123`, phone `+37490000000`. No real personal data in a case.
