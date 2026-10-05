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
| 6 | 2026-10-02 16:22 | 5m28s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | none |
| 7 | 2026-10-02 16:28 | 5m19s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | none |
| 8 | 2026-10-02 16:33 | 5m14s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | none |
| 9 | 2026-10-02 16:39 | 5m23s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | none |
| 10 | 2026-10-02 16:44 | 5m25s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | none |
| 11 | 2026-10-05 12:20 | 5m18s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | none |
| 12 | 2026-10-05 12:26 | 5m4s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | none |
| 13 | 2026-10-05 12:31 | 5m22s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | none |
| 14 | 2026-10-05 12:36 | 5m22s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | none |
| 15 | 2026-10-05 12:41 | 5m20s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | none |
| 16 | 2026-10-05 12:47 | 5m20s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | none |
| 17 | 2026-10-05 12:52 | 9m18s | 12 | 2 | 1 | 0 | `FPPPP FPPPP PSPPP` | FM-TC-06 P→F (app showed "Chef not found" for an existing chef; transient) |
| 18 | 2026-10-05 13:02 | 17m55s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | FM-TC-06: FAIL → PASS. The transient "Chef not found" from run 17 did not reproduce. |
| 19 | 2026-10-05 15:08 | 7m19s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | none |
| 20 | 2026-10-05 15:16 | 10m50s | 13 | 1 | 1 | 0 | `FPPPP PPPPP PSPPP` | none |
