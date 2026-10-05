# Browser scripts for `/run-regression`

One file per browser action the run procedure uses. The agent **reads the file, replaces the constants in its `// ---- parameters ----` block, and passes the whole file to the browser JavaScript tool** (`mcp__claude-in-chrome__javascript_tool`). It never writes browser scripts from scratch: a retyped script is what made runs 17–20 fail in different ways.

## Rules for every script

- Self-contained: `await (async () => { … })()`. The result is the value the async function returns. There is no top-level `return`: a top-level `return` runs the script but loses the result (run 17, when orders were placed and the result came back `undefined`).
- Parameters are `const` lines between `// ---- parameters ----` and `// ---- end parameters ----`. Change only those.
- The result is a JSON-serialisable object. `ok` says whether the action did what was asked; other keys are the observed values the run records. Anything unexpected is returned as `ok: false` with an `error`, never thrown.
- Fields are set with the native value setter plus an `input` event, never by typing at coordinates. Elements are found by label, name or exact text, and statuses are matched by their full text.
- One action per script, each short enough to finish in about 10 s (the admin tab is in the background and its timers are throttled).
- **Run browser calls one at a time, never in parallel.** If one fails, don't run the next one on the page it left behind.
- If the tool shows `undefined` or `{}` for a script, report that as an execution problem; don't retype the script.

The scripts were exercised against the real storefront (a local dev server on the prod API, with writes blocked and mocked) and the admin app (mocked API). They depend on the current markup (`aside.uc-panel`, `.cic_root`, `button.dc_card`, `a.cc_card`, `form#checkout-form`, MUI chip and dialog classes). If the UI changes, fix the script here, not in a run.

## Storefront

| Script | Parameters | Returns |
|---|---|---|
| [`set-field.js`](set-field.js) | `LABEL` (e.g. `Full name`, `Phone`, `Email`, `City`, `Street`, `Building`, `Rejection reason`), `VALUE` (`""` clears) | `ok`, `label`, `value` (what the field holds now); `labels` if the field isn't found |
| [`header-search.js`](header-search.js) | `QUERY` | `ok`, `url` after the search (`/explore?q=…`) |
| [`read-explore.js`](read-explore.js) | none | `header_count`, `header_text`, `cards_count`, `names`, `cards` (name, delivery, meta, href, photo), `no_match`, `clear_filters_button`, `search_box` |
| [`add-dish.js`](add-dish.js) | `DISH` (exact name), `ADDITION` (`""` = none), `CHECK_PRICE_STEPS` (TC-03: tick, untick, tick again), `REQUIRE_EMPTY_CART` | `ok`, `dish`, `addition`, `price_steps` (button price after each step, e.g. `[2000,2100,2000,2100]`), `outcome` (`closed` or `mismatch` = the "Switch kitchens?" prompt appeared), `counter`; `error: "cart not empty"` when the guard stops it |
| [`kitchen-dialog.js`](kitchen-dialog.js) | `BUTTON` (`Keep cart & browse` or `Clear & continue`) | `ok`, `prompt_text`, `clicked`, `counter`, `cart_items` (lines in this chef's panel) |
| [`read-cart.js`](read-cart.js) | none | `counter`, `items` (name, quantity, line_price, additions), `subtotal`, `delivery` (`"Free"` or a number), `total`, `hint` (`"Add 2,900 AMD more"`), `hint_amount`, `empty_text`, `foreign_kitchen`. Works on a chef page (cart panel) and on `/checkout` (summary) |
| [`cart-quantity.js`](cart-quantity.js) | `ACTION` (`increase`/`decrease`), `TIMES`, `ITEM` (`""` = first line) | `ok`, `steps` (quantity, line_price, still_in_cart, counter after each click) and the final `quantity`, `line_price`, `still_in_cart`, `counter` |
| [`remove-all-cart-items.js`](remove-all-cart-items.js) | none | `ok` (cart empty), `removed`, `counter`, `empty_text`, `foreign_kitchen` (the lines belong to another chef: open that chef's page and run it again) |
| [`checkout-method.js`](checkout-method.js) | `METHOD` (`Delivery`/`Takeaway`/`""` = only read) | `method`, `address_fields_shown`, `subtotal`, `delivery`, `total`, `fields` (current values) |
| [`checkout-validate.js`](checkout-validate.js) | none | `messages`, `messages_count`, `still_on_checkout`, `address_fields_shown`. Clicks **Place order** only while the form is invalid; returns `ok: false` and does not click if everything looks valid |
| [`place-order.js`](place-order.js) | `EXPECTED` (exact cart lines, e.g. `[{"name":"Mushroom soup","quantity":1}]`) | `ok`, `placed`, `order_number`, `heading`, `buttons` (Track order / View my orders / Back to explore), `counter`. Guard: it does not click when you are not on `/checkout`, the cart is empty, or the lines differ from `EXPECTED` (`placed: false`, `error`). `placed: "unknown"` means no result in 20 s: check `/orders` before doing anything else |
| [`read-tracking-status.js`](read-tracking-status.js) | `NUMBER` (used on `/orders`) | On `/tracking/FM-…`: `heading`, `chef`, `status_title` (`Order received`, `Preparing your order`, `Delivered`, `Order declined`), `status_detail`, `all_orders_link`; `error_shown` for the "Couldn’t load this order" page. On `/orders`: `badge` (`Received`, `Preparing`, `Delivered`, `Declined`) and `row`. Navigate fresh first |

## Back office (run in the admin tab)

| Script | Parameters | Returns |
|---|---|---|
| [`admin-open-order.js`](admin-open-order.js) | `NUMBER` (e.g. `FM-100088`; admin id = number − 100000) | `ok` (the heading is exactly `Order <NUMBER>`), `heading`, `status`, `chef`, `receiver`, `items`, `total`, `actions` (the `Mark as …` buttons) |
| [`admin-accept.js`](admin-accept.js) | `NUMBER` | `ok`, `status_before`, `status` (`ACCEPTED`), `notice` ("Order status updated"), `actions` |
| [`admin-deliver.js`](admin-deliver.js) | `NUMBER` | `ok`, `status_before`, `status` (`DELIVERED`), `notice`, `actions` (empty when final) |
| [`admin-reject.js`](admin-reject.js) | `NUMBER`, `MODE` (`open`, `empty`, `cancel`, `confirm`), `REASON` (for `confirm`) | `open`: `dialog_title`, `has_reason_field`, `buttons`. `empty`: `empty_reason_error`, `dialog_open`. `cancel`: `dialog_closed` (waits up to 8 s), `status`. `confirm`: `status` (`REJECTED`), `notice`, `actions` |

The admin scripts refuse (`ok: false`) when the page that is open is not `NUMBER`, so a wrong order is never changed. `admin-open-order.js` waits for that order's own heading, because the previous order's page is still on screen right after the hash changes.
