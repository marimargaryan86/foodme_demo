# Checkout

See [README](README.md) for environment, data rules and shared preconditions. Each successful case creates a real order on prod.

## FM-TC-08: Checkout requires an account

- **Priority:** High · **Type:** Functional
- **Preconditions:** signed out; P2 · one dish in the cart.
- **Agent run:** step 2 only (steps 1 and 3 need a signed-out browser: human-only)

| # | Step | Expected result |
|---|---|---|
| 1 | Click **Go to checkout** in the cart panel | `/checkout` shows only an **Account** panel ("Sign in or create an account so you can track this order…") with **Sign in** / **Create account** tabs; no order summary, no delivery form and no **Place order** button yet |
| 2 | Remove the item from the cart, open `/checkout` | "Nothing to check out": "Your cart is empty. Browse chefs and add something delicious." with a **Browse chefs** button |
| 3 | Add the item again, go to checkout; on the **Create account** tab, fill a new customer and click **Create account** | "Signed in as *name*" appears; the order summary and the checkout form (receiver details, Delivery / Takeaway, payment) are shown |

## FM-TC-09: Delivery order end to end

- **Priority:** High · **Type:** Functional, smoke
- **Preconditions:** P1 signed in; P2 · one dish in the cart.
- **Agent run:** full (signed-in customer session)

| # | Step | Expected result |
|---|---|---|
| 1 | **Go to checkout**, choose **Delivery To your door** | Address fields City, Street, Building, Apartment are shown; summary shows Subtotal, Delivery, Total |
| 2 | Fill Full name, Phone `+37490000000`, Email, City `Yerevan`, Street `Tumanyan`, Building `10`; keep **Cash on delivery** | No validation messages |
| 3 | Click **Place order** | `/orders/success` with "Order placed!", "Your order number is FM-…", **Track order**, **View my orders** and **Back to explore** |
| 4 | Check the cart counter in the header | 0: the cart was emptied after ordering |
| 5 | Click **Track order** | `/tracking/FM-…` with "Order received" |

## FM-TC-10: Takeaway order needs no address

- **Priority:** High · **Type:** Functional
- **Preconditions:** P1 signed in; P2 · one dish in the cart.
- **Agent run:** full (signed-in customer session)

| # | Step | Expected result |
|---|---|---|
| 1 | **Go to checkout**, choose **Delivery To your door** | Address fields are shown; **Delivery** shows a fee (or Free above 5,000 AMD) |
| 2 | Choose **Takeaway Pick up** | Address fields disappear; **Delivery** shows **Free**; Total = Subtotal |
| 3 | Fill Full name, Phone, Email; click **Place order** | "Order placed!" with an order number |

## FM-TC-11: Checkout form validation

- **Priority:** High · **Type:** Negative
- **Preconditions:** P1 signed in; P2 · one dish in the cart; on `/checkout` with **Delivery** selected.
- **Agent run:** full (signed-in customer session)

| # | Step | Expected result |
|---|---|---|
| 1 | Clear Full name, Phone and Email (if prefilled), leave City and Street empty, click **Place order** | Messages: "Enter your name", "Enter a valid phone number", "Enter a valid email", "City is required", "Street is required"; still on `/checkout` |
| 2 | Enter Full name `A` (1 character), Phone `123`, Email `bad-email` | Name, phone and email messages stay after **Place order** |
| 3 | Switch to **Takeaway** | City/Street messages disappear with the address fields |
| 4 | Fix all fields with valid values, click **Place order** | "Order placed!": no order was created by the failed attempts (check **Orders**: only one new order) |
