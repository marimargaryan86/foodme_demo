// Search FoodMe from the header box and report the resulting URL.
await (async () => {
  // ---- parameters ----
  const QUERY = "Sakura";
  // ---- end parameters ----

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const input = [...document.querySelectorAll("header input")].find((i) => /search foodme/i.test(i.placeholder || i.labels?.[0]?.innerText || ""));
  if (!input) return { ok: false, error: "header search input not found" };

  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, QUERY);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.form.requestSubmit();

  const wanted = "q=" + encodeURIComponent(QUERY).toLowerCase();
  for (let i = 0; i < 40 && !location.search.toLowerCase().includes(wanted); i++) await sleep(150);
  return { ok: true, query: QUERY, url: location.pathname + location.search };
})()
