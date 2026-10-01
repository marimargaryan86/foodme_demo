@AGENTS.md

## Claude Code

- PRs are auto-reviewed by `anthropics/claude-code-action` (`.github/workflows/claude-pr-review.yml`, needs the `ANTHROPIC_API_KEY` secret). Edit its `prompt:` to change what gets reviewed.
- Rules in `.claude/rules/` load automatically when Claude works on files matching their `paths:` frontmatter:
  - `e2e-tests.md`: `apps/web/e2e/` and `apps/admin/e2e/` (prod target, test data, locators, waiting).
  - `admin-e2e.md`: `apps/admin/e2e/` only (relative `#/` routes under `/backoffice/`, MUI locators, admin helpers).
- Skills live in `.agents/skills/`; `.claude/skills` is a symlink to it, so Claude Code loads them from there:
  - `/write-e2e-test <flow>`: manual only. Checks the deployed app is awake, writes a Playwright spec, runs it against the deployed app with `--repeat-each=3` and flags flakiness.
  - `triage-test-failure`: classifies failing test output as product bug, test bug, flaky or environment, and drafts a bug report.
