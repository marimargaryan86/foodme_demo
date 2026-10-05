// Remove every line from the cart by clicking "Remove item" (via JavaScript: a ref click can silently do nothing).
// Run it on a chef page whose kitchen owns the cart lines. If it returns foreign_kitchen: true, open the other fixed chef and run it again.
await (async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitFor = async (fn, ms = 4000) => { const end = Date.now() + ms; for (;;) { const v = fn(); if (v) return v; if (Date.now() > end) return null; await sleep(120); } };
  const counter = () => Number(document.querySelector('a[href="/checkout"][aria-label^="Cart"] span')?.textContent ?? "0");
  const buttons = () => [...document.querySelectorAll('aside.uc-panel button[aria-label="Remove item"]')];

  // The panel only lists lines once the chef page has loaded, while the header counter is available at once: wait for the lines.
  await waitFor(() => document.querySelector("aside.uc-panel") && (buttons().length > 0 || counter() === 0 || /Cart has another kitchen/.test(document.body.innerText)), 10000);
  let removed = 0;
  for (let i = 0; i < 20 && buttons().length > 0; i++) {
    const before = buttons().length;
    buttons()[0].click();
    await waitFor(() => buttons().length < before);
    removed++;
    await sleep(200);
  }
  return {
    ok: buttons().length === 0 && counter() === 0,
    removed,
    counter: counter(),
    empty_text: /Your cart is empty/.test(document.body.innerText),
    foreign_kitchen: /Cart has another kitchen/.test(document.body.innerText),
  };
})()
