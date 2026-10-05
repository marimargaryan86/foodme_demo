// Back office: open an order directly by number and read it. Admin id = order number - 100000.
// Run it in the admin tab (any /backoffice/ page). Keep admin scripts short: the admin tab is in the background and its timers are throttled.
await (async () => {
  // ---- parameters ----
  const NUMBER = "FM-100088";
  // ---- end parameters ----

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitFor = async (fn, ms = 9000) => { const end = Date.now() + ms; for (;;) { const v = fn(); if (v) return v; if (Date.now() > end) return null; await sleep(200); } };
  const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();

  const id = Number(NUMBER.replace(/\D/g, "")) - 100000;
  location.hash = `#/orders/${id}/show`;
  // Wait for THIS order's heading: the previous order's page is still on screen right after the hash changes.
  const heading = await waitFor(() => { const h = document.querySelector("h5"); return h && clean(h.innerText) === `Order ${NUMBER}` ? h : null; });
  if (!heading) return { ok: false, error: "order page did not load or shows another order", hash: location.hash, heading: clean(document.querySelector("h5")?.innerText), text: clean(document.body.innerText).slice(0, 160) };
  await sleep(300);

  const h5 = clean(heading.innerText);
  const detail = (label) => clean([...document.querySelectorAll("h6, .MuiTypography-subtitle2")].find((e) => clean(e.innerText) === label)?.nextElementSibling?.innerText);
  return {
    ok: h5 === `Order ${NUMBER}`,
    heading: h5,
    status: clean(document.querySelector(".MuiChip-label")?.innerText),
    chef: detail("Chef"),
    receiver: detail("Receiver"),
    items: [...document.querySelectorAll("table tbody tr")].map((r) => [...r.cells].map((c) => clean(c.innerText)).join(" | ")),
    total: clean([...document.querySelectorAll("h6")].find((e) => /AMD$/.test(clean(e.innerText)))?.innerText),
    actions: [...document.querySelectorAll("button")].map((b) => clean(b.innerText)).filter((t) => /^Mark as /.test(t)),
  };
})()
