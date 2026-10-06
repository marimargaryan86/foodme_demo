# Regression history

One row per `/run-regression` run. `Results` lists FM-TC-01 … FM-TC-15 in order, grouped by 5: `P` pass, `F` fail, `S` skip (human-only), `E` error (couldn't execute). Details are in [runs/](runs/). `Values` compares the run's `Observed values` (the fixed key list in the `run-regression` skill) with the previous run: `same`, the number of changed keys, or `n/a` for run 1.

This history starts with the page-tools-only version of the skill (no JavaScript). The earlier 20 runs, made with JavaScript and then with script files, are archived in [archive/2026-10-05/](archive/2026-10-05/) with their own [summary](archive/2026-10-05/summary.md).

To check consistency, run it repeatedly, e.g. `/goal Run /run-regression until tests/regression/history.md has 10 runs, then summarise in tests/regression/summary.md whether the Results and Values columns were identical across runs and what the skill learned`.

| Run | Started (UTC) | Duration | Pass | Fail | Skip | Error | Results | Values | Changes vs previous |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-10-06 10:46 | 26m50s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | n/a | first run |
