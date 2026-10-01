---
name: triage-test-failure
description: Triage failing test output from FoodMe (Playwright e2e or Gradle/JUnit), classify it as product bug, test bug, flaky or environment, and draft a bug report. Use when the user pastes a test failure or asks why a test failed.
argument-hint: <failing test output, or a path to it>
---

# Triage a test failure

Input: the failing output the user pasted, or `$ARGUMENTS`. If there's no output, ask for it.

## 1. Rule out the environment first

These are cheap to check, so check them before reading code:

```bash
curl -sf -m 5 http://localhost:8081/actuator/health   # backend up?
pg_isready -h localhost -p 5432                       # Postgres up?
```

Typical environment signs:
- `ECONNREFUSED` / `net::ERR_CONNECTION_REFUSED` on :8081 means the backend isn't running.
- A backend that won't start, with `Connection to localhost:5432 refused` or a Flyway error, means Postgres is missing or the DB isn't `foodme`.
- The Playwright `webServer` timing out means the dev server port (:5180 web, :5174 admin) is busy, or `npm install` hasn't been run.
- Timeouts against `*.onrender.com` mean the free-tier service is probably asleep. Retry after 1–3 minutes before going further.

## 2. Check whether it's intentional

Read the "Intentional course behavior" list in `AGENTS.md`. A failure caused by anything there is **not a product bug**. That includes the `flake-*.spec.ts` specs, `/api/debug/boom`, the flaky heartbeat and the 200–1500 ms latency.

## 3. Classify

Read the failing spec or test and the code under test, then pick exactly one category:

| Category | Signs |
|---|---|
| **Environment** | Step 1 found a problem; the failure is about connections or startup, not assertions |
| **Flaky** | Passes on rerun (`--repeat-each=3`); timing-dependent; fixed waits; it's a `flake-*` spec |
| **Test bug** | Wrong or stale locator, wrong expectation, shared or hardcoded data, the test breaks the rules in `.claude/rules/` |
| **Product bug** | The test's expectation matches the intended behavior and the app does something else, reproducibly |

If it isn't clear, rerun the single test (`npx playwright test <file> -g "<name>" --repeat-each=3`, or `./gradlew test --tests '<Class>.<method>'`) before deciding. Give the evidence for your call: file:line, and the log lines or assertion diff.

## 4. Draft a bug report

Always end with this, filled in. For anything other than a product bug, write it for the test or infra fix instead:

```
Title:     <component>: <what's wrong, in one line>
Category:  Product bug | Test bug | Flaky | Environment
Steps:     1. ...  2. ...  3. ...
Expected:  ...
Actual:    ...
Evidence:  <test name, file:line, error message, assertion diff, trace/screenshot path, Loki/Prometheus query if live>
```

## Lessons learned
