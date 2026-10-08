#!/usr/bin/env node
// Uploads the 15 manual cases in tests/*.md to Qase as ISTQB-style test cases.
// Steps and expected results are parsed verbatim from the markdown (never rewritten);
// the ISTQB fields (objective, technique, test data, postconditions, traceability) are in META below.
//
//   node tests/qase/upload.mjs --dry-run              # print what would be sent, no token needed
//   QASE_API_TOKEN=... QASE_PROJECT=FM node tests/qase/upload.mjs
//
// Idempotent: cases are matched by the "FM-TC-NN" prefix of the title; existing ones are updated, not duplicated.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..')
const dryRun = process.argv.includes('--dry-run')
const token = process.env.QASE_API_TOKEN
const project = process.env.QASE_PROJECT
const API = 'https://api.qase.io/v1'

// Qase enums: priority 1 high/2 medium; severity 2 critical/3 major/4 normal;
// type 1 functional/2 smoke/3 regression/9 integration; behavior 1 positive/2 negative
const E = { high: 1, medium: 2 }
const META = {
  1: { obj: 'Verify the Explore page lists every active chef with correct summary data and links to the chef page.', tech: 'Use-case testing; consistency check (count vs. list)', data: 'No input data; prod chefs (5-6 active).', post: 'None.', sev: 4, type: 1, beh: 1, req: 'Browse active chefs' },
  2: { obj: 'Verify header search filters chefs case-insensitively and handles a no-match query with a recovery path.', tech: 'Equivalence partitioning (match / different case / no match)', data: 'Valid: `Sakura`; same value upper-case: `SAKURA`; invalid: `zzqx-no-such-chef`.', post: 'None.', sev: 4, type: 1, beh: 2, req: 'Search chefs' },
  3: { obj: 'Verify that selecting a dish addition changes the dish price and the cart line and subtotal by the addition price.', tech: 'Decision table (addition ticked / unticked); use-case testing', data: 'Chef: Alans Kitchen; any dish with additions.', post: 'Remove the dish from the cart.', sev: 3, type: 1, beh: 1, req: 'Dish additions and pricing' },
  4: { obj: 'Verify cart quantity increase, decrease and remove, and that decrementing from 2 to 1 keeps the item (regression of FM-BUG-07).', tech: 'Boundary value analysis (quantity 1-3); regression testing', data: 'One dish, initial quantity 1.', post: 'Cart is empty.', sev: 3, type: 3, beh: 1, req: 'Cart quantity management (FM-BUG-07)' },
  5: { obj: 'Verify the cart persists across reload and tabs of the same browser profile but not in a private window.', tech: 'State-based testing (persisted state); equivalence partitioning (same profile / other profile)', data: 'Two different dishes from the same chef.', post: 'Clear the cart; close private window.', sev: 4, type: 1, beh: 1, req: 'Cart persistence (IndexedDB)' },
  6: { obj: 'Verify the cart holds dishes from one chef only and asks for confirmation before switching kitchens.', tech: 'Decision table (Clear & continue / Keep cart); error guessing (unknown chef id)', data: 'Chef A: Argentinean; chef B: Chef Verona; invalid chef id `999999`.', post: 'Clear the cart.', sev: 3, type: 1, beh: 2, req: 'Single-chef cart rule' },
  7: { obj: 'Verify the delivery fee of 500 AMD applies below a 5,000 AMD subtotal and is free at or above it.', tech: 'Boundary value analysis (4,999 / 5,000 AMD threshold); decision table', data: 'Fee 500 AMD; free-delivery threshold 5,000 AMD.', post: 'Clear the cart.', sev: 4, type: 1, beh: 1, req: 'Delivery fee rule' },
  8: { obj: 'Verify checkout requires an account, shows the empty-cart state, and unlocks the form after account creation.', tech: 'State transition testing (signed out -> signed in); equivalence partitioning (empty / non-empty cart)', data: 'New customer: `qa-<name>-<yyyymmdd>-<n>@example.com`, password `secret123`, phone `+37490000000`.', post: 'Clear the cart.', sev: 2, type: 1, beh: 2, req: 'Checkout authentication' },
  9: { obj: 'Verify a signed-in customer can place a delivery order end to end and track it (smoke).', tech: 'Use-case testing (main success scenario)', data: 'Phone `+37490000000`; City `Yerevan`; Street `Tumanyan`; Building `10`; Cash on delivery.', post: 'Order is left REJECTED by /cleanup-test-data.', sev: 2, type: 2, beh: 1, req: 'Place delivery order' },
  10: { obj: 'Verify takeaway orders need no address and carry no delivery fee.', tech: 'Equivalence partitioning (Delivery / Takeaway); decision table', data: 'Valid name, phone `+37490000000`, email.', post: 'Order is left REJECTED by /cleanup-test-data.', sev: 3, type: 1, beh: 1, req: 'Place takeaway order' },
  11: { obj: 'Verify checkout validation messages for empty and invalid fields and that failed attempts create no order.', tech: 'Equivalence partitioning (empty / invalid / valid); boundary value (name length 1)', data: 'Invalid: name `A`, phone `123`, email `bad-email`; valid: any valid values.', post: 'Order is left REJECTED by /cleanup-test-data.', sev: 3, type: 1, beh: 2, req: 'Checkout form validation' },
  12: { obj: 'Verify sign-in with wrong and invalid credentials is refused, correct credentials succeed, and sign-out protects /orders.', tech: 'Equivalence partitioning (valid / wrong / malformed credentials); state transition testing', data: 'Wrong password `wrong-password`; malformed email `user@nodomain` with password `short`; valid password `secret123`.', post: 'Customer signed out.', sev: 2, type: 1, beh: 2, req: 'Customer authentication' },
  13: { obj: 'Verify order history and tracking: own orders listed, tracking works without sign-in, unknown number handled, orders isolated per customer.', tech: 'Use-case testing; equivalence partitioning (known / unknown order); error guessing', data: 'Order number `FM-...` from FM-TC-09; unknown number `FM-0000000`.', post: 'None.', sev: 3, type: 1, beh: 1, req: 'Order history and tracking' },
  14: { obj: 'Verify the admin order workflow NEW -> ACCEPTED -> DELIVERED and that the customer sees each status.', tech: 'State transition testing (valid transitions); use-case testing', data: 'Admin `admin` / `admin123`; wrong password `wrong`; a NEW order `FM-...`.', post: 'Order is DELIVERED (final).', sev: 2, type: 9, beh: 1, req: 'Admin order status workflow' },
  15: { obj: 'Verify rejecting an order requires a reason, can be cancelled, and is visible to the customer as declined.', tech: 'State transition testing (NEW -> REJECTED); equivalence partitioning (empty / given reason)', data: 'Reason: `Kitchen closed early`; a NEW order `FM-...`.', post: 'Order is REJECTED (final).', sev: 3, type: 1, beh: 2, req: 'Admin rejects order' },
}

function parse() {
  const cases = []
  for (const f of ['browsing', 'cart', 'checkout', 'account', 'back-office']) {
    const text = readFileSync(join(dir, `${f}.md`), 'utf8')
    for (const block of text.split(/^## (?=FM-TC-)/m).slice(1)) {
      const [head, ...rest] = block.split('\n')
      const m = head.match(/^FM-TC-(\d+): (.+)$/)
      const body = rest.join('\n')
      const line = (k) => (body.match(new RegExp(`- \\*\\*${k}:\\*\\* (.+)`)) || [])[1] || ''
      const priority = line('Priority').split('·')[0].trim().toLowerCase()
      const steps = body.split('\n').filter((l) => /^\| \d+ \|/.test(l)).map((l, i) => {
        const [, , action, expected] = l.split(/(?<!\\)\|/).map((s) => s.trim())
        return { position: i + 1, action, expected_result: expected }
      })
      const known = (body.match(/\*\*Known issue[\s\S]*?(?=\n\n|$)/) || [''])[0]
      const note = (body.match(/\*\*Note:\*\*[\s\S]*?(?=\n\n|$)/) || [''])[0]
      cases.push({
        n: Number(m[1]), id: `FM-TC-${m[1]}`, title: m[2], area: f,
        priority, kind: line('Type'), pre: line('Preconditions'), agent: line('Agent run'), steps, known, note,
      })
    }
  }
  return cases
}

function toQase(c) {
  const x = META[c.n]
  const desc = [
    `**Objective:** ${x.obj}`,
    `**Test condition / requirement:** ${x.req}`,
    `**Test design technique:** ${x.tech}`,
    `**Test level / type:** System / ${c.kind}`,
    `**Test data:** ${x.data}`,
    `**Environment:** deployed app https://foodme-marimargaryan86.onrender.com (wake it first; API calls have a deliberate 0.2-1.5 s delay).`,
    `**Automation candidate / agent run:** ${c.agent}`,
    c.note && c.note.replace(/\*\*Note:\*\* ?/, '**Note:** '),
    c.known && `> ${c.known}`,
    `**Traceability:** ${c.id} in tests/${c.area}.md`,
  ].filter(Boolean).join('\n\n')
  return {
    title: `${c.id}: ${c.title}`,
    description: desc,
    preconditions: c.pre,
    postconditions: x.post,
    severity: x.sev,
    priority: E[c.priority] ?? 2,
    type: x.type,
    behavior: x.beh,
    automation: 0,
    status: 0,
    steps: c.steps.map((s) => ({ position: s.position, action: s.action, expected_result: s.expected_result })),
    tags: [c.id.toLowerCase(), c.area, ...x.tech.split(/[;(]/)[0].split(',').map((t) => t.trim().toLowerCase().replace(/\s+/g, '-'))],
  }
}

async function api(method, path, body) {
  const r = await fetch(`${API}${path}`, {
    method,
    headers: { Token: token, 'Content-Type': 'application/json', accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok || j.status === false) throw new Error(`${method} ${path} -> ${r.status} ${JSON.stringify(j)}`)
  return j.result
}

const cases = parse()
if (cases.length !== 15) throw new Error(`expected 15 cases, parsed ${cases.length}`)
const payloads = cases.map(toQase)

if (dryRun) {
  console.log(JSON.stringify(payloads, null, 2))
  console.error(`dry run: ${payloads.length} cases, ${payloads.reduce((a, p) => a + p.steps.length, 0)} steps`)
  process.exit(0)
}
if (!token || !project) throw new Error('set QASE_API_TOKEN and QASE_PROJECT (or use --dry-run)')

const existing = new Map()
for (let offset = 0; ; offset += 100) {
  const r = await api('GET', `/case/${project}?limit=100&offset=${offset}`)
  for (const e of r.entities) existing.set(e.title.split(':')[0], e.id)
  if (r.entities.length < 100) break
}
for (const p of payloads) {
  const key = p.title.split(':')[0]
  if (existing.has(key)) {
    await api('PATCH', `/case/${project}/${existing.get(key)}`, p)
    console.log(`updated ${key} (#${existing.get(key)})`)
  } else {
    const r = await api('POST', `/case/${project}`, p)
    console.log(`created ${key} (#${r.id})`)
  }
}
