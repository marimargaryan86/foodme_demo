---
name: triage-test-failure
description: Triage failing Playwright e2e output from FoodMe tests run against the deployed app, classify it as product bug, test bug, flaky or environment, and draft a bug report. Use when the user pastes a test failure or asks why a test failed.
argument-hint: <failing test output, or a path to it>
---

# Triage a test failure

Input: the failing output the user pasted, or `$ARGUMENTS`. If there's no output, ask for it.

The tests run against the deployed app: `BASE=${PLAYWRIGHT_BASE_URL:-https://foodme-marimargaryan86.onrender.com}`.

## 1. Rule out the environment first

These are cheap to check, so check them before reading code:

```bash
curl -s -m 60 -o /dev/null -w '%{http_code} %{time_total}s\n' "$BASE/actuator/health"
```

Typical environment signs:
- Timeouts or 502/503 from `*.onrender.com`: the free-tier service is asleep or restarting. Wait 1–3 minutes, rerun, and only go further if it fails again.
- Many unrelated tests timing out in one run: the 0.1-CPU instance is overloaded. Rerun with `--workers=1` or `2`.
- `ECONNREFUSED` on `localhost:8081`, or Playwright's `webServer` starting `npm run dev`: the env vars weren't set, so the run targeted localhost. Rerun with `PLAYWRIGHT_BASE_URL`, `VITE_API_BASE_URL` and `ADMIN_BASE_URL=$BASE/backoffice/`.
- An admin test that lands on the storefront: it navigates with `"/#/..."` instead of `"#/..."`. That's a test bug, not environment.

If a Grafana MCP server is configured, check the live logs for the failing request (`{app="foodme-backend"}` in Loki) and `up{app="foodme-backend"}` in Prometheus.

## 2. Check whether it's intentional

Read the "Intentional course behavior" list in `AGENTS.md`. A failure caused by anything there is **not a product bug**. That includes the `flake-*.spec.ts` specs, `/api/debug/boom`, the flaky heartbeat and the 200–1500 ms latency.

## 3. Classify

Read the failing spec and the code under test, then pick exactly one category:

| Category | Signs |
|---|---|
| **Environment** | Step 1 found a problem; the failure is about connections, cold starts or overload, not assertions |
| **Flaky** | Passes on rerun (`--repeat-each=3`); timing-dependent; fixed waits; it's a `flake-*` spec |
| **Test bug** | Wrong or stale locator, wrong expectation, shared or hardcoded data, wrong URL, the test breaks `.agents/rules/e2e-tests.md` |
| **Product bug** | The test's expectation matches the intended behavior and the deployed app does something else, reproducibly |

The deployed build can lag behind local source. If a locator matches local code but not the live page, the deploy is out of date; say so rather than calling it a test bug.

If it isn't clear, rerun the single test before deciding:

```bash
PLAYWRIGHT_BASE_URL=$BASE VITE_API_BASE_URL=$BASE ADMIN_BASE_URL=$BASE/backoffice/ \
  npx playwright test <file> -g "<name>" --repeat-each=3 --workers=1 --reporter=list
```

Give the evidence for your call: file:line, and the log lines or assertion diff.

## 4. Draft a bug report

Always end with this, filled in. For anything other than a product bug, write it for the test or infra fix instead:

```
Title:     <component>: <what's wrong, in one line>
Category:  Product bug | Test bug | Flaky | Environment
Steps:     1. ...  2. ...  3. ...
Expected:  ...
Actual:    ...
Evidence:  <test name, file:line, error message, assertion diff, trace/screenshot path, Loki/Prometheus query>
```

## Lessons learned
