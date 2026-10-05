// Read the Explore page: the "N chefs cooking near you" count, the chef cards and the empty state.
// Run it on /explore or /explore?q=... once the page has settled.
await (async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();

  for (let i = 0; i < 50 && !document.querySelector("a.cc_card") && !/No chefs match/.test(document.body.innerText); i++) await sleep(150);

  const cards = [...document.querySelectorAll("a.cc_card")].map((a) => ({
    name: clean(a.querySelector("p")?.innerText),
    delivery: clean(a.querySelector("span")?.innerText),
    meta: clean(a.querySelectorAll("p")[1]?.innerText),
    href: a.getAttribute("href"),
    hasPhoto: !!a.querySelector("img"),
  }));
  const header = clean(document.body.innerText.match(/\d+ chefs cooking near you/)?.[0]);
  const search = document.querySelector("header input");
  return {
    ok: true,
    url: location.pathname + location.search,
    header_text: header,
    header_count: header ? Number(header.match(/\d+/)[0]) : null,
    cards_count: cards.length,
    names: cards.map((c) => c.name),
    cards,
    no_match: /No chefs match/.test(document.body.innerText),
    clear_filters_button: !![...document.querySelectorAll("button")].find((b) => clean(b.innerText) === "Clear filters"),
    search_box: search ? search.value : null,
  };
})()
