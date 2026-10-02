#!/usr/bin/env node
// Cleans up the data tests/prepare-data.mjs created for a manual test run.
//
//   node tests/cleanup-data.mjs                  # clean up the run in tests/.run-data.md
//   node tests/cleanup-data.mjs FM-100018 ...    # also clean up orders placed during the run (e.g. checkout cases)
//   node tests/cleanup-data.mjs --dry-run        # show what would happen; changes nothing
//
// The API has no delete endpoints, so nothing is deleted. Every test order that is still
// active (NEW or ACCEPTED) is moved to REJECTED with a "test data cleanup" reason, so it
// drops out of the kitchen's work queue and the dashboard totals. DELIVERED and REJECTED
// orders are final and are left as they are. The test customer cannot be removed.
//
// Safety: an order is only touched if it belongs to the run's customer (receiver email) or
// its number was passed on the command line. Anything else is skipped.

import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.FOODME_BASE_URL || "https://foodme-marimargaryan86.onrender.com";
const DRY_RUN = process.argv.includes("--dry-run");
const EXTRA = process.argv.slice(2).filter((a) => /^FM-\d+$/.test(a));
const RUN_FILE = join(dirname(fileURLToPath(import.meta.url)), ".run-data.md");
const REASON = `Test data cleanup (${new Date().toISOString().slice(0, 10)})`;

async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${await res.text()}`);
  return res.json();
}

function readRun() {
  if (!existsSync(RUN_FILE)) return { email: null, numbers: [] };
  const text = readFileSync(RUN_FILE, "utf8");
  if (/^## Cleaned up/m.test(text) && EXTRA.length === 0) {
    throw new Error(`${RUN_FILE} is already cleaned up. Pass order numbers to clean up others.`);
  }
  return {
    email: text.match(/Customer email \| `([^`]+)`/)?.[1] ?? null,
    numbers: [...new Set(text.match(/FM-\d+/g) ?? [])].filter((n) => !/FM-TC/.test(n)),
  };
}

async function main() {
  const run = readRun();
  const numbers = [...new Set([...run.numbers, ...EXTRA])];
  if (numbers.length === 0) {
    console.log("Nothing to clean up: no tests/.run-data.md and no order numbers given.");
    return;
  }
  console.log(`Target: ${BASE}${DRY_RUN ? "  (dry run: nothing will change)" : ""}`);
  console.log(`Run customer: ${run.email ?? "(none)"}; orders: ${numbers.join(", ")}`);

  const { token } = await api("/admin/auth/login", {
    method: "POST",
    body: { username: "admin", password: "admin123" },
  });
  // The admin list is sorted newest first; test orders from recent runs are near the top.
  const { list } = await api("/admin/order?page=0&size=200", { token });

  const results = [];
  for (const number of numbers) {
    const order = list.find((o) => o.number === number);
    if (!order) {
      results.push([number, "not found in the latest 200 orders, skipped"]);
      continue;
    }
    const ours = EXTRA.includes(number) || (run.email && order.receiverEmail === run.email);
    if (!ours) {
      results.push([number, `skipped: belongs to ${order.receiverEmail}, not the run's customer`]);
    } else if (order.status === "NEW" || order.status === "ACCEPTED") {
      if (!DRY_RUN) {
        await api(`/admin/order/${order.id}/status`, {
          method: "PATCH",
          token,
          body: { status: "REJECTED", rejectReason: REASON },
        });
      }
      results.push([number, `${order.status} -> REJECTED${DRY_RUN ? " (dry run)" : ""}`]);
    } else {
      results.push([number, `${order.status}: final, left as is`]);
    }
  }

  for (const [number, outcome] of results) console.log(`- ${number}: ${outcome}`);
  if (run.email) console.log(`- customer ${run.email}: kept (the API cannot delete customers)`);

  if (!DRY_RUN && existsSync(RUN_FILE)) {
    appendFileSync(
      RUN_FILE,
      ["", `## Cleaned up ${new Date().toISOString()}`, "", ...results.map(([n, o]) => `- ${n}: ${o}`), ""].join("\n"),
    );
    console.log(`\nRecorded in ${RUN_FILE}`);
  }
}

main().catch((err) => {
  console.error(`cleanup-data failed: ${err.message}`);
  process.exit(1);
});
