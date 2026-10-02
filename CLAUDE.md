@AGENTS.md

## Claude Code

- PRs are auto-reviewed by `anthropics/claude-code-action` (`.github/workflows/claude-pr-review.yml`, needs the `ANTHROPIC_API_KEY` secret). Edit its `prompt:` to change what gets reviewed.
- Rules live in `.agents/rules/` (`.claude/rules` is a symlink to it; hooks likewise in `.agents/hooks/`). They load automatically when Claude works on files matching their `paths:` frontmatter:
  - `e2e-tests.md`: `apps/web/e2e/` and `apps/admin/e2e/` (prod target, test data, locators, waiting).
  - `admin-e2e.md`: `apps/admin/e2e/` only (relative `#/` routes under `/backoffice/`, MUI locators, admin helpers).
- Skills live in `.agents/skills/`; `.claude/skills` is a symlink to it, so Claude Code loads them from there:
  - `/write-e2e-test <flow>`: manual only. Checks the deployed app is awake, writes a Playwright spec, runs it against the deployed app with `--repeat-each=3` and flags flakiness.
  - `triage-test-failure`: classifies failing test output as product bug, test bug, flaky or environment, and drafts a bug report.
  - `/prepare-test-data [--dry-run]`: manual only. Wakes the deployed app and creates the customer and orders the manual cases in `tests/` need (`tests/prepare-data.mjs`).
  - `/cleanup-test-data [FM-… numbers] [--dry-run]`: manual only. Ends a test session: sets the run's still-active test orders to REJECTED (the API can't delete) and closes the browser tabs Claude opened (`tests/cleanup-data.mjs`).
  - `run-regression`: runs the agent-runnable steps of all 15 manual cases in Claude's Chrome tab group (needs a signed-in customer and admin there, once), records the result in `tests/regression/history.md` + `runs/`, compares with the previous run, cleans up and adds lessons to its own `Lessons learned`. Model-invocable so `/goal` can repeat it.
