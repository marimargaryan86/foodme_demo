# Account and orders

See [README](README.md) for environment, data rules and shared preconditions.

## FM-TC-12: Sign in, wrong password and sign out

- **Priority:** High · **Type:** Functional, negative
- **Preconditions:** P1 · a registered customer, signed out.

| # | Step | Expected result |
|---|---|---|
| 1 | Click **Sign in** in the header | `/login` with **Sign in** and **Create account** tabs |
| 2 | Enter the customer's email and password `wrong-password` | A red error message in the form; still on `/login`; header still shows **Sign in** |
| 3 | Enter email `user@nodomain` and password `short` | "Enter a valid email" and "Password must be at least 8 characters"; no sign-in happens |
| 4 | Enter the correct email and password `secret123` | Redirected to `/orders`; **Your orders** shows the email; header shows **Orders** and the account initial |
| 5 | Click **Sign out** | Back on the sign-in page; header shows **Sign in** |
| 6 | Open `/orders` directly | Redirected to `/login?next=/orders`; after signing in again you land on `/orders` |

## FM-TC-13: Order history and tracking

- **Priority:** High · **Type:** Functional
- **Preconditions:** P3 · a customer with one placed order `FM-…`, signed in.

| # | Step | Expected result |
|---|---|---|
| 1 | Click **Orders** in the header | **Your orders** lists `FM-…` with the **Received** badge, the chef's name, today's date and the total |
| 2 | Click the order | `/tracking/FM-…` with heading "Order FM-…", "Chef · *name*", "Order received" and an **All orders** link |
| 3 | Click **All orders** | Back on **Your orders** |
| 4 | Sign out, open `/tracking/FM-…` again | The order status is still shown (tracking works without signing in); no **All orders** link |
| 5 | Open `/tracking/FM-0000000` | "Couldn’t load this order" with **Try again** and **Back to explore** |
| 6 | Sign in as a different new customer, open **Orders** | "No orders yet": customers only see their own orders |
