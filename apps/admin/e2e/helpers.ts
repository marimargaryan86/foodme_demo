import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const API = process.env.VITE_API_BASE_URL || "http://localhost:8081";

export async function loginAsAdmin(page: Page) {
  await page.goto("/#/login");
  await expect(page.getByRole("heading", { name: "FoodMe Admin" })).toBeVisible();
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("admin123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("menuitem", { name: "Orders" })).toBeVisible({ timeout: 15000 });
}

export async function createOrderViaApi(request: APIRequestContext) {
  const chefs = await (await request.get(`${API}/api/chef/active?page=0&size=12`)).json();
  const chef = chefs.exploreChefResponseDtoList[0];
  const detail = await (await request.get(`${API}/api/chef/${chef.id}`)).json();
  const dish = detail.dishes[0];
  const email = `admin-e2e-${Date.now()}@example.com`;
  const registerRes = await request.post(`${API}/api/auth/register`, {
    data: {
      fullName: "Admin E2E",
      email,
      phoneNumber: "+37495555666",
      password: "secret123",
    },
  });
  expect(registerRes.ok()).toBeTruthy();
  const { token } = await registerRes.json();
  const createRes = await request.post(`${API}/api/order`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      chefId: chef.id,
      receiverName: "Admin E2E",
      receiverPhoneNumber: "+37495555666",
      receiverEmail: "admin-e2e@example.com",
      paymentType: "CASH",
      deliveryMethod: "TAKEAWAY",
      note: "admin e2e order",
      createOrderDishes: [{ dishId: dish.id, quantity: 1 }],
    },
  });
  expect(createRes.ok()).toBeTruthy();
  return createRes.json();
}

export async function adminApiToken(request: APIRequestContext) {
  const res = await request.post(`${API}/admin/auth/login`, {
    data: { username: "admin", password: "admin123" },
  });
  expect(res.ok()).toBeTruthy();
  return (await res.json()).token as string;
}

/** Creates an order as a fresh customer. Returns the order plus that customer's token. */
export async function createCustomerOrder(request: APIRequestContext) {
  const chefs = await (await request.get(`${API}/api/chef/active?page=0&size=12`)).json();
  const chef = chefs.exploreChefResponseDtoList[0];
  const detail = await (await request.get(`${API}/api/chef/${chef.id}`)).json();
  const reg = await request.post(`${API}/api/auth/register`, {
    data: {
      fullName: "Admin Rating E2E",
      email: `admin-rating-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`,
      phoneNumber: "+37495555666",
      password: "secret123",
    },
  });
  expect(reg.ok()).toBeTruthy();
  const { token } = await reg.json();
  const res = await request.post(`${API}/api/order`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      chefId: chef.id,
      receiverName: "Admin Rating E2E",
      receiverPhoneNumber: "+37495555666",
      receiverEmail: "admin-rating-e2e@example.com",
      paymentType: "CASH",
      deliveryMethod: "TAKEAWAY",
      note: "admin rating e2e order",
      createOrderDishes: [{ dishId: detail.dishes[0].id, quantity: 1 }],
    },
  });
  expect(res.ok()).toBeTruthy();
  const { number } = (await res.json()) as { number: string };
  return { order: { number }, customerToken: token };
}

/** Moves an order through the given statuses. The create response has no id, so look it up in the newest NEW orders. */
export async function setOrderStatus(request: APIRequestContext, number: string, statuses: string[]) {
  const token = await adminApiToken(request);
  const headers = { Authorization: `Bearer ${token}` };
  const list = await (await request.get(`${API}/admin/order?status=NEW&page=0&size=50`, { headers })).json();
  const id = list.list.find((o: { number: string }) => o.number === number)?.id;
  expect(id, `order ${number} in the NEW list`).toBeTruthy();
  for (const status of statuses) {
    const res = await request.patch(`${API}/admin/order/${id}/status`, { headers, data: { status } });
    expect(res.ok()).toBeTruthy();
  }
}
