import { expect, type APIRequestContext, type Page } from "@playwright/test";

export async function createAccountAtCheckout(
  page: Page,
  name = "Casey Delivery",
) {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const email = `e2e-${suffix}@example.com`;
  const password = "secret123";

  await page.getByRole("tab", { name: "Create account" }).click();
  const form = page.getByRole("form", { name: "Create account" });
  await form.getByLabel("Full name").fill(name);
  await form.getByLabel("Email").fill(email);
  await form.getByLabel("Phone").fill("+37493333444");
  await form.getByLabel("Password").fill(password);
  await form.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText(new RegExp(`Signed in as ${name}`))).toBeVisible();

  return { email, password, name };
}

export async function registerCustomerViaApi(
  request: APIRequestContext,
  apiBase: string,
) {
  const email = `api-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
  const res = await request.post(`${apiBase}/api/auth/register`, {
    data: {
      fullName: "E2E Customer",
      email,
      phoneNumber: "+37490000000",
      password: "secret123",
    },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  return { token: body.token as string, email, auth: body };
}

export async function createOrderViaApi(
  request: APIRequestContext,
  apiBase: string,
  token: string,
) {
  const chefs = await (await request.get(`${apiBase}/api/chef/active?page=0&size=12`)).json();
  const chef = chefs.exploreChefResponseDtoList[0];
  const detail = await (await request.get(`${apiBase}/api/chef/${chef.id}`)).json();
  const res = await request.post(`${apiBase}/api/order`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      chefId: chef.id,
      receiverName: "E2E Customer",
      receiverPhoneNumber: "+37490000000",
      receiverEmail: "e2e-rating@example.com",
      paymentType: "CASH",
      deliveryMethod: "TAKEAWAY",
      note: "rating e2e order",
      createOrderDishes: [{ dishId: detail.dishes[0].id, quantity: 1 }],
    },
  });
  expect(res.ok()).toBeTruthy();
  const { number } = (await res.json()) as { number: string };
  const full = await (await request.get(`${apiBase}/api/order/number/${number}`)).json();
  return { number, chefId: full.chefId as number };
}

async function adminToken(request: APIRequestContext, apiBase: string) {
  const login = await request.post(`${apiBase}/admin/auth/login`, {
    data: { username: "admin", password: "admin123" },
  });
  expect(login.ok()).toBeTruthy();
  return (await login.json()).token as string;
}

/** The create-order response has no id, so find it in the newest NEW orders. */
async function findNewOrderId(request: APIRequestContext, apiBase: string, token: string, number: string) {
  for (let page = 0; page < 5; page++) {
    const res = await request.get(`${apiBase}/admin/order?status=NEW&page=${page}&size=50`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const hit = body.list.find((o: { number: string }) => o.number === number);
    if (hit) return hit.id as number;
    if (body.list.length < 50) break;
  }
  throw new Error(`Order ${number} not found in the admin list`);
}

/** Moves an order (by number) through the given statuses as the back-office admin. */
export async function advanceOrderViaAdmin(
  request: APIRequestContext,
  apiBase: string,
  number: string,
  statuses: string[],
) {
  const token = await adminToken(request, apiBase);
  const id = await findNewOrderId(request, apiBase, token, number);
  for (const status of statuses) {
    const res = await request.patch(`${apiBase}/admin/order/${id}/status`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { status },
    });
    expect(res.ok()).toBeTruthy();
  }
}

export async function createDeliveredOrderViaApi(
  request: APIRequestContext,
  apiBase: string,
  token: string,
) {
  const order = await createOrderViaApi(request, apiBase, token);
  await advanceOrderViaAdmin(request, apiBase, order.number, ["ACCEPTED", "DELIVERED"]);
  return order;
}
