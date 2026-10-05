// Click "Increase quantity" or "Decrease quantity" on a cart line (chef page cart panel) and report the new quantity and prices.
await (async () => {
  // ---- parameters ----
  const ACTION = "increase"; // "increase" or "decrease"
  const TIMES = 1;
  const ITEM = ""; // dish name of the cart line; "" = the only / first line
  // ---- end parameters ----

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitFor = async (fn, ms = 4000) => { const end = Date.now() + ms; for (;;) { const v = fn(); if (v) return v; if (Date.now() > end) return null; await sleep(120); } };
  const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();
  const num = (s) => Number(String(s ?? "").replace(/[^\d]/g, ""));
  const label = ACTION === "increase" ? "Increase quantity" : "Decrease quantity";
  const line = () => [...document.querySelectorAll("aside.uc-panel .cic_root")].find((r) => !ITEM || clean(r.querySelector(".cic_body p")?.innerText) === ITEM);
  const qty = () => Number(clean(line()?.querySelector(".fm-qty-grp p")?.innerText));
  const read = () => ({
    quantity: qty(),
    line_price: num(line()?.querySelector(".cic_body p.tabular-nums span")?.innerText),
    still_in_cart: !!line(),
    counter: Number(document.querySelector('a[href="/checkout"][aria-label^="Cart"] span')?.textContent ?? "0"),
  });

  if (!line()) return { ok: false, error: "cart line not found", item: ITEM };
  const steps = [];
  for (let i = 0; i < TIMES; i++) {
    const before = qty();
    const button = line()?.querySelector(`button[aria-label="${label}"]`);
    if (!button || button.disabled) return { ok: false, error: `"${label}" missing or disabled`, steps, ...read() };
    button.click();
    await waitFor(() => qty() !== before);
    await sleep(250);
    steps.push(read());
  }
  return { ok: true, action: ACTION, times: TIMES, steps, ...read() };
})()
