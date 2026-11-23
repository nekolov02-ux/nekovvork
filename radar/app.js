const $ = id => document.getElementById(id);
const tg = window.Telegram?.WebApp;
const priceApi = document.querySelector('meta[name="radar-valuation-api"]')?.content || "";
const apiOrigin = document.querySelector('meta[name="radar-api"]')?.content || "";
let offlineDemo = false;
let demoData;
tg?.ready();
tg?.expand();
const number = new Intl.NumberFormat("ru", { maximumFractionDigits: 2 });
const fmt = value => value == null ? "—" : number.format(value);
const ton = value => value == null ? "—" : fmt(value) + " TON";
const marketName = { portals: "Portals", mrkt: "MRKT" };
const periodName = { "24h": "24 часа", "7d": "7 дней", "30d": "30 дней" };
const pages = {
  market: ["Рынок подарков", "Цены и продажи на Portals и MRKT"],
  signals: ["Связки Portals ↔ MRKT", "Поиск лотов для перепродажи с учётом расходов"],
  valuation: ["Оценка подарка", "Рыночный ориентир и недавние продажи похожих подарков на MRKT"],
  deals: ["Лоты ниже медианы", "Лоты до 10 TON по сравнению с продажами той же модели"],
  mono: ["Дешёвый монохром", "Совпадение цвета модели и фона"],
  analyst: ["Аналитик", "Подбор подарков по бюджету"],
  saved: ["Избранные коллекции", "Список сохраняется на этом устройстве"],
};
let data, period = "24h", ai = false, generation = 0, monoFilter = { budget: 10 };
const flipStream = new FlipStream();
let flipRules = { budget: 10, transfer: .5, market: "" };
let flipSignature = null;
let favorites;
try { favorites = new Set(JSON.parse(localStorage.getItem("gift-radar:saved") || "[]")); }
catch { favorites = new Set(); }

function element(tag, content, className) {
  const node = document.createElement(tag);
  if (content != null) node.textContent = content;
  if (className) node.className = className;
  return node;
}

function pageName() {
  const name = location.hash.slice(1);
  return Object.hasOwn(pages, name) ? name : "signals";
}

function safeURL(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

function externalLink(url, label, className) {
  const href = safeURL(url);
  const link = element(href ? "a" : "span", label, className);
  if (!href) return link;
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  if (new URL(href).hostname === "t.me") {
    link.addEventListener("click", event => {
      if ((!tg?.initData && (!tg?.platform || tg.platform === "unknown")) || typeof tg.openTelegramLink !== "function" || event.ctrlKey || event.metaKey
          || event.shiftKey || event.altKey) return;
      try {
        tg.openTelegramLink(href);
        event.preventDefault();
      } catch { /* Let the client follow the link normally. */ }
    });
  }
  return link;
}

const fullGiftSlug = /^[A-Za-z][A-Za-z0-9]{0,100}-[1-9]\d{0,9}$/;
function giftSlug(row) {
  for (const value of [row.slug, row.telegram_url, row.url]) {
    const slug = typeof value === "string" && value.replace(/^https:\/\/t\.me\/nft\//i, "");
    if (fullGiftSlug.test(slug)) return slug;
  }
  const prefix = row.slug || (row.name || row.title || "").replace(/[^A-Za-z0-9]/g, "");
  const slug = prefix + "-" + row.number;
  return fullGiftSlug.test(slug) ? slug : null;
}

function giftLink(row, label, className) {
  const slug = giftSlug(row);
  if (!slug) return element("span", label, className);
  const link = element("a", label, className);
  const url = new URL(location.href);
  url.searchParams.set("card", slug);
  link.href = url.href;
  link.addEventListener("click", event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openGiftCard(row, slug);
  });
  return link;
}

function specificMarketURL(value, market) {
  const href = safeURL(value);
  if (!href) return null;
  const url = new URL(href), ref = url.searchParams.get("startapp") || "";
  if (url.hostname !== "t.me") return null;
  if (market === "portals" && /^\/(?:portals|portals_market_bot)\/market$/i.test(url.pathname)
      && /^gift_[0-9a-f-]{36}$/i.test(ref)) return "https://t.me" + url.pathname.toLowerCase() + "?startapp=" + ref;
  if (market === "mrkt" && url.pathname.toLowerCase() === "/mrkt/app"
      && /^(?:feed)?[a-f0-9]{32}$/i.test(ref)) return "https://t.me/mrkt/app?startapp=" + ref;
  return null;
}

const giftBot = document.querySelector('meta[name="radar-bot"]')?.content;
const fragmentGift = "https://nft.fragment.com/gift/";
const giftDialog = $("gift-card");
let cardController, cardAnimation, animationPlayer;

function marketOfferLink(url, venue) {
  return externalLink(url, "Открыть лот на " + marketName[venue] + " ↗", "gift-card-action");
}

function activeOfferURL(value, market) {
  const url = specificMarketURL(value, market);
  return url && !/^feed[a-f0-9]{32}$/i.test(new URL(url).searchParams.get("startapp")) ? url : null;
}

function providedOffer(row) {
  return [row.market_url, row.url].map(url => activeOfferURL(url, row.market)).find(Boolean);
}

function marketLinks(row, { demo = false } = {}) {
  const links = element("span", null, "market-links");
  if (!giftSlug(row)) return links;
  const direct = !demo && providedOffer(row);
  links.append(direct ? marketOfferLink(direct, row.market)
    : giftLink({ ...row, demo }, "Проверить лоты ↗", "gift-link"));
  return links;
}

function loadAnimationPlayer() {
  if (window.lottie) return Promise.resolve(window.lottie);
  if (!animationPlayer) {
    animationPlayer = new Promise((resolve, reject) => {
      const script = element("script");
      script.src = "./lottie-player.js?v=5.13.0";
      script.onload = () => window.lottie ? resolve(window.lottie) : reject(new Error("Player unavailable"));
      script.onerror = reject;
      document.head.append(script);
    }).catch(error => {
      animationPlayer = null;
      throw error;
    });
  }
  return animationPlayer;
}

async function animateGift(slug, stage, button, signal) {
  button.disabled = true;
  try {
    const [player, response] = await Promise.all([
      loadAnimationPlayer(),
      fetch(fragmentGift + slug.toLowerCase() + ".lottie.json", { signal }),
    ]);
    if (!response.ok) throw new Error("Animation unavailable");
    const animationData = await response.json();
    if (signal.aborted) return;
    if (!Array.isArray(animationData.layers) || animationData.w !== 512 || animationData.h !== 512
        || animationData.assets?.some(asset => asset.p || asset.u)) throw new Error("Unsupported animation");
    const animation = player.loadAnimation({
      container: stage.querySelector(".gift-art-motion"), renderer: "canvas",
      loop: true, autoplay: true, animationData,
      rendererSettings: { dpr: Math.min(window.devicePixelRatio || 1, 2) },
    });
    cardAnimation = animation;
    animation.addEventListener("DOMLoaded", () => {
      if (signal.aborted) return;
      stage.dataset.animated = "true";
      button.disabled = false;
      button.textContent = "Пауза";
      let paused = false;
      button.onclick = () => {
        paused = !paused;
        if (paused) animation.pause();
        else animation.play();
        button.textContent = paused ? "Воспроизвести" : "Пауза";
      };
    });
    animation.addEventListener("data_failed", () => { if (!signal.aborted) button.hidden = true; });
  } catch {
    if (!signal.aborted) button.hidden = true;
  }
}

function displayGiftName(slug) {
  return slug.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/-(\d+)$/, " #$1");
}

async function loadCardOffers(row, slug, panel, signal) {
  const existing = !row.demo && providedOffer(row);
  const offers = new Map(existing ? [[row.market, existing]] : []);
  const renderOffers = () => [...offers].map(([venue, url]) => marketOfferLink(url, venue));
  panel.replaceChildren(...renderOffers(), element("p", "Проверяем активные лоты…", "muted"));
  try {
    const query = new URLSearchParams({ gift: slug });
    const response = await fetch(priceApi + "/api/listing?" + query,
      { signal: AbortSignal.any ? AbortSignal.any([signal, AbortSignal.timeout(6500)]) : signal });
    if (!response.ok) throw new Error("Listing unavailable");
    const result = await response.json();
    if (signal.aborted) return;
    for (const offer of result.offers || []) {
      const url = activeOfferURL(offer.url, offer.market);
      if (url) offers.set(offer.market, url);
    }
    if (offers.size) panel.replaceChildren(...renderOffers());
    else panel.replaceChildren(element("p", "Прямой ссылки на активный лот этого подарка пока нет.", "muted"));
  } catch {
    if (signal.aborted) return;
    if (offers.size) panel.replaceChildren(...renderOffers());
    else panel.replaceChildren(element("p", "Проверка лотов временно недоступна.", "muted"));
  }
}

function openGiftCard(row, slug = giftSlug(row)) {
  if (!slug) return;
  cardController?.abort();
  cardAnimation?.destroy();
  cardAnimation = null;
  cardController = new AbortController();
  const { signal } = cardController;
  const name = typeof row.collection === "string" && row.model?.name ? row.collection : row.name || row.title;
  const title = name && !name.includes("#") ? name + " #" + slug.split("-").at(-1) : name || displayGiftName(slug);
  $("gift-card-title").textContent = title;

  const stage = element("div", null, "gift-art-stage");
  const image = element("img", null, "gift-art-static");
  image.alt = title;
  image.src = fragmentGift + slug.toLowerCase() + ".large.jpg";
  image.addEventListener("error", () => {
    const alternate = safeURL(row.image || row.preview);
    if (alternate && image.src !== alternate) image.src = alternate;
    else image.replaceWith(element("span", "🎁", "gift-art-placeholder"));
  });
  const motion = element("div", null, "gift-art-motion");
  motion.setAttribute("aria-hidden", "true");
  const play = element("button", "Воспроизвести", "gift-motion-toggle");
  play.type = "button";
  play.onclick = () => animateGift(slug, stage, play, signal);
  stage.append(image, motion, play);

  const actions = element("div", null, "gift-card-controls");
  actions.append(externalLink("https://t.me/nft/" + slug, "В Telegram ↗", "gift-card-action"));
  if (giftBot && /^[a-zA-Z0-9_]{5,32}$/.test(giftBot)) {
    const share = new URLSearchParams({ url: "https://t.me/" + giftBot + "?startapp=gift_" + slug, text: title });
    actions.append(externalLink("https://t.me/share/url?" + share, "Поделиться", "gift-card-action"));
  }

  const body = $("gift-card-body");
  body.replaceChildren(stage);
  if (!row.demo) {
    const traits = [row.model?.name || row.model, row.backdrop?.name || row.backdrop, row.symbol?.name || row.symbol]
      .filter(trait => typeof trait === "string" && trait);
    if (traits.length) body.append(element("p", traits.join(" · "), "gift-card-traits"));
  }
  const markets = element("div", null, "gift-card-markets");
  markets.setAttribute("aria-live", "polite");
  body.append(markets, actions);
  if (!giftDialog.open) giftDialog.showModal();
  giftDialog.scrollTop = 0;
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) play.click();
  loadCardOffers(row, slug, markets, signal);
}

giftDialog.addEventListener("close", () => {
  cardController?.abort();
  cardAnimation?.destroy();
  cardAnimation = null;
});

async function api(path, body) {
  const headers = {};
  if (tg?.initData && ["/api/profile", "/api/ai"].includes(path)) {
    headers["X-Telegram-Init-Data"] = tg.initData;
  }
  if (body) headers["Content-Type"] = "application/json";
  const response = await fetch(apiOrigin + path, {
    headers,
    method: body ? "POST" : "GET",
    body: body && JSON.stringify(body),
    signal: AbortSignal.timeout(path === "/api/ai" ? 38000 : 6500),
  });
  if (!response.headers.get("Content-Type")?.includes("application/json")) throw new Error("API недоступен.");
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Ошибка загрузки.");
  return result;
}

function giftIcon(image, emoji = "🎁") {
  const icon = element("span", emoji, "gift-icon");
  icon.setAttribute("aria-hidden", "true");
  const url = safeURL(image);
  if (url) {
    const img = element("img");
    img.alt = "";
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";
    img.addEventListener("error", () => icon.textContent = emoji);
    img.src = url;
    icon.replaceChildren(img);
  }
  return icon;
}

function listing(row, kind) {
  const item = element("article", null, "list-item");
  const title = giftLink({ ...row, demo: data?.demo }, null, "item-title gift-link");
  const slug = giftSlug(row);
  const thumb = slug ? fragmentGift + slug.toLowerCase() + ".medium.jpg" : row.image;
  title.append(giftIcon(thumb,
    data?.collections.find(c => c.id === row.collection)?.emoji),
    element("span", row.name + (row.number ? " #" + row.number : "")));
  const price = element("div", ton(row.price), "item-price");
  price.append(element("div", marketName[row.market], "dim"));
  const details = element("div", null, "item-detail");
  if (row.model) details.append(element("span", row.model));
  if (kind === "mono") {
    const backdrop = element("span", row.backdrop + " · " + row.score + "% совпадения");
    const swatch = element("i", null, "swatch");
    swatch.style.backgroundColor = row.swatch;
    backdrop.prepend(swatch, " ");
    details.append(backdrop);
  }
  if (row.discount != null) {
    details.append(element("span", "−" + fmt(row.discount) + "% к медиане", "positive"));
    if (row.median != null) details.append(element("span", ton(row.median) + " · " + row.sample + " продаж"));
  }
  details.append(marketLinks(row, { demo: data?.demo }));
  item.append(title, price, details);
  return item;
}

function showRows(container, rows, kind, empty) {
  container.replaceChildren(...(rows.length ? rows.map(row => listing(row, kind)) : [element("p", empty, "empty")]));
}

function collectionTable(target, rows) {
  if (!rows.length) {
    target.replaceChildren(element("p", "Коллекции не найдены.", "empty"));
    return;
  }
  const table = element("table");
  const head = table.createTHead().insertRow();
  ["Коллекция", "Portals", "MRKT", "Разница", "Оборот, TON", "☆"].forEach((label, i) => {
    const th = element("th", label, i === 4 ? "table-volume" : "");
    th.scope = "col";
    head.append(th);
  });
  const body = table.createTBody();
  for (const row of rows) {
    const tr = body.insertRow();
    const open = element("button", null, "collection-link");
    open.type = "button";
    open.append(giftIcon(row.image, row.emoji), element("span", row.name));
    open.onclick = () => {
      const detail = $("detail-body");
      detail.replaceChildren(element("h2", row.name));
      detail.firstChild.id = "detail-title";
      detail.append(element("p", "Portals " + ton(row.floors.portals) + " · MRKT " + ton(row.floors.mrkt)));
      const lots = element("div");
      showRows(lots, data.listings.filter(item => item.collection === row.id).slice(0, 10), "market", "Лоты пока недоступны.");
      detail.append(lots);
      $("detail").showModal();
    };
    tr.insertCell().append(open);
    for (const key of ["portals", "mrkt"]) {
      const cell = tr.insertCell();
      cell.textContent = fmt(row.floors[key]);
      if (row.floors[key] != null && row.spread > 0 && row.floors[key] === row.floor) cell.className = "positive";
    }
    tr.insertCell().textContent = row.spread == null ? "—" : fmt(row.spread) + "%";
    const volume = tr.insertCell();
    volume.className = "table-volume";
    volume.textContent = fmt(row.volume);
    const button = element("button", favorites.has(row.id) ? "★" : "☆", "favorite");
    button.setAttribute("aria-pressed", favorites.has(row.id));
    button.setAttribute("aria-label", "Избранное · " + row.name);
    button.onclick = () => {
      if (favorites.has(row.id)) favorites.delete(row.id);
      else favorites.add(row.id);
      try { localStorage.setItem("gift-radar:saved", JSON.stringify([...favorites])); } catch {}
      button.textContent = favorites.has(row.id) ? "★" : "☆";
      button.setAttribute("aria-pressed", favorites.has(row.id));
      if (pageName() === "saved") render();
    };
    tr.insertCell().append(button);
  }
  target.replaceChildren(table);
}

function drawChart() {
  if (!data || pageName() !== "market") return;
  const canvas = $("chart");
  const width = canvas.clientWidth, height = canvas.clientHeight, ratio = window.devicePixelRatio || 1;
  if (!width || !height) return;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  const m = 16, bottom = height - 20, step = (width - 2*m) / 12;
  const max = Math.max(1, ...data.chart.portals, ...data.chart.mrkt);
  ctx.strokeStyle = "#30382f";
  for (let i = 0; i < 4; i++) {
    const y = bottom - i * (bottom - m) / 3;
    ctx.beginPath(); ctx.moveTo(m, y); ctx.lineTo(width - m, y); ctx.stroke();
  }
  Object.entries(data.chart).forEach(([market, series], j) => {
    ctx.fillStyle = market === "portals" ? "#cdf779" : "#91bbff";
    const bar = Math.min(16, step * .31);
    series.forEach((value, i) => {
      const h = value / max * (bottom - m);
      ctx.fillRect(m + i*step + step*.15 + j*(bar + 3), bottom - h, bar, h);
    });
  });
  canvas.setAttribute("aria-label", "Оборот за " + periodName[data.period] + ". Portals " +
    ton(data.chart.portals.reduce((sum, n) => sum+n, 0)) + ", MRKT " +
    ton(data.chart.mrkt.reduce((sum, n) => sum+n, 0)));
}
window.addEventListener("resize", drawChart);

const flipHistory = new Map();
let nextHistoryProbe = 0;

function historicFlipSales(pairs, now) {
  for (const [key, saved] of flipHistory) {
    if (saved.until <= now) flipHistory.delete(key);
  }
  let capacity = now >= nextHistoryProbe ? 3 : 0;
  const seen = new Set();
  const sales = [];
  for (const { buy, target } of pairs) {
    const key = target + buy.traits;
    if (seen.has(key)) continue;
    seen.add(key);
    const saved = flipHistory.get(key);
    if (saved) { sales.push(...saved.sales); continue; }
    if (!capacity) continue;
    capacity--;
    nextHistoryProbe = now + 12000;
    const entry = { until: now + 180000, sales: [] };
    flipHistory.set(key, entry);
    const query = new URLSearchParams({ gift: giftSlug(buy), market: target });
    fetch(priceApi + "/api/flip-history?" + query, { signal: AbortSignal.timeout(11000) })
      .then(response => {
        if (!response.ok) throw new Error("History unavailable");
        return response.json();
      }).then(result => {
        entry.sales = (result.sales || []).flatMap(sale => {
          if (!fullGiftSlug.test(sale.slug) || !Number.isFinite(sale.at) || !Number.isFinite(sale.price) || sale.price <= 0) return [];
          const [slug, number] = sale.slug.split("-");
          if (flipTraits(slug.toLowerCase(), sale.model, sale.backdrop) !==
              flipTraits(buy.slug.toLowerCase(), buy.model, buy.backdrop)) return [];
          return [{ ...sale, market: target, traits: buy.traits, number: Number(number) }];
        });
      }).catch(() => { entry.until = Date.now() + 45000; });
  }
  return sales;
}

const flipOfferChecks = new Map();
let nextFlipProbe = 0;

function verifiedFlips(candidates, now) {
  for (const [key, check] of flipOfferChecks) {
    if (check.until <= now) flipOfferChecks.delete(key);
  }
  let capacity = now >= nextFlipProbe ? 4 : 0;
  const checkListing = row => {
    const slug = giftSlug(row);
    const key = row.market + ":" + slug;
    let check = flipOfferChecks.get(key);
    if (!check && slug && capacity > 0) {
      capacity--;
      nextFlipProbe = now + 10000;
      check = { until: now + 35000, offer: null };
      flipOfferChecks.set(key, check);
      fetch(priceApi + "/api/listing?" + new URLSearchParams({ gift: slug }), { signal: AbortSignal.timeout(6500) })
        .then(response => {
          if (!response.ok) throw new Error("Listing unavailable");
          return response.json();
        }).then(({ offers }) => {
          const offer = offers?.find(item => item.market === row.market && Number.isFinite(item.price) && item.price > 0);
          const url = offer && activeOfferURL(offer.url, row.market);
          if (url) check.offer = { ...offer, url };
        }).catch(() => {});
    }
    return check?.offer;
  };
  return candidates.flatMap(candidate => {
    const buy = checkListing(candidate.buy);
    const ask = checkListing(candidate.ask);
    if (!buy || !ask || buy.locked) return [];
    const fresh = priceFlip(candidate, flipRules,
      Math.max(candidate.buy.price, buy.price), Math.min(candidate.ask.price, ask.price));
    if (!fresh) return [];
    fresh.buy.market_url = buy.url;
    fresh.ask.market_url = ask.url;
    return [fresh];
  }).sort((a, b) => b.net - a.net);
}

function flipCard(candidate) {
  const { buy, ask, target, targetPrice, cost, fee, entry, net, sample, latestSale } = candidate;
  const card = element("article", null, "panel flip-card");
  const heading = element("header", null, "flip-card-head");
  const title = element("div");
  const route = element("p", marketName[buy.market] + " → " + marketName[target], "flip-route");
  const headingText = element("h3");
  headingText.append(giftLink(buy, buy.title + " #" + buy.number, "gift-link"));
  title.append(route, headingText, element("p", buy.model + " · " + buy.backdrop));
  const result = element("div", null, "flip-net");
  result.append(element("span", "Остаток по расчёту"), element("strong", "+" + ton(net)));
  heading.append(title, result);

  const metrics = element("dl", null, "flip-metrics");
  for (const [label, value] of [
    ["Лот", ton(buy.price)], ["Перенос", ton(cost)], ["Общий вход", ton(entry)],
    ["Ориентир продажи", ton(targetPrice)], ["Комиссия продажи", ton(fee)],
    ["Цена безубыточности", ton(Math.ceil(entry / (1 - flipMarkets[target].fee) * 100) / 100)],
  ]) {
    const metric = element("div");
    metric.append(element("dt", label), element("dd", value));
    metrics.append(metric);
  }

  const footer = element("footer", null, "flip-card-foot");
  footer.append(element("span", "Продано за 7 дней · " + fmt(sample) + " разных аналогов", "muted"));
  const last = element("span", null, "muted");
  last.append("Последняя продажа · ", giftLink(latestSale, displayGiftName(giftSlug(latestSale)), "gift-link"),
    " · " + ton(latestSale.price) + " · " + new Date(latestSale.at).toLocaleString("ru", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }));
  footer.append(last);
  const comparison = element("span", null, "muted");
  comparison.append("Аналог на " + marketName[target] + " · ", giftLink(ask, ask.title + " #" + ask.number, "gift-link"), " · " + ton(ask.price));
  footer.append(comparison, marketLinks(buy), marketLinks(ask));
  card.append(heading, metrics, footer);
  return card;
}

function renderFlips() {
  const status = flipStream.status;
  const { listings, sales } = flipStream.snapshot();
  const live = status === "live";
  const now = Date.now();
  const pairs = live ? flipPairs(listings, flipRules) : [];
  const possible = live ? rankFlips(listings, [...sales, ...historicFlipSales(pairs, now)], flipRules, now, pairs) : [];
  const candidates = live ? verifiedFlips(possible, now) : [];
  const counts = { portals: 0, mrkt: 0 };
  for (const row of listings) counts[row.market]++;
  $("flip-portals-count").textContent = fmt(counts.portals);
  $("flip-mrkt-count").textContent = fmt(counts.mrkt);
  $("flip-matches").textContent = fmt(candidates.length);
  const state = live ? "Поток See.tg подключён"
    : status === "retry" ? "Связь прервалась · переподключаемся"
    : status === "occupied" ? "Поток занят другим подключением"
    : status === "unavailable" ? "Поток недоступен в этом браузере" : "Подключаемся к See.tg…";
  if ($("signal-status").textContent !== state) $("signal-status").textContent = state;
  $("data-state").textContent = live ? "Живые данные · See.tg" : state;
  $("data-state").dataset.mode = live ? "source" : "";
  const list = $("signals-list");
  if (list.contains(document.activeElement) || giftDialog.open) return;

  let empty = "Ждём первые данные с площадок.";
  if (status === "retry") empty = "Поиск возобновится после восстановления связи.";
  else if (status === "occupied") empty = "Если патруль запущен на ПК, новые сигналы будут приходить в чат бота.";
  else if (status === "unavailable") empty = "Откройте приложение в браузере с поддержкой WebSocket.";
  else if (live && counts.portals && counts.mrkt) empty = possible.length
    ? "Пока нет связок с проверенными ценами обоих лотов."
    : "Пока нет связок с достаточным запасом и свежими продажами аналогов.";
  const signature = candidates.length
    ? JSON.stringify(candidates.map(({ buy, ask, cost, targetPrice, sample, latestSale }) => [buy, ask, cost, targetPrice, sample, latestSale]))
    : empty;
  if (signature === flipSignature) return;
  flipSignature = signature;
  list.replaceChildren(...(candidates.length ? candidates.map(flipCard)
    : [element("p", empty, "panel flip-empty")]));
}

function render() {
  const page = pageName();
  for (const name of Object.keys(pages)) $(name).hidden = name !== page;
  for (const link of $("nav").querySelectorAll("a")) {
    if (link.hash === "#" + page) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  [$("title").textContent, $("subtitle").textContent] = pages[page];
  $("periods").hidden = !["market", "deals", "analyst"].includes(page);
  for (const button of $("periods").querySelectorAll("button")) button.setAttribute("aria-pressed", button.dataset.period === period);
  flipStream.setActive(!document.hidden && page === "signals");
  if (page === "signals") {
    $("error").hidden = true;
    renderFlips();
    return;
  }
  if (page === "valuation") {
    $("error").hidden = true;
    $("data-state").textContent = "Оценка по продажам MRKT";
    $("data-state").dataset.mode = "";
    return;
  }
  if (!data) {
    $("data-state").textContent = "Загрузка данных";
    $("data-state").dataset.mode = "";
    return;
  }
  const fresh = Object.values(data.statuses).every(s => s.at && s.sales_at && !s.error && !s.partial);
  $("data-state").textContent = offlineDemo ? "Демоданные · API недоступен" : data.demo ? "Демоданные" : fresh ? "Данные Swift Gifts" : "Данные загружаются или неполны";
  $("data-state").dataset.mode = !data.demo && fresh ? "source" : "";
  if (page === "market") {
    $("chart-period").textContent = "Наблюдаемые продажи за " + periodName[data.period];
    $("stats").replaceChildren(...[
      ["Оборот", ton(data.volume)], ["Продажи", fmt(data.sales)], ["Коллекции", fmt(data.collections.length)],
    ].map(([label, value]) => {
      const card = element("div", null, "stat");
      card.append(element("div", label, "stat-label"), element("div", value, "stat-value"));
      return card;
    }));
    const query = $("search").value.trim().toLowerCase();
    collectionTable($("collections"), data.collections.filter(c => c.name.toLowerCase().includes(query)));
    drawChart();
  }
  if (page === "saved") collectionTable($("saved-list"), data.collections.filter(c => favorites.has(c.id)));
  if (page === "deals") showRows($("deals-list"), data.deals.filter(row => row.price <= 10).slice(0, 60), "deals", "Лотов ниже медианы пока нет.");
  if (page === "mono") {
    $("mono-status").textContent = data.monoEnabled
      ? "Проверено лотов: " + data.monoChecked + ". В выдаче совпадения от 60%, сначала самые дешёвые."
      : "Для проверки цветов требуется токен Telegram-бота.";
    const filtered = data.mono.filter(row => (!monoFilter.market || monoFilter.market === row.market)
      && (monoFilter.budget == null || row.price <= monoFilter.budget));
    showRows($("mono-list"), filtered.slice(0, 60), "mono", "В проверенной выборке подходящих лотов нет.");
  }
}

async function load() {
  const current = ++generation;
  try {
    const result = await api("/api/market?period=" + period);
    if (current !== generation) return;
    data = result;
    offlineDemo = false;
    $("error").hidden = true;
    render();
  } catch {
    if (current !== generation) return;
    if (apiOrigin) {
      try {
        if (!demoData) {
          const response = await fetch("./demo.json", { signal: AbortSignal.timeout(6500) });
          if (!response.ok) throw new Error("Демо недоступно.");
          demoData = await response.json();
        }
        if (current !== generation) return;
        data = demoData[period];
        offlineDemo = true;
        $("error").hidden = true;
        render();
        return;
      } catch {
        if (current !== generation) return;
      }
    }
    if (["signals", "valuation"].includes(pageName())) return;
    $("data-state").textContent = "API недоступен";
    $("data-state").dataset.mode = "";
    $("error").hidden = false;
    $("error").textContent = "Данные пока недоступны. Попробуйте обновить страницу.";
  }
}

$("periods").addEventListener("click", event => {
  const selected = event.target.dataset.period;
  if (selected && selected !== period) {
    period = selected;
    load();
  }
});
$("search").addEventListener("input", render);
window.addEventListener("hashchange", () => {
  window.scrollTo(0, 0);
  render();
  if (!["signals", "valuation"].includes(pageName()) && !data) load();
});
$("signal-form").addEventListener("submit", event => {
  event.preventDefault();
  const fields = event.currentTarget.elements;
  const budget = Number(fields.budget.value.trim().replace(",", "."));
  const transfer = Number(fields.transfer.value.trim().replace(",", "."));
  if (!Number.isFinite(budget) || budget <= 0) {
    fields.budget.setCustomValidity("Введите положительный бюджет.");
    fields.budget.reportValidity();
    return;
  }
  if (!fields.transfer.value.trim() || !Number.isFinite(transfer) || transfer < 0) {
    fields.transfer.setCustomValidity("Введите расходы от нуля.");
    fields.transfer.reportValidity();
    return;
  }
  flipRules = { budget, transfer, market: fields.market.value };
  renderFlips();
});
$("signal-form").addEventListener("input", event => event.target.setCustomValidity(""));
$("mono-form").addEventListener("submit", event => {
  event.preventDefault();
  const values = new FormData(event.currentTarget);
  const input = values.get("budget").trim();
  const budget = input ? Number(input.replace(",", ".")) : null;
  const control = event.currentTarget.elements.budget;
  if (input && (!Number.isFinite(budget) || budget <= 0)) {
    control.setCustomValidity("Введите положительный бюджет.");
    control.reportValidity();
    return;
  }
  monoFilter = { budget, market: values.get("market") };
  render();
});
$("mono-form").elements.budget.addEventListener("input", event => event.target.setCustomValidity(""));
$("suggestions").addEventListener("click", event => {
  if (event.target.tagName === "BUTTON") {
    $("question").value = event.target.textContent;
    $("analysis-form").requestSubmit();
  }
});
$("analysis-form").addEventListener("submit", async event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button[type=submit]");
  if (button.disabled) return;
  const question = $("question").value.trim();
  const mono = /моно/iu.test(question);
  const match = question.match(/(?:до\s*|бюджет[а-я]*[: ]*)\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*(?:ton|тон)/iu);
  const budget = match ? Number((match[1] || match[2]).replace(",", ".")) : null;
  const out = $("answer");
  if ((!ai || offlineDemo) && budget == null && !mono) {
    out.replaceChildren(element("p", "Укажите бюджет, например «до 10 TON», или запросите «самый дешёвый монохром»."));
    return;
  }
  button.disabled = true;
  out.replaceChildren(element("p", "Подбираем лоты…"));
  try {
    if (budget != null || mono) {
      const limit = budget ?? 10;
      let result;
      if (offlineDemo) {
        const affordable = (mono ? data.mono : data.deals).filter(row => row.price <= limit);
        const listings = affordable.length || mono ? affordable : data.listings.filter(row => row.price <= limit);
        const unique = new Map();
        for (const row of listings) {
          const key = row.collection + ":" + row.market;
          if (!unique.has(key)) unique.set(key, row);
        }
        result = { demo: true, items: mono ? listings.slice(0, 12) : [...unique.values()].slice(0, 5) };
      } else {
        result = await api("/api/analysis", { period, mode: mono ? "mono" : "budget", budget: limit });
      }
      out.replaceChildren();
      if (result.demo) out.append(element("p", "Демоданные"));
      const items = element("div");
      showRows(items, result.items, mono ? "mono" : "deals", "Подходящих лотов в выборке нет.");
      out.append(items);
    } else {
      const result = await api("/api/ai", { period, question });
      out.replaceChildren(element("p", result.answer));
    }
  } catch (error) { out.replaceChildren(element("p", error.message)); }
  finally { button.disabled = false; }
});

$("ai-status").textContent = "Подбор по бюджету работает локально.";
if (tg?.initData) api("/api/profile").then(profile => {
  ai = profile.ai;
  if (profile.name) {
    $("profile").textContent = profile.name;
    $("profile").hidden = false;
  }
  if (ai) $("ai-status").textContent = "Свободные вопросы обрабатывает ИИ. Подбор по бюджету выполняется локально.";
}).catch(() => {});
render();
if (!["signals", "valuation"].includes(pageName())) load();
document.addEventListener("visibilitychange", () => {
  if (document.hidden) flipStream.setActive(false);
  else render();
});
window.addEventListener("pagehide", () => flipStream.setActive(false));
window.addEventListener("pageshow", () => { if (pageName() === "signals") render(); });
setInterval(() => { if (!document.hidden && pageName() === "signals") renderFlips(); }, 2000);
setInterval(() => { if (!document.hidden && !["signals", "valuation"].includes(pageName())) load(); }, 60000);

const launchParams = new URLSearchParams(location.search);
const startGift = (tg?.initDataUnsafe?.start_param || launchParams.get("tgWebAppStartParam") || "").match(/^gift_(.+)$/)?.[1];
const launchGift = startGift || launchParams.get("card");
if (launchGift && fullGiftSlug.test(launchGift)) openGiftCard({ slug: launchGift });
