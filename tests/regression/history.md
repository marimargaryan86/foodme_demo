# Regression history

One row per `/run-regression` run. `Results` lists FM-TC-01 … FM-TC-15 in order, grouped by 5: `P` pass, `F` fail, `S` skip (human-only), `E` error (couldn't execute). Details are in [runs/](runs/).

To check consistency, run it repeatedly, e.g. `/goal Run /run-regression until tests/regression/history.md has 10 runs, then summarise whether the Results column was identical across runs and what the skill learned`.

| Run | Started (UTC) | Duration | Pass | Fail | Skip | Error | Results | Changes vs previous |
|---|---|---|---|---|---|---|---|---|
| 1 | 2026-10-02 13:24 | 8m33s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | first run |
| 2 | 2026-10-02 15:57 | 7m45s | 12 | 1 | 1 | 1 | `FPPPP PPPPP PSPPE` | FM-TC-15 P→E (background-tab timing) |
| 3 | 2026-10-02 16:05 | 5m27s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | FM-TC-15 E→P (run 2 lesson applied) |
| 4 | 2026-10-02 16:11 | 5m19s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | none |
| 5 | 2026-10-02 16:17 | 5m20s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | none |
