@AGENTS.md

## Claude Code

- PRs are auto-reviewed by `anthropics/claude-code-action` (`.github/workflows/claude-pr-review.yml`, needs the `ANTHROPIC_API_KEY` secret). Edit its `prompt:` to change what gets reviewed.
- `.claude/rules/e2e-tests.md` loads automatically when Claude works on files under `apps/web/e2e/` or `apps/admin/e2e/`.
- Skills in `.claude/skills/`:
  - `/write-e2e-test <flow>`: manual only. Checks the backend on :8081, writes a Playwright spec, runs it with `--repeat-each=3` and flags flakiness.
  - `triage-test-failure`: classifies failing test output as product bug, test bug, flaky or environment, and drafts a bug report.
