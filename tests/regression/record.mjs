#!/usr/bin/env node
// Bookkeeping for the run-regression skill, so the agent only fills in what it observed.
//
//   node tests/regression/record.mjs start         # next run number, writes the run-NNN.md skeleton, prints its path
//   node tests/regression/record.mjs finish NNN    # checks run-NNN.md, fills duration + changes vs previous, appends history row
//   node tests/regression/record.mjs status        # batch so far: runs, identical results/values, durations
//   node tests/regression/record.mjs abort NNN     # deletes an unfinished run-NNN.md (a run stopped before it was recorded)
//
// The fixed key list is read from the skill (.agents/skills/run-regression/SKILL.md), so it has one source.
// A value or result left as `?` makes `finish` fail: write `n/a` for anything that wasn't observed.

import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const RUNS = join(HERE, "runs");
const HISTORY = join(HERE, "history.md");
const SKILL = join(ROOT, ".agents", "skills", "run-regression", "SKILL.md");
const APP = process.env.FOODME_BASE_URL || "https://foodme-marimargaryan86.onrender.com";
const CASES = Array.from({ length: 15 }, (_, i) => `FM-TC-${String(i + 1).padStart(2, "0")}`);
const LETTER = { PASS: "P", FAIL: "F", SKIP: "S", ERROR: "E" };

const die = (msg) => {
  console.error(`record.mjs: ${msg}`);
  process.exit(1);
};
const pad3 = (n) => String(n).padStart(3, "0");
const runFile = (n) => join(RUNS, `run-${pad3(n)}.md`);

function keys() {
  const skill = readFileSync(SKILL, "utf8");
  const block = skill.split("### Observed values: the fixed key list")[1]?.match(/```\n([\s\S]*?)```/);
  if (!block) die(`no fixed key list found in ${SKILL}`);
  return block[1].split("\n").map((l) => l.trim().split(/\s+/)[0]).filter(Boolean);
}

function historyRows() {
  return readFileSync(HISTORY, "utf8")
    .split("\n")
    .filter((l) => /^\| \d+ \|/.test(l))
    .map((l) => {
      const c = l.split("|").map((s) => s.trim());
      return { run: Number(c[1]), started: c[2], duration: c[3], results: c[8].replace(/`/g, ""), values: c[9] };
    });
}

function parseRun(n) {
  const file = runFile(n);
  if (!existsSync(file)) die(`${file} not found`);
  const text = readFileSync(file, "utf8");
  const results = {};
  for (const m of text.matchAll(/^\| (FM-TC-\d\d) \| (\S+) \|/gm)) results[m[1]] = m[2];
  const values = {};
  const block = text.split("## Observed values")[1]?.match(/```\n([\s\S]*?)```/);
  for (const line of (block?.[1] ?? "").split("\n").filter(Boolean)) {
    const i = line.indexOf("=");
    values[line.slice(0, i)] = line.slice(i + 1);
  }
  const started = text.match(/\*\*Started:\*\* (\S+)/)?.[1];
  return { file, text, results, values, started };
}

function letters(results) {
  const s = CASES.map((c) => LETTER[results[c]] ?? "?").join("");
  return `${s.slice(0, 5)} ${s.slice(5, 10)} ${s.slice(10)}`;
}

function fmtDuration(ms) {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}m${String(s % 60).padStart(2, "0")}s`;
}

function start() {
  const rows = historyRows();
  const n = rows.length ? rows.at(-1).run + 1 : 1;
  if (existsSync(runFile(n))) die(`${runFile(n)} already exists (an unfinished run?). Finish it or delete it first.`);
  mkdirSync(RUNS, { recursive: true });
  const now = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  const body = [
    `# Regression run ${pad3(n)}`,
    "",
    `- **Started:** ${now} · **Duration:** _filled by record.mjs finish_`,
    `- **App:** ${APP}`,
    "- **Sessions:** storefront customer and admin signed in · **Method:** page tools only (no JavaScript)",
    "",
    "| Case | Result | Note |",
    "|---|---|---|",
    ...CASES.map((c) => `| ${c} | ? | |`),
    "",
    "## Observed values",
    "",
    "```",
    ...keys().map((k) => `${k}=?`),
    "```",
    "",
    "## Changes vs previous run",
    "",
    "_filled by record.mjs finish_",
    "",
    "## Proposed case fixes",
    "",
    "None.",
    "",
    "## Execution problems",
    "",
    "None.",
    "",
    "## Cleanup",
    "",
    "_order numbers and final statuses_",
    "",
    "## Skill changes",
    "",
    "_filled in skill step 5_",
    "",
  ].join("\n");
  writeFileSync(runFile(n), body);
  console.log(`run ${n}\nstarted ${now}\nfile ${runFile(n)}`);
}

function finish(n) {
  if (!n) die("usage: record.mjs finish NNN");
  if (historyRows().some((r) => r.run === n)) die(`run ${n} is already in history.md`);
  const run = parseRun(n);
  const expected = keys();
  const problems = [];
  for (const c of CASES) if (!LETTER[run.results[c]]) problems.push(`${c}: result must be PASS/FAIL/SKIP/ERROR, is "${run.results[c] ?? "missing"}"`);
  const got = Object.keys(run.values);
  if (got.join() !== expected.join()) {
    const missing = expected.filter((k) => !got.includes(k));
    const extra = got.filter((k) => !expected.includes(k));
    problems.push(`observed keys differ from the fixed list${missing.length ? `; missing ${missing.join(", ")}` : ""}${extra.length ? `; extra ${extra.join(", ")}` : ""}${!missing.length && !extra.length ? "; wrong order" : ""}`);
  }
  for (const [k, v] of Object.entries(run.values)) if (v === "?" || v === "") problems.push(`${k} is not filled (use n/a if it wasn't observed)`);
  if (!run.started) problems.push("header has no **Started:** time");
  if (problems.length) die(`run-${pad3(n)}.md isn't complete:\n  - ${problems.join("\n  - ")}`);

  const duration = fmtDuration(Date.now() - Date.parse(run.started));
  const prevN = readdirSync(RUNS)
    .map((f) => Number(f.match(/^run-(\d+)\.md$/)?.[1]))
    .filter((x) => x && x < n)
    .sort((a, b) => a - b)
    .at(-1);

  let changes, valuesCol, summary;
  if (!prevN) {
    changes = "First run.";
    valuesCol = "n/a";
    summary = "first run";
  } else {
    const prev = parseRun(prevN);
    const caseChanges = CASES.filter((c) => prev.results[c] !== run.results[c]).map(
      (c) => `${c} ${LETTER[prev.results[c]] ?? "?"}→${LETTER[run.results[c]]}`,
    );
    const keyChanges = expected.filter((k) => prev.values[k] !== run.values[k]);
    valuesCol = keyChanges.length ? String(keyChanges.length) : "same";
    const lines = [
      ...caseChanges.map((c) => `- Result: ${c}`),
      ...keyChanges.map((k) => `- \`${k}\`: ${prev.values[k] ?? "missing"} → ${run.values[k]}`),
    ];
    changes = lines.length
      ? `Compared with run ${prevN}:\n\n${lines.join("\n")}`
      : `None: same result letters, all ${expected.length} observed values identical to run ${prevN}.`;
    const shown = keyChanges.slice(0, 3).join(", ") + (keyChanges.length > 3 ? ", …" : "");
    summary = [caseChanges.join(", "), keyChanges.length ? `values: ${shown}` : ""].filter(Boolean).join("; ") || "none";
  }

  const text = run.text
    .replace(/\*\*Duration:\*\* _filled by record\.mjs finish_/, `**Duration:** ${duration}`)
    .replace(/(## Changes vs previous run\n\n)_filled by record\.mjs finish_/, `$1${changes}`);
  writeFileSync(run.file, text);

  const count = (r) => CASES.filter((c) => run.results[c] === r).length;
  const row = `| ${n} | ${run.started.slice(0, 16).replace("T", " ")} | ${duration} | ${count("PASS")} | ${count("FAIL")} | ${count("SKIP")} | ${count("ERROR")} | \`${letters(run.results)}\` | ${valuesCol} | ${summary} |`;
  appendFileSync(HISTORY, `${row}\n`);
  console.log(row);
}

function status() {
  const rows = historyRows();
  if (!rows.length) return console.log("runs 0");
  const base = rows[0].results;
  const secs = rows.map((r) => {
    const m = r.duration.match(/(\d+)m(\d+)s/);
    return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
  });
  const sorted = [...secs].sort((a, b) => a - b);
  console.log(`runs ${rows.length}`);
  console.log(`results identical to run ${rows[0].run}: ${rows.filter((r) => r.results === base).length}/${rows.length} (${[...new Set(rows.map((r) => r.results))].join(" / ")})`);
  console.log(`values same as previous run: ${rows.filter((r) => r.values === "same").length}/${Math.max(rows.length - 1, 0)}`);
  console.log(`duration min ${fmtDuration(sorted[0] * 1000)} · median ${fmtDuration(sorted[Math.floor(sorted.length / 2)] * 1000)} · max ${fmtDuration(sorted.at(-1) * 1000)}`);
}

function abort(n) {
  if (!n) die("usage: record.mjs abort NNN");
  if (historyRows().some((r) => r.run === n)) die(`run ${n} is recorded in history.md; not deleting it`);
  if (!existsSync(runFile(n))) die(`${runFile(n)} not found`);
  unlinkSync(runFile(n));
  console.log(`deleted unfinished ${runFile(n)}`);
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === "start") start();
else if (cmd === "finish") finish(Number(arg));
else if (cmd === "abort") abort(Number(arg));
else if (cmd === "status") status();
else die("usage: record.mjs start | finish NNN | abort NNN | status");
