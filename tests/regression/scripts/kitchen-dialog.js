// Answer the "Switch kitchens?" prompt (TC-06) and read the cart afterwards.
await (async () => {
  // ---- parameters ----
  const BUTTON = "Keep cart & browse"; // or "Clear & continue"
  // ---- end parameters ----

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();
  const find = () => [...document.querySelectorAll("button")].find((b) => clean(b.innerText) === BUTTON);
  const present = /Switch kitchens\?/.test(document.body.innerText);
  const text = clean(document.querySelector(".fixed.inset-0 p.text-sm")?.innerText);
  const button = find();
  if (!present || !button) return { ok: false, error: "prompt not shown", present };

  button.click();
  await sleep(800);
  const panel = document.querySelector("aside.uc-panel");
  return {
    ok: !/Switch kitchens\?/.test(document.body.innerText),
    prompt_text: text,
    clicked: BUTTON,
    counter: Number(document.querySelector('a[href="/checkout"][aria-label^="Cart"] span')?.textContent ?? "0"),
    cart_items: [...(panel?.querySelectorAll(".cic_root") ?? [])].map((r) => clean(r.querySelector("p")?.innerText)),
  };
})()
