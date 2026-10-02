# Back office

Order status workflow in the admin app and what the customer sees. See [README](README.md) for environment, data rules and shared preconditions. Only change orders you placed yourself.

Allowed status changes: NEW → ACCEPTED or REJECTED; ACCEPTED → DELIVERED or REJECTED; DELIVERED and REJECTED are final.

## FM-TC-14: Admin accepts and delivers an order

- **Priority:** High · **Type:** Functional, end to end
- **Preconditions:** P3 · a new order `FM-…` (status NEW). Customer signed in in one window; a second window (private) for admin.
- **Agent run:** steps 3–7, using the order from FM-TC-09 (customer and admin tabs); steps 1–2 are the admin sign-in: human-only

| # | Step | Expected result |
|---|---|---|
| 1 | Admin window: open `/backoffice/`, sign in with `admin` / `wrong` | "Invalid username or password."; still on the login page |
| 2 | Sign in with `admin` / `admin123` | Admin home with the **Orders**, **Chefs**, **Dishes** menu |
| 3 | Open **Orders**, click **Refresh**, click `FM-…` | "Order FM-…" with status NEW, chef, receiver, items, total, and **Mark as ACCEPTED** / **Mark as REJECTED** |
| 4 | Click **Mark as ACCEPTED** | "Order status updated"; status ACCEPTED; buttons **Mark as DELIVERED** / **Mark as REJECTED** |
| 5 | Customer window: reload **Orders**, open the order | Badge **Preparing**; tracking shows "Preparing your order" |
| 6 | Admin: click **Mark as DELIVERED** | Status DELIVERED; no **Mark as …** buttons left |
| 7 | Customer: reload the tracking page | "Delivered" with "Enjoy your meal…"; **Orders** shows the **Delivered** badge |

## FM-TC-15: Admin rejects an order

- **Priority:** High · **Type:** Functional, negative
- **Preconditions:** P3 · a new order `FM-…` (status NEW); signed in to admin.
- **Agent run:** full, using the order from FM-TC-10

| # | Step | Expected result |
|---|---|---|
| 1 | Open the order (Orders → Refresh → `FM-…`) | Status NEW |
| 2 | Click **Mark as REJECTED** | Dialog "Reject order" with a **Rejection reason** field, **Cancel** and **Reject order** |
| 3 | Leave the reason empty, click **Reject order** | Warning "A rejection reason is required"; the order is not rejected |
| 4 | Click **Cancel** | Dialog closes; status is still NEW |
| 5 | Click **Mark as REJECTED**, enter `Kitchen closed early`, click **Reject order** | "Order status updated"; status REJECTED; no **Mark as …** buttons left |
| 6 | Open the storefront `/tracking/FM-…` | "Order declined": "This order couldn’t be fulfilled. Contact support if you need help."; **Orders** shows the **Declined** badge |
