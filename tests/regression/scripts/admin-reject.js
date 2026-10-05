// Back office: reject flow on the order page that is open (TC-15). One MODE per run; run them in order, with a 3-5 s wait between runs.
//   "open"    click "Mark as REJECTED" and report the dialog
//   "empty"   click "Reject order" with an empty reason: expects the warning "A rejection reason is required"
//   "cancel"  click "Cancel": expects the dialog to close (waits up to 8 s) and the status to stay NEW
//   "confirm" type REASON and click "Reject order": expects the status REJECTED
await (async () => {
  // ---- parameters ----
  const NUMBER = "FM-100089";
  const MODE = "open"; // "open" | "empty" | "cancel" | "confirm"
  const REASON = "Kitchen closed early";
  // ---- end parameters ----

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitFor = async (fn, ms = 9000) => { const end = Date.now() + ms; for (;;) { const v = fn(); if (v) return v; if (Date.now() > end) return null; await sleep(200); } };
  const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();
  const status = () => clean(document.querySelector(".MuiChip-label")?.innerText);
  const dialog = () => document.querySelector('[role=dialog]');
  const btn = (text, root = document) => [...root.querySelectorAll("button")].find((b) => clean(b.innerText) === text);
  const actions = () => [...document.querySelectorAll("button")].map((b) => clean(b.innerText)).filter((t) => /^Mark as /.test(t));

  if (clean(document.querySelector("h5")?.innerText) !== `Order ${NUMBER}`) return { ok: false, error: "the open page is not this order", heading: clean(document.querySelector("h5")?.innerText) };
  const out = { mode: MODE, status_before: status() };

  if (MODE === "open") {
    const b = btn("Mark as REJECTED");
    if (!b) return { ok: false, error: "Mark as REJECTED not available", ...out, actions: actions() };
    b.click();
    const d = await waitFor(() => dialog());
    return { ...out, ok: !!d, dialog_title: clean(d?.querySelector("h2")?.innerText), has_reason_field: !!d?.querySelector("textarea"), buttons: [...(d?.querySelectorAll("button") ?? [])].map((x) => clean(x.innerText)) };
  }

  const d = dialog();
  if (!d) return { ...out, ok: false, error: "reject dialog is not open; run MODE open first" };

  if (MODE === "empty") {
    btn("Reject order", d).click();
    const warned = await waitFor(() => /A rejection reason is required/.test(document.body.innerText), 4000);
    return { ...out, ok: !!warned, empty_reason_error: warned ? "A rejection reason is required" : null, dialog_open: !!dialog(), status: status() };
  }

  if (MODE === "cancel") {
    btn("Cancel", d).click();
    const closed = await waitFor(() => !dialog(), 8000);
    await sleep(500);
    return { ...out, ok: !!closed, dialog_closed: !!closed, status: status() };
  }

  if (MODE === "confirm") {
    const area = d.querySelector("textarea");
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set.call(area, REASON);
    area.dispatchEvent(new Event("input", { bubbles: true }));
    await sleep(300);
    btn("Reject order", d).click();
    const done = await waitFor(() => status() === "REJECTED");
    await sleep(500);
    return { ...out, ok: !!done, status: status(), notice: /Order status updated/.test(document.body.innerText), actions: actions() };
  }
  return { ok: false, error: "unknown MODE", MODE };
})()
