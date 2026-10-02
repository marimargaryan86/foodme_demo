# Browsing and menu

See [README](README.md) for environment, data rules and shared preconditions.

## FM-TC-01: Explore lists active chefs

- **Priority:** Medium · **Type:** Functional
- **Preconditions:** none.

| # | Step | Expected result |
|---|---|---|
| 1 | Open the home page, click **Explore chefs** in the header | `/explore` with heading **Explore chefs** and a grid of chef cards; the header **Explore chefs** button is highlighted |
| 2 | Compare "*N* chefs cooking near you" under the heading with the number of chef cards | *N* equals the number of cards |
| 3 | Check each card | Chef name, "500 AMD delivery", "25–40 min" and a photo |
| 4 | Click a card | `/chef/<id>` with that chef's name, delivery info ("500 AMD delivery · free from 5,000 AMD") and dishes grouped by category |

**Note:** kitchen filter chips (**All** + one per kitchen) appear only when a chef's kitchen differs from the chef's name. On prod every chef's kitchen equals its name, so no chips are shown.

**Known issue (found 2026-10-02):** step 2 fails. The page says "6 chefs cooking near you" but shows 5 cards; `GET /api/chef/active` returns `count: 6` with 5 chefs in the list.

## FM-TC-02: Header search finds chefs

- **Priority:** Medium · **Type:** Functional, negative
- **Preconditions:** none.

| # | Step | Expected result |
|---|---|---|
| 1 | In the header, type `Sakura` in **Search FoodMe** and press Enter | URL is `/explore?q=Sakura`; **Sakura Kitchen** is listed; unrelated chefs (e.g. Argentinean) are not |
| 2 | Search for `SAKURA` | Same result (search is case-insensitive) |
| 3 | Search for `zzqx-no-such-chef` | "No chefs match" with a **Clear filters** button |
| 4 | Click **Clear filters** | URL is `/explore`; all chefs are listed; the search box is empty |

## FM-TC-03: Dish additions change the price

- **Priority:** High · **Type:** Functional
- **Preconditions:** empty cart.

| # | Step | Expected result |
|---|---|---|
| 1 | Open **Alans Kitchen** from Explore | Chef page with the chef's name, banner and dish cards |
| 2 | Click a dish that has additions | Dish dialog with name, price, an **Additions** section, a **Quantity** control and **Add to cart** |
| 3 | Note the price, tick one addition | The price on **Add to cart** increases by the addition's price |
| 4 | Untick it, then tick it again | Price goes back down, then up again |
| 5 | Click **Add to cart** | Dialog closes; the cart panel shows the dish with the addition and the higher line price; **Subtotal** matches it |
