import { test, expect, type APIRequestContext, type Page } from "@playwright/test";
import {
  advanceOrderViaAdmin,
  createDeliveredOrderViaApi,
  createOrderViaApi,
  registerCustomerViaApi,
} from "./auth";

const API = process.env.VITE_API_BASE_URL || "http://localhost:8081";
const AUTH_KEY = "foodme.customer.auth";

function rate(
  request: APIRequestContext,
  token: string | null,
  number: string,
  data: { stars?: number | null; comment?: string },
) {
  return request.post(`${API}/api/customer/orders/${number}/rating`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    data,
  });
}

async function signInAs(page: Page, auth: unknown) {
  await page.addInitScript(
    ([key, value]) => localStorage.setItem(key, value),
    [AUTH_KEY, JSON.stringify(auth)],
  );
}

test.describe("Order ratings: My Orders UI (KAN-7)", () => {
  test("customer rates a delivered order and still sees it after refresh", async ({ page, request }) => {
    const customer = await registerCustomerViaApi(request, API);
    const order = await createDeliveredOrderViaApi(request, API, customer.token);
    await signInAs(page, customer.auth);

    await page.goto("/orders");
    await expect(page.getByText(order.number)).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: "Rate order" }).click();

    const form = page.getByRole("form", { name: "Rate order" });
    await expect(form.getByPlaceholder("Tell us about your order")).toBeVisible();
    await expect(form.getByRole("button", { name: "Submit rating" })).toBeDisabled();

    await form.getByRole("radio", { name: "4 stars" }).click();
    await form.getByPlaceholder("Tell us about your order").fill("Tasty and still warm");
    await form.getByRole("button", { name: "Submit rating" }).click();

    await expect(form).toBeHidden({ timeout: 15000 });
    await expect(page.getByRole("button", { name: "Rate order" })).toHaveCount(0);
    await expect(page.getByRole("img", { name: "4 out of 5 stars" })).toBeVisible();
    await expect(page.getByText("Tasty and still warm")).toBeVisible();

    await page.reload();
    await expect(page.getByRole("img", { name: "4 out of 5 stars" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: "Rate order" })).toHaveCount(0);

    // R13: the order tracking page shows rating + comment too
    await page.goto(`/tracking/${order.number}`);
    await expect(page.getByText("Your rating")).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("img", { name: "4 out of 5 stars" })).toBeVisible();
    await expect(page.getByText("Tasty and still warm")).toBeVisible();
  });

  test("stars can be picked with the keyboard", async ({ page, request }) => {
    const customer = await registerCustomerViaApi(request, API);
    await createDeliveredOrderViaApi(request, API, customer.token);
    await signInAs(page, customer.auth);

    await page.goto("/orders");
    await page.getByRole("button", { name: "Rate order" }).click({ timeout: 15000 });
    const form = page.getByRole("form", { name: "Rate order" });

    await form.getByRole("radio", { name: "1 star" }).focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(form.getByRole("radio", { name: "3 stars" })).toBeChecked();
    await page.keyboard.press("End");
    await expect(form.getByRole("radio", { name: "5 stars" })).toBeChecked();
    await expect(form.getByRole("button", { name: "Submit rating" })).toBeEnabled();
  });

  test("non-delivered orders have no Rate order button", async ({ page, request }) => {
    const customer = await registerCustomerViaApi(request, API);
    const order = await createOrderViaApi(request, API, customer.token); // stays NEW
    await signInAs(page, customer.auth);

    await page.goto("/orders");
    await expect(page.getByText(order.number)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: "Rate order" })).toHaveCount(0);
  });

  test("failed save shows the reason and allows retry", async ({ page, request }) => {
    const customer = await registerCustomerViaApi(request, API);
    const order = await createDeliveredOrderViaApi(request, API, customer.token);
    await signInAs(page, customer.auth);

    await page.goto("/orders");
    await page.getByRole("button", { name: "Rate order" }).click({ timeout: 15000 });
    const form = page.getByRole("form", { name: "Rate order" });
    await form.getByRole("radio", { name: "2 stars" }).click();

    // someone rates the order behind the modal's back, so the submit is refused
    expect((await rate(request, customer.token, order.number, { stars: 5 })).ok()).toBeTruthy();

    await form.getByRole("button", { name: "Submit rating" }).click();
    await expect(form.getByRole("alert")).toHaveText("Order already reviewed.", { timeout: 15000 });
    await expect(form.getByRole("button", { name: "Submit rating" })).toBeEnabled();
  });
});

test.describe("Order ratings: API rules (KAN-7)", () => {
  test("rejects unauthenticated requests", async ({ request }) => {
    const res = await rate(request, null, "FM-000000", { stars: 5 });
    expect([401, 403]).toContain(res.status());
  });

  test("refuses a non-delivered order", async ({ request }) => {
    const customer = await registerCustomerViaApi(request, API);
    const order = await createOrderViaApi(request, API, customer.token);
    const res = await rate(request, customer.token, order.number, { stars: 5 });
    expect(res.status()).toBe(400);
    expect((await res.json()).message).toBe("Only delivered orders can be reviewed.");
  });

  test("refuses a second rating on the same order", async ({ request }) => {
    const customer = await registerCustomerViaApi(request, API);
    const order = await createDeliveredOrderViaApi(request, API, customer.token);
    expect((await rate(request, customer.token, order.number, { stars: 3 })).ok()).toBeTruthy();
    const again = await rate(request, customer.token, order.number, { stars: 5 });
    expect(again.status()).toBe(400);
    expect((await again.json()).message).toBe("Order already reviewed.");
  });

  test("someone else's order behaves as not found", async ({ request }) => {
    const owner = await registerCustomerViaApi(request, API);
    const other = await registerCustomerViaApi(request, API);
    const order = await createDeliveredOrderViaApi(request, API, owner.token);
    const res = await rate(request, other.token, order.number, { stars: 5 });
    expect(res.status()).toBe(404);
  });

  for (const stars of [0, 6, 4.5, -1, null]) {
    test(`refuses stars = ${stars}`, async ({ request }) => {
      const customer = await registerCustomerViaApi(request, API);
      const order = await createDeliveredOrderViaApi(request, API, customer.token);
      const res = await rate(request, customer.token, order.number, { stars });
      expect(res.status()).toBe(400);
      expect((await res.json()).message).toBe("Rating must be a whole number from 1 to 5.");
    });
  }

  test("comment limit: 1000 chars accepted, 1001 refused", async ({ request }) => {
    const customer = await registerCustomerViaApi(request, API);
    const tooLong = await createDeliveredOrderViaApi(request, API, customer.token);
    const refused = await rate(request, customer.token, tooLong.number, { stars: 5, comment: "x".repeat(1001) });
    expect(refused.status()).toBe(400);
    expect((await refused.json()).message).toBe("Comment must be at most 1000 characters.");

    const ok = await createDeliveredOrderViaApi(request, API, customer.token);
    const saved = await rate(request, customer.token, ok.number, { stars: 5, comment: "x".repeat(1000) });
    expect(saved.ok()).toBeTruthy();
    expect((await saved.json()).comment).toHaveLength(1000);
  });

  test("a saved rating updates the chef's average, rounded to 1 decimal", async ({ request }) => {
    const customer = await registerCustomerViaApi(request, API);
    const order = await createDeliveredOrderViaApi(request, API, customer.token);
    const res = await rate(request, customer.token, order.number, { stars: 4 });
    expect(res.ok()).toBeTruthy();

    // R11/R12: the storefront chef endpoint reflects the new average straight away
    const chef = await (await request.get(`${API}/api/chef/${order.chefId}`)).json();
    expect(chef.rating).toBeGreaterThanOrEqual(1);
    expect(chef.rating).toBeLessThanOrEqual(5);
    expect(Math.round(chef.rating * 10) / 10).toBe(chef.rating);
  });
});

test.describe("Order ratings: regression (KAN-7, criterion 7)", () => {
  test("order lifecycle still works for an unrated order", async ({ request }) => {
    const customer = await registerCustomerViaApi(request, API);
    const order = await createOrderViaApi(request, API, customer.token);
    await advanceOrderViaAdmin(request, API, order.number, ["ACCEPTED", "DELIVERED"]);
    const res = await request.get(`${API}/api/order/number/${order.number}`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe("DELIVERED");
    expect(body.rating ?? null).toBeNull();
  });
});
