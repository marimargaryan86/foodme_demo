# Cart

The storefront cart lives in the browser (IndexedDB), not on the server, and holds dishes from one chef only. See [README](README.md) for environment, data rules and shared preconditions.

## FM-TC-04: Cart quantity controls

- **Priority:** High · **Type:** Functional, regression for FM-BUG-07 (decrement removed the item one step early)
- **Preconditions:** P2 · one dish in the cart, quantity 1.
- **Agent run:** full

| # | Step | Expected result |
|---|---|---|
| 1 | In the cart panel, click **Increase quantity** twice | Quantity 3; line price and **Subtotal** are 3 × the dish price |
| 2 | Click **Decrease quantity** once | Quantity 2; prices update |
| 3 | Click **Decrease quantity** once more | Quantity 1; **the item is still in the cart** |
| 4 | Click **Remove item** | The item disappears; the cart shows "Your cart is empty"; the header cart counter shows 0 |

## FM-TC-05: Cart survives a reload

- **Priority:** Medium · **Type:** Functional
- **Preconditions:** P2 · two different dishes from the same chef in the cart; note the header cart counter.
- **Agent run:** steps 1–2 (step 3 needs a private window: human-only)

| # | Step | Expected result |
|---|---|---|
| 1 | Reload the page (Cmd/Ctrl+R) | Both dishes are still in the cart with the same quantities; the header counter is unchanged |
| 2 | Open the storefront in a new tab of the same browser | The header counter shows the same number of items |
| 3 | Open the storefront in a private/incognito window | The cart is empty there (the cart is stored per browser profile) |

## FM-TC-06: Cart holds one chef only

- **Priority:** High · **Type:** Business rule
- **Preconditions:** P2 · a dish from chef A (e.g. Argentinean) in the cart.
- **Agent run:** full

| # | Step | Expected result |
|---|---|---|
| 1 | Open chef B (e.g. Chef Verona), click a dish, click **Add to cart** | Dialog "Switch kitchens?": "Your cart has items from another chef. Adding this dish clears that order." with **Clear & continue** and **Keep cart & browse** |
| 2 | Click **Keep cart & browse** | Dialog closes; the cart still holds only chef A's dish |
| 3 | Add chef B's dish again, click **Clear & continue** | The cart now holds only chef B's dish; chef A's dish is gone |
| 4 | Open `/chef/999999` | "Chef not found"; no "Switch kitchens?" dialog appears |

**Known issue (found 2026-10-05, regression run 17):** opening an existing chef can show "Chef not found — This kitchen may be offline or the link is outdated." when the chef request is slow or fails (`apps/web/src/pages/Chef/index.tsx:71` treats every error as not found, with no retry). A reload fixes it. Step 1 then fails transiently.

## FM-TC-07: Delivery fee and free-delivery threshold

- **Priority:** Medium · **Type:** Business rule
- **Preconditions:** empty cart; a chef with delivery 500 AMD, free from 5,000 AMD (true for all chefs on prod as of Oct 2026).
- **Agent run:** full

| # | Step | Expected result |
|---|---|---|
| 1 | Add one dish under 5,000 AMD to the cart | Cart shows **Subtotal**, **Delivery** 500 AMD, **Total** = subtotal + 500, and "Add *X* more for free delivery" where *X* = 5,000 − subtotal |
| 2 | Increase the quantity (or add dishes) until the subtotal is ≥ 5,000 AMD | **Delivery** shows **Free**; Total = Subtotal; the "Add … more" hint disappears |
| 3 | Decrease below 5,000 AMD again | Delivery fee and hint come back |
