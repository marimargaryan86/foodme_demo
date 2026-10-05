// Storefront: read an order's status. Navigate FRESH to the page first (never read a page loaded before an admin change).
//   /tracking/FM-...  -> heading, chef, the status title and detail, "All orders" link
//   /orders           -> the badge of the order NUMBER in the list
await (async () => {
  // ---- parameters ----
  const NUMBER = "FM-100088"; // used on /orders; on /tracking the page's own number is read
  // ---- end parameters ----

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitFor = async (fn, ms = 10000) => { const end = Date.now() + ms; for (;;) { const v = fn(); if (v) return v; if (Date.now() > end) return null; await sleep(200); } };
  const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();
  // Match the FULL status text: single words also appear in the progress bar ("Received | Preparing | Delivered").
  const TITLES = ["Order received", "Preparing your order", "Delivered", "Order declined"];
  const BADGES = ["Received", "Preparing", "Delivered", "Declined"];

  if (location.pathname.startsWith("/tracking/")) {
    const loaded = await waitFor(() => document.querySelector("h1") && /Order FM-\d+/.test(document.body.innerText) || /Couldn’t load this order/.test(document.body.innerText));
    if (!loaded) return { ok: false, error: "tracking page did not load", url: location.pathname };
    if (/Couldn’t load this order/.test(document.body.innerText)) {
      return { ok: true, url: location.pathname, error_shown: "Couldn’t load this order", buttons: [...document.querySelectorAll("main button, main a")].map((b) => clean(b.innerText)).filter(Boolean) };
    }
    const titleEl = [...document.querySelectorAll("p.font-display")].find((p) => TITLES.includes(clean(p.innerText)));
    return {
      ok: true,
      url: location.pathname,
      heading: clean(document.querySelector("h1")?.innerText),
      chef: clean([...document.querySelectorAll("p")].find((p) => /^Chef · /.test(clean(p.innerText)))?.innerText),
      status_title: clean(titleEl?.innerText) || null,
      status_detail: clean(titleEl?.nextElementSibling?.innerText) || null,
      all_orders_link: !![...document.querySelectorAll("a")].find((a) => clean(a.innerText) === "All orders"),
    };
  }

  if (location.pathname === "/orders") {
    const link = await waitFor(() => document.querySelector(`a[href="/tracking/${NUMBER}"]`));
    if (!link) return { ok: false, error: "order not listed", number: NUMBER, empty: /No orders yet/.test(document.body.innerText) };
    const text = clean(link.innerText);
    return { ok: true, url: location.pathname, number: NUMBER, badge: BADGES.find((b) => text.includes(b)) ?? null, row: text, heading: clean(document.querySelector("h1")?.innerText) };
  }
  return { ok: false, error: "open /tracking/<number> or /orders first", url: location.pathname };
})()
