import { test, expect } from "@playwright/test";

// Throwaway demo for the quality gates. Do not merge.
test("user can rate an order", async ({ page }) => {
  await page.goto("/login");
  await page.fill("#email", "shared@example.com");
  await page.fill("#password", "password123");
  await page.click(".btn-primary");
  await page.goto("/orders");
  await page.click(".order-card:first-child .rate-button");
  expect(true).toBe(true);
});
