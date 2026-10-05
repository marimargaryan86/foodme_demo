// Read the cart: the header counter plus, on a chef page, the cart panel (lines, Subtotal, Delivery, Total, free-delivery hint).
// On /checkout it reads the order summary instead (lines, Subtotal, Delivery, Total).
await (async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();
  const num = (s) => { const d = String(s ?? "").replace(/[^\d]/g, ""); return d === "" ? null : Number(d); };
  const header = () => Number(document.querySelector('a[href="/checkout"][aria-label^="Cart"] span')?.textContent ?? "0");
  // On a chef page the panel lists lines only after the chef has loaded; wait for them when the header counter says the cart isn't empty.
  for (let i = 0; i < 40 && header() > 0 && document.querySelector("aside.uc-panel") && !document.querySelector("aside.uc-panel .cic_root") && !/Cart has another kitchen/.test(document.body.innerText); i++) await sleep(150);
  await sleep(300);

  const counter = Number(document.querySelector('a[href="/checkout"][aria-label^="Cart"] span')?.textContent ?? "0");
  const root = document.querySelector("aside.uc-panel") ?? document.querySelector(".cs_wrap")?.closest("aside") ?? document.body;
  const value = (label) => {
    const span = [...root.querySelectorAll("span")].find((s) => clean(s.innerText) === label);
    return span?.nextElementSibling ? clean(span.nextElementSibling.innerText) : null;
  };

  let items = [...document.querySelectorAll("aside.uc-panel .cic_root")].map((r) => {
    const ps = [...r.querySelectorAll(".cic_body p")].map((p) => clean(p.innerText));
    return {
      name: ps[0],
      quantity: Number(clean(r.querySelector(".fm-qty-grp p")?.innerText)),
      line_price: num(r.querySelector(".cic_body p.tabular-nums span")?.innerText),
      additions: (ps.find((t) => t.startsWith("+ ")) ?? "").replace(/^\+ /, "").split(", ").filter(Boolean),
    };
  });
  if (items.length === 0) {
    items = [...document.querySelectorAll(".cs_wrap .grid")].map((g) => ({
      name: clean(g.querySelector("p.font-medium")?.innerText),
      quantity: num(g.querySelector("span.tabular-nums")?.innerText),
      line_price: num(g.querySelector("span.shrink-0")?.innerText),
      additions: clean(g.querySelector("p.text-xs")?.innerText).replace(/^\+ /, "").split(", ").filter(Boolean),
    }));
  }

  const hint = clean([...root.querySelectorAll("p, div")].map((e) => e.innerText).find((t) => /^Add [\d,]+ AMD more for free delivery/.test(clean(t))));
  const delivery = value("Delivery");
  return {
    ok: true,
    url: location.pathname,
    counter,
    empty_text: /Your cart is empty|Nothing to check out/.test(document.body.innerText),
    foreign_kitchen: /Cart has another kitchen/.test(document.body.innerText),
    items,
    subtotal: num(value("Subtotal")),
    delivery: delivery === null ? null : /free/i.test(delivery) ? "Free" : num(delivery),
    total: num(value("Total")),
    hint: hint ? hint.replace(/ for free delivery\.?$/, "") : null,
    hint_amount: hint ? num(hint.match(/[\d,]+/)[0]) : null,
  };
})()
