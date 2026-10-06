# Regression history

One row per `/run-regression` run, written by `node tests/regression/record.mjs finish`. `Results` lists FM-TC-01 … FM-TC-15 in order, grouped by 5: `P` pass, `F` fail, `S` skip (human-only), `E` error (couldn't execute). Details are in [runs/](runs/). `Values` compares the run's `Observed values` (the fixed key list in the `run-regression` skill) with the previous run: `same`, the number of changed keys, or `n/a` for run 1. What each run changed in the skill is in its run file (**Skill changes**) and in `git log -p .agents/skills/run-regression/SKILL.md`.

Run the batch of 10 with:

```
/goal Run /run-regression once per turn until `node tests/regression/record.mjs status` reports "runs 10". Never start a run while another is unfinished. If a run reports anything under "Needs the user", stop and tell me. After run 10, write tests/regression/summary.md: whether the Results and Values columns were identical across the 10 runs (and why any differed: app or agent), the durations, and what the skill learned (from each run's Skill changes and git log -p .agents/skills/run-regression/SKILL.md). Stop after 14 turns at most.
```

| Run | Started (UTC) | Duration | Pass | Fail | Skip | Error | Results | Values | Changes vs previous |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-10-06 14:06 | 10m18s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | n/a | first run |
| 2 | 2026-10-06 14:17 | 8m17s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | same | none |
| 3 | 2026-10-06 14:26 | 9m28s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | same | none |
| 4 | 2026-10-06 14:35 | 7m55s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | same | none |
| 5 | 2026-10-06 14:44 | 6m57s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | same | none |
