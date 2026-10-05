// Set a form field by its label (storefront checkout, MUI "Rejection reason", ...).
// Replace the constants, then run the whole file with the browser JavaScript tool.
await (async () => {
  // ---- parameters ----
  const LABEL = "Full name"; // label text, exact (case-insensitive), e.g. "Full name", "Phone", "Email", "City", "Street", "Building", "Rejection reason"
  const VALUE = "QA Regression"; // "" clears the field
  // ---- end parameters ----

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();

  const fields = [...document.querySelectorAll("input:not([type=radio]):not([type=checkbox]), textarea")];
  const el = fields.find((f) => clean(f.labels?.[0]?.innerText).toLowerCase() === LABEL.toLowerCase());
  if (!el) return { ok: false, error: "field not found", label: LABEL, labels: fields.map((f) => clean(f.labels?.[0]?.innerText)).filter(Boolean) };

  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, VALUE);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  await sleep(200);
  return { ok: el.value === VALUE || clean(el.value) !== "", label: LABEL, value: el.value };
})()
