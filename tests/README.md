# Manual test cases

15 manual test cases for FoodMe, run against the deployed app. They cover the customer journey end to end (browse → cart → checkout → track) and the back-office order workflow, including negative cases and one regression for a fixed bug.

## Environment

- **Storefront:** https://foodme-marimargaryan86.onrender.com
- **Back office:** https://foodme-marimargaryan86.onrender.com/backoffice/ (lab login `admin` / `admin123`)
- **Wake the app first.** The free-tier service sleeps after ~15 minutes; the first load can take up to a minute ("Application loading").
- **Expect slowness.** Every API call has a deliberate 0.2–1.5 s delay. Wait for the UI to settle before judging a result.
- **Browser:** latest Chrome, desktop width, unless a case says otherwise.

## Test data rules

- Prod data is shared. Create your own customers and orders; don't edit, deactivate or delete chefs or dishes; only change the status of orders you placed.
- Customer emails must be unique: `qa-<yourname>-<yyyymmdd>-<n>@example.com`, password `secret123`, phone `+37490000000`.
- Reference data on prod (Oct 2026): delivery costs **500 AMD**, free from **5,000 AMD**. Chefs with dish additions: **Alans Kitchen**, **Sakura Kitchen**.

## Index

| ID | Title | Area | Type | Priority | Agent run |
|---|---|---|---|---|---|
| [FM-TC-01](browsing.md#fm-tc-01-explore-lists-active-chefs) | Explore lists active chefs | Browsing | Functional | Medium | Full |
| [FM-TC-02](browsing.md#fm-tc-02-header-search-finds-chefs) | Header search finds chefs | Browsing | Functional, negative | Medium | Full |
| [FM-TC-03](browsing.md#fm-tc-03-dish-additions-change-the-price) | Dish additions change the price | Browsing | Functional | High | Full |
| [FM-TC-04](cart.md#fm-tc-04-cart-quantity-controls) | Cart quantity controls | Cart | Functional, regression (FM-BUG-07) | High | Full |
| [FM-TC-05](cart.md#fm-tc-05-cart-survives-a-reload) | Cart survives a reload | Cart | Functional | Medium | Steps 1–2 |
| [FM-TC-06](cart.md#fm-tc-06-cart-holds-one-chef-only) | Cart holds one chef only | Cart | Business rule | High | Full |
| [FM-TC-07](cart.md#fm-tc-07-delivery-fee-and-free-delivery-threshold) | Delivery fee and free-delivery threshold | Cart | Business rule | Medium | Full |
| [FM-TC-08](checkout.md#fm-tc-08-checkout-requires-an-account) | Checkout requires an account | Checkout | Functional | High | Step 2 |
| [FM-TC-09](checkout.md#fm-tc-09-delivery-order-end-to-end) | Delivery order end to end | Checkout | Functional, smoke | High | Full |
| [FM-TC-10](checkout.md#fm-tc-10-takeaway-order-needs-no-address) | Takeaway order needs no address | Checkout | Functional | High | Full |
| [FM-TC-11](checkout.md#fm-tc-11-checkout-form-validation) | Checkout form validation | Checkout | Negative | High | Full |
| [FM-TC-12](account.md#fm-tc-12-sign-in-wrong-password-and-sign-out) | Sign in, wrong password and sign out | Account | Functional, negative | High | Human-only |
| [FM-TC-13](account.md#fm-tc-13-order-history-and-tracking) | Order history and tracking | Account | Functional | High | Steps 1–5 |
| [FM-TC-14](back-office.md#fm-tc-14-admin-accepts-and-delivers-an-order) | Admin accepts and delivers an order | Back office | Functional, end to end | High | Steps 3–7 |
| [FM-TC-15](back-office.md#fm-tc-15-admin-rejects-an-order) | Admin rejects an order | Back office | Functional, negative | High | Full |

## Agent runs (regression)

`/run-regression` runs the agent-runnable steps of all 15 cases in the Playwright MCP browser (see below), clicking and reading the pages like a tester (no JavaScript), and records the result in [regression/history.md](regression/history.md). It needs a signed-in customer and a signed-in admin in that browser, done once by a person: sessions persist in its profile, and the agent never signs out. Steps marked human-only (signing in/out, creating accounts, private windows) are reported as `SKIP`.

**Why an agent in a browser, and not only Playwright specs?** These runs measure how consistent the agent and its skill are when the same cases run again and again, and whether the skill improves itself from its own failures. They aren't meant to replace automated tests. Runs are recorded in [regression/history.md](regression/history.md). Each run runs in its own subagent, so a 10-run `/goal` batch doesn't grow one conversation; the `/goal` command for the batch is in history.md. For deterministic, repeatable coverage use the Playwright specs in `apps/web/e2e/` and `apps/admin/e2e/` (see AGENTS.md → Commands).

### Signing in, once

The regression runs in the Playwright MCP browser (server `playwright` in `.mcp.json`), which keeps its own Chrome profile in `.playwright-profile/`, so your normal Chrome sign-ins don't carry over. Once per machine:

1. Start Claude Code in this repo and approve the `playwright` server (`/mcp`).
2. With no Playwright browser open, start Chrome on that profile from the repo root:
   ```bash
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --user-data-dir="$PWD/.playwright-profile"
   ```
3. Sign in a test customer on the storefront (`/login`) and the admin on `/backoffice/`, then quit that Chrome window (Cmd+Q). Only one browser can use the profile at a time.

To run only a few cases without recording a regression run, ask in a session, e.g. "run FM-TC-01 to 03 with Playwright MCP, as in the run-regression skill".

## Shared preconditions

**Fast setup:** run `/prepare-test-data` in Claude Code (or `node tests/prepare-data.mjs`). It wakes the app and creates P1 plus three P3 orders (for FM-TC-13, 14 and 15), and writes them to `tests/.run-data.md` (git-ignored). Use `--dry-run` to only wake the app. When the session is over, run `/cleanup-test-data` (or `node tests/cleanup-data.mjs [FM-… orders placed during the run]`): the API can't delete anything, so it sets the run's still-active test orders to REJECTED with a "Test data cleanup" reason. To set up by hand instead:

- **P1 · Registered customer:** open `/register`, fill Full name, a unique Email, Phone and Password, click **Create account**. You land on **Your orders**.
- **P2 · Item in cart:** open **Explore chefs**, open any chef, click a dish, click **Add to cart**. The cart panel on the right lists it.
- **P3 · Placed order:** with P1 signed in and P2 done, click **Go to checkout**, choose **Takeaway**, fill Full name, Phone, Email, click **Place order**. Note the order number `FM-…` from the success page.

## Recording results

For each run, note date, tester, browser, and per case **Pass / Fail / Blocked** with the order numbers and emails used. For a failure, record the step number, actual result and a screenshot.
