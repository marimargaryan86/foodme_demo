# Regression history

One row per `/run-regression` run, written by `node tests/regression/record.mjs finish`. `Results` lists FM-TC-01 … FM-TC-15 in order, grouped by 5: `P` pass, `F` fail, `S` skip (human-only), `E` error (couldn't execute). Details are in [runs/](runs/). `Values` compares the run's `Observed values` (the fixed key list in the `run-regression` skill) with the previous run: `same`, the number of changed keys, or `n/a` for run 1. What each run changed in the skill is in its run file (**Skill changes**) and in `git log -p .agents/skills/run-regression/SKILL.md`.

Earlier batches are archived: the first 20 runs (JavaScript, then script files) in [archive/2026-10-05/](archive/2026-10-05/) with their [summary](archive/2026-10-05/summary.md), and two trial runs with page tools only in one long conversation (21–27 min each) in [archive/2026-10-06-trial/](archive/2026-10-06-trial/). This batch uses the Playwright MCP browser's page tools only (earlier runs used Claude in Chrome), with each run in its own forked subagent and the bookkeeping done by `record.mjs`.

Run the batch of 10 with:

```
/goal Run /run-regression once per turn until `node tests/regression/record.mjs status` reports "runs 10". Never start a run while another is unfinished. If a run reports anything under "Needs the user", stop and tell me. After run 10, write tests/regression/summary.md: whether the Results and Values columns were identical across the 10 runs (and why any differed: app or agent), the durations, and what the skill learned (from each run's Skill changes and git log -p .agents/skills/run-regression/SKILL.md). Stop after 14 turns at most.
```

| Run | Started (UTC) | Duration | Pass | Fail | Skip | Error | Results | Values | Changes vs previous |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-10-06 13:43 | 7m43s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | n/a | first run |
