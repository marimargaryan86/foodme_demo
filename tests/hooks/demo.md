# Hook demo: block-test-waits

Date: 2026-10-08. Hook: `.agents/hooks/block-test-waits.mjs` (PreToolUse on Write|Edit|MultiEdit, registered in `.claude/settings.json`).

## What was tried

The agent was asked to add `await page.waitForTimeout(1000);` after `page.goto("/")` in the first test of `apps/web/e2e/layout.spec.ts`, using the Edit tool.

## Result: blocked

The edit never reached the file. The hook returned:

```
PreToolUse:Edit hook error: [node "$CLAUDE_PROJECT_DIR/.claude/hooks/block-test-waits.mjs"]:
Blocked: fixed wait `waitForTimeout(` added to /Users/mari/foodme_demo/apps/web/e2e/layout.spec.ts.
Use a web-first assertion, e.g. await expect(locator).toBeVisible({ timeout: 15000 });
see .agents/rules/e2e-tests.md
```

`git status` was clean afterwards, so `layout.spec.ts` is unchanged.

## Notes

- An earlier Edit attempt failed with "Found 2 matches" before any hook ran, because the `old_string` was not unique. That is an Edit error, not a hook result. The second attempt, with a unique `old_string`, is the one the hook blocked.
- Limitation, as documented in `AGENTS.md`: edits made through Bash (`sed`, `echo >>`) are not checked.
- Unit tests for the hook: `node --test "tests/hooks/*.test.mjs"` (9 pass).
