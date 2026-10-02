#!/usr/bin/env node
// Prepares data for the manual test cases in this folder, against the deployed app.
//
//   node tests/prepare-data.mjs            # wake the app, create 1 customer + 3 orders
//   node tests/prepare-data.mjs --dry-run  # wake the app and check prerequisites only; creates nothing
//
// Creates real data on the shared prod database, so run it once per test session.
// Results go to tests/.run-data.md (git-ignored).

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.FOODME_BASE_URL || "https://foodme-marimargaryan86.onrender.com";
const DRY_RUN = process.argv.includes("--dry-run");
const PASSWORD = "secret123";
const OUT = join(dirname(fileURLToPath(import.meta.url)), ".run-data.md");

// Which test case uses which order. Each case changes or checks its own order.
const ORDERS_FOR = ["FM-TC-13", "FM-TC-14", "FM-TC-15"];

async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${await res.text()}`);
  return res.json();
}

async function wakeApp() {
  // The free-tier service sleeps after ~15 min and can take a minute or two to start.
  for (let attempt = 1; attempt <= 12; attempt++) {
    try {
      const res = await fetch(`${BASE}/actuator/health`, { signal: AbortSignal.timeout(20_000) });
      if (res.ok) return attempt;
    } catch {
      // still starting
    }
    console.log(`  app not up yet (attempt ${attempt}/12), retrying in 10 s...`);
    await new Promise((r) => setTimeout(r, 10_000));
  }
  throw new Error(`${BASE} did not respond after ~3 minutes; check the Render dashboard.`);
}

async function findOrderableDish() {
  const chefs = await api("/api/chef/active?page=0&size=12");
  for (const chef of chefs.exploreChefResponseDtoList) {
    const detail = await api(`/api/chef/${chef.id}`);
    const dish = (detail.dishes ?? []).find((d) => (d.status ?? "ACTIVE") === "ACTIVE");
    if (dish) {
      const name = (n) => n.find((x) => x.lang === "en")?.value;
      return {
        chefId: chef.id,
        chefName: name(chef.name),
        dishId: dish.id,
        dishName: dish.nameEn,
        quantity: Math.max(1, dish.minimumOrderCount ?? 1),
      };
    }
  }
  throw new Error("No active chef with an active dish on prod; can't place test orders.");
}

async function main() {
  console.log(`Target: ${BASE}${DRY_RUN ? "  (dry run: nothing will be created)" : ""}`);
  console.log(`- app is up (attempt ${await wakeApp()})`);
  const dish = await findOrderableDish();
  console.log(`- orders will use "${dish.dishName}" x${dish.quantity} from ${dish.chefName}`);
  if (DRY_RUN) return;

  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const email = `qa-run-${stamp}-${Math.floor(Math.random() * 1e6)}@example.com`;
  const fullName = "QA Run Customer";
  const { token } = await api("/api/auth/register", {
    method: "POST",
    body: { fullName, email, phoneNumber: "+37490000000", password: PASSWORD },
  });
  console.log(`- customer created: ${email}`);

  const orders = [];
  for (const testCase of ORDERS_FOR) {
    const order = await api("/api/order", {
      method: "POST",
      token,
      body: {
        chefId: dish.chefId,
        receiverName: fullName,
        receiverPhoneNumber: "+37490000000",
        receiverEmail: email,
        paymentType: "CASH",
        deliveryMethod: "TAKEAWAY",
        note: `manual test data for ${testCase}`,
        createOrderDishes: [{ dishId: dish.dishId, quantity: dish.quantity }],
      },
    });
    orders.push({ testCase, ...order });
    console.log(`- order ${order.number} (${order.status}) for ${testCase}`);
  }

  writeFileSync(
    OUT,
    [
      `# Test data: ${new Date().toISOString()}`,
      "",
      `Environment: ${BASE}`,
      "",
      "| What | Value | Used by |",
      "|---|---|---|",
      `| Customer email | \`${email}\` | FM-TC-12, FM-TC-13, FM-TC-14 (customer window) |`,
      `| Customer password | \`${PASSWORD}\` | |`,
      ...orders.map((o) => `| Order (${o.status}) | \`${o.number}\` | ${o.testCase} |`),
      "",
      `Orders: takeaway, cash, "${dish.dishName}" x${dish.quantity} from ${dish.chefName}.`,
      "",
    ].join("\n"),
  );
  console.log(`\nSaved to ${OUT}`);
}

main().catch((err) => {
  console.error(`prepare-data failed: ${err.message}`);
  process.exit(1);
});
