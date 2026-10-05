// On a chef page: open a dish by NAME, optionally tick one addition, add it to the cart.
// Run it on /chef/<id>. Never picks "the first card": the card order isn't stable while the page loads.
await (async () => {
  // ---- parameters ----
  const DISH = "Mushroom soup"; // exact dish name
  const ADDITION = ""; // addition name, e.g. "Soy Sauce"; "" for none
  const CHECK_PRICE_STEPS = false; // TC-03 only: with ADDITION, also untick and tick again and record the button price at each step
  const REQUIRE_EMPTY_CART = false; // true when the cart must be empty first: returns "cart not empty" without adding
  // ---- end parameters ----

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitFor = async (fn, ms = 8000) => { const end = Date.now() + ms; for (;;) { const v = fn(); if (v) return v; if (Date.now() > end) return null; await sleep(150); } };
  const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();
  const num = (s) => Number(String(s ?? "").replace(/[^\d]/g, ""));
  const counter = () => Number(document.querySelector('a[href="/checkout"][aria-label^="Cart"] span')?.textContent ?? "0");
  const dialog = () => document.querySelector('[role=dialog]');
  const addButton = () => [...(dialog()?.querySelectorAll("button") ?? [])].find((b) => /^(Add to cart|Added|Adding)/.test(clean(b.innerText)));
  const price = () => num(clean(addButton()?.innerText).split("·")[1]);

  if (REQUIRE_EMPTY_CART && counter() !== 0) return { ok: false, error: "cart not empty", counter: counter() };

  const card = await waitFor(() => [...document.querySelectorAll("button.dc_card")].find((b) => clean(b.querySelector("p")?.innerText) === DISH));
  if (!card) return { ok: false, error: "dish not found on this page", dish: DISH, url: location.pathname, chef_not_found: /Chef not found/.test(document.body.innerText) };
  card.click();
  if (!(await waitFor(() => dialog() && addButton()))) return { ok: false, error: "dish dialog did not open", dish: DISH };

  const title = clean(dialog().querySelector("h2")?.innerText);
  const result = { ok: true, dish: title, addition: ADDITION || null, price_steps: [price()] };

  if (ADDITION) {
    const label = [...dialog().querySelectorAll("label")].find((l) => clean(l.querySelector("span.flex-1")?.innerText ?? l.innerText).startsWith(ADDITION));
    const box = label?.querySelector("input[type=checkbox]");
    if (!box) return { ok: false, error: "addition not found", addition: ADDITION, additions: [...dialog().querySelectorAll("label")].map((l) => clean(l.innerText)) };
    const toggle = async (want) => {
      if (box.checked !== want) box.click();
      await waitFor(() => box.checked === want, 2000);
      await sleep(250);
      result.price_steps.push(price());
    };
    await toggle(true);
    if (CHECK_PRICE_STEPS) { await toggle(false); await toggle(true); }
    result.addition_price = result.price_steps[1] - result.price_steps[0];
  }

  // A "Switch kitchens?" prompt appears only after the click, so the outcome is read afterwards.
  addButton().click();
  const outcome = await waitFor(() => (/Switch kitchens\?/.test(document.body.innerText) ? "mismatch" : null) || (!dialog() ? "closed" : null), 6000);
  await sleep(300);
  result.outcome = outcome ?? "dialog still open";
  result.ok = outcome === "closed" || outcome === "mismatch";
  result.counter = counter();
  return result;
})()
