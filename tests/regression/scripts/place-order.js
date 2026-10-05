// Click "Place order" on /checkout, but only when the cart holds exactly the expected lines. Then read the success page.
// The guard exists because a wrong cart (e.g. 2x the dish after a failed earlier call) places a wrong order for real.
await (async () => {
  // ---- parameters ----
  const EXPECTED = [{ name: "Mushroom soup", quantity: 1 }]; // the exact cart lines; the script refuses to click otherwise
  // ---- end parameters ----

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitFor = async (fn, ms = 20000) => { const end = Date.now() + ms; for (;;) { const v = fn(); if (v) return v; if (Date.now() > end) return null; await sleep(200); } };
  const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();
  const num = (s) => { const d = String(s ?? "").replace(/[^\d]/g, ""); return d === "" ? null : Number(d); };

  const counter = Number(document.querySelector('a[href="/checkout"][aria-label^="Cart"] span')?.textContent ?? "0");
  if (location.pathname !== "/checkout") return { ok: false, placed: false, error: "not on /checkout", url: location.pathname };
  if (counter === 0 || /Nothing to check out/.test(document.body.innerText)) return { ok: false, placed: false, error: "cart empty", counter };

  const lines = [...document.querySelectorAll(".cs_wrap .grid")].map((g) => ({
    name: clean(g.querySelector("p.font-medium")?.innerText),
    quantity: num(g.querySelector("span.tabular-nums")?.innerText),
  }));
  const same = lines.length === EXPECTED.length && EXPECTED.every((e) => lines.some((l) => l.name === e.name && l.quantity === e.quantity));
  if (!same) return { ok: false, placed: false, error: "cart does not match the expected lines; not placing", expected: EXPECTED, lines, counter };

  const button = [...document.querySelectorAll("button")].find((b) => b.getAttribute("form") === "checkout-form" && /Place order/.test(b.innerText));
  if (!button || button.disabled) return { ok: false, placed: false, error: "Place order button missing or disabled" };
  button.click();

  const submitError = () => document.querySelector("aside p.bg-red-50");
  const done = await waitFor(() => location.pathname.startsWith("/orders/success") || /Order failed/.test(document.body.innerText) || submitError());
  if (!done) return { ok: false, placed: "unknown", error: "no result within 20 s; check /orders before retrying", url: location.pathname };
  if (submitError()) return { ok: false, placed: false, error: "checkout showed an error", message: clean(submitError().innerText), url: location.pathname };
  const text = clean(document.body.innerText);
  const number = text.match(/FM-\d+/)?.[0] ?? null;
  return {
    ok: !!number,
    placed: !!number,
    url: location.pathname + location.search,
    heading: clean(document.querySelector("h1")?.innerText),
    order_number: number,
    buttons: [...document.querySelectorAll("main a, main button, a.rounded-full, button.rounded-full")].map((b) => clean(b.innerText)).filter((t) => /Track order|View my orders|Back to explore/.test(t)),
    counter: Number(document.querySelector('a[href="/checkout"][aria-label^="Cart"] span')?.textContent ?? "0"),
  };
})()
