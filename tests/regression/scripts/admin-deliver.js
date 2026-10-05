// Back office: click "Mark as DELIVERED" on the order page that is open, then read the result.
// Run admin-open-order.js first. It refuses when the open page isn't the order in NUMBER.
await (async () => {
  // ---- parameters ----
  const NUMBER = "FM-100088";
  // ---- end parameters ----

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitFor = async (fn, ms = 9000) => { const end = Date.now() + ms; for (;;) { const v = fn(); if (v) return v; if (Date.now() > end) return null; await sleep(200); } };
  const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();
  const status = () => clean(document.querySelector(".MuiChip-label")?.innerText);

  if (clean(document.querySelector("h5")?.innerText) !== `Order ${NUMBER}`) return { ok: false, error: "the open page is not this order", heading: clean(document.querySelector("h5")?.innerText) };
  const before = status();
  const button = [...document.querySelectorAll("button")].find((b) => clean(b.innerText) === "Mark as DELIVERED");
  if (!button) return { ok: false, error: "button not available", status_before: before, actions: [...document.querySelectorAll("button")].map((b) => clean(b.innerText)).filter((t) => /^Mark as /.test(t)) };
  button.click();
  const changed = await waitFor(() => status() === "DELIVERED");
  await sleep(500);
  return {
    ok: !!changed,
    status_before: before,
    status: status(),
    notice: /Order status updated/.test(document.body.innerText),
    actions: [...document.querySelectorAll("button")].map((b) => clean(b.innerText)).filter((t) => /^Mark as /.test(t)),
  };
})()
