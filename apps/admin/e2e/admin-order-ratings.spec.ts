import { test, expect } from "@playwright/test";
import { API, createCustomerOrder, loginAsAdmin, setOrderStatus } from "./helpers";

async function openOrder(page: import("@playwright/test").Page, number: string) {
  await page.goto("#/orders");
  await page.getByRole("button", { name: "Refresh" }).click();
  await page.getByText(number).click();
  await expect(page).toHaveURL(/#\/orders\/\d+\/show/);
  await expect(page.getByRole("heading", { name: `Order ${number}`, level: 5 })).toBeVisible();
}

test.describe("Admin order ratings (KAN-7)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("rated order shows stars, comment and date in details and in the list", async ({ page, request }) => {
    const { order, customerToken } = await createCustomerOrder(request);
    await setOrderStatus(request, order.number, ["ACCEPTED", "DELIVERED"]);
    const rated = await request.post(`${API}/api/customer/orders/${order.number}/rating`, {
      headers: { Authorization: `Bearer ${customerToken}` },
      data: { stars: 3, comment: "Cold fries, kind staff" },
    });
    expect(rated.ok()).toBeTruthy();

    await page.goto("#/orders");
    await page.getByRole("button", { name: "Refresh" }).click();
    const row = page.getByRole("row").filter({ hasText: order.number });
    await expect(row).toBeVisible({ timeout: 15000 });
    await expect(row.getByRole("img", { name: "3 out of 5 stars" })).toBeVisible();

    await row.click();
    await expect(page.getByText("Customer review")).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("img", { name: "3 out of 5 stars" })).toBeVisible();
    await expect(page.getByText("Cold fries, kind staff")).toBeVisible();
    await expect(page.getByText("No review yet")).toHaveCount(0);
  });

  test("delivered but unrated order says 'No review yet'", async ({ page, request }) => {
    const { order } = await createCustomerOrder(request);
    await setOrderStatus(request, order.number, ["ACCEPTED", "DELIVERED"]);
    await openOrder(page, order.number);
    await expect(page.getByText("Customer review")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("No review yet")).toBeVisible();
  });

  test("review section is hidden for a non-delivered order", async ({ page, request }) => {
    const { order } = await createCustomerOrder(request); // stays NEW
    await openOrder(page, order.number);
    await expect(page.getByText("Customer review")).toHaveCount(0);
    await expect(page.getByText("No review yet")).toHaveCount(0);
  });
});
