// On /checkout: choose Delivery or Takeaway and read what the page shows (address fields, Delivery, Total).
await (async () => {
  // ---- parameters ----
  const METHOD = "Delivery"; // "Delivery" or "Takeaway"; "" only reads
  // ---- end parameters ----

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitFor = async (fn, ms = 6000) => { const end = Date.now() + ms; for (;;) { const v = fn(); if (v) return v; if (Date.now() > end) return null; await sleep(150); } };
  const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();
  const num = (s) => { const d = String(s ?? "").replace(/[^\d]/g, ""); return d === "" ? null : Number(d); };
  const form = await waitFor(() => document.querySelector("form#checkout-form"));
  if (!form) return { ok: false, error: "checkout form not shown", url: location.pathname, text: clean(document.body.innerText).slice(0, 200) };

  if (METHOD) {
    const button = [...form.querySelectorAll(".dti_row button")].find((b) => clean(b.querySelector("span.font-semibold, span.block")?.innerText) === METHOD);
    if (!button) return { ok: false, error: "method button not found", method: METHOD };
    button.click();
    await waitFor(() => button.getAttribute("aria-pressed") === "true");
    await sleep(500); // delivery price is fetched from the API
    await waitFor(() => !/Calculating/.test(document.body.innerText), 8000);
  }
  const value = (label) => {
    const span = [...document.querySelectorAll("aside span")].find((s) => clean(s.innerText) === label);
    return span?.nextElementSibling ? clean(span.nextElementSibling.innerText) : null;
  };
  const delivery = value("Delivery");
  return {
    ok: true,
    method: clean([...form.querySelectorAll(".dti_row button[aria-pressed=true] span.block")][0]?.innerText),
    address_fields_shown: !!form.querySelector("#city"),
    subtotal: num(value("Subtotal")),
    delivery: delivery === null ? null : /free/i.test(delivery) ? "Free" : num(delivery),
    total: num(value("Total")),
    fields: Object.fromEntries(["receiverName", "receiverPhoneNumber", "receiverEmail", "city", "street", "building", "apartment"].map((id) => [id, form.querySelector("#" + id)?.value ?? null])),
  };
})()
