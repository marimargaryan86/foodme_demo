// TC-11: click "Place order" with an INVALID form and read the validation messages.
// Refuses to click when every field looks valid, so it can never place an order by accident.
await (async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();
  const form = document.querySelector("form#checkout-form");
  if (!form) return { ok: false, error: "checkout form not shown", url: location.pathname };

  const v = (id) => form.querySelector("#" + id)?.value ?? null;
  const delivery = !!form.querySelector("#city");
  const looksValid =
    clean(v("receiverName")).length >= 2 &&
    (v("receiverPhoneNumber") ?? "").replace(/\D/g, "").length >= 8 &&
    /^\S+@\S+\.\S+$/.test(v("receiverEmail") ?? "") &&
    (!delivery || (clean(v("city")) && clean(v("street"))));
  if (looksValid) return { ok: false, error: "form looks valid; refusing to click Place order", fields: { name: v("receiverName"), phone: v("receiverPhoneNumber"), email: v("receiverEmail") } };

  const button = [...document.querySelectorAll("button")].find((b) => b.getAttribute("form") === "checkout-form" && /Place order/.test(b.innerText));
  button.click();
  await sleep(1200);
  const messages = [...form.querySelectorAll("p[id$='-error']")].map((p) => clean(p.innerText));
  return {
    ok: true,
    still_on_checkout: location.pathname === "/checkout",
    messages_count: messages.length,
    messages,
    address_fields_shown: !!form.querySelector("#city"),
  };
})()
