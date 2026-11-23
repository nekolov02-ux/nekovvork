const $ = id => document.getElementById(id);
const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();
const number = new Intl.NumberFormat("ru", { maximumFractionDigits: 2 });
const fmt = value => value == null ? "—" : number.format(value);
const ton = value => value == null ? "—" : fmt(value) + " TON";
const marketName = { portals: "Portals", mrkt: "MRKT" };
const periodName = { "24h": "24 часа", "7d": "7 дней", "30d": "30 дней" };
const pages = {
  market: ["Рынок подарков", "Цены и продажи на Portals и MRKT"],
  signals: ["MRKT → Portals", "Связки для перепродажи с учётом расходов"],
  deals: ["Лоты ниже медианы", "Лоты до 10 TON по сравнению с продажами той же модели"],
  mono: ["Дешёвый монохром", "Совпадение цвета модели и фона"],
  analyst: ["Аналитик", "Подбор подарков по бюджету"],
  saved: ["Избранные коллекции", "Список сохраняется на этом устройстве"],
};
let data, period = "24h", ai = false, generation = 0, monoFilter = { budget: 10 }, signalBudget = 10;
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
  return Object.hasOwn(pages, name) ? name : "market";
}

function safeURL(value, link = false) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return !link || url.hostname === "t.me" ? url.href : null;
  } catch { return null; }
}

async function api(path, body) {
  const headers = {};
  if (tg?.initData && ["/api/profile", "/api/ai"].includes(path)) {
    headers["X-Telegram-Init-Data"] = tg.initData;
  }
  if (body) headers["Content-Type"] = "application/json";
  const response = await fetch(path, { headers, method: body ? "POST" : "GET", body: body && JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Ошибка загрузки.");
  return result;
}

function giftIcon(image, emoji = "🎁") {
  const icon = element("span", emoji, "gift-icon");
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
  const title = element("div", null, "item-title");
  title.append(giftIcon(row.image, data?.collections.find(c => c.id === row.collection)?.emoji),
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
  if (kind === "signals") {
    details.append(element("span", row.backdrop), element("span", "Ориентир Portals " + ton(row.target)),
      element("span", "Медиана " + ton(row.median) + " · " + row.sample + " продаж за 7 д"),
      element("span", "Перенос " + ton(row.cost)),
      element("span", row.net == null ? "Настройте расходы" : "Расчёт +" + ton(row.net) + " · " + fmt(row.roi) + "%", "positive"));
    if (row.locked !== false) details.append(element("span", row.locked ? "Есть ограничение на перенос" : "Доступность переноса неизвестна"));
  } else if (row.discount != null) {
    details.append(element("span", "−" + fmt(row.discount) + "% к медиане", "positive"));
    if (row.median != null) details.append(element("span", ton(row.median) + " · " + row.sample + " продаж"));
  }
  const url = safeURL(row.url, true);
  if (url) {
    const link = element("a", "Открыть лот");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    details.append(link);
  }
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
  if (!data) return;
  const fresh = Object.values(data.statuses).every(s => s.at && s.sales_at && !s.error && !s.partial);
  $("data-state").textContent = data.demo ? "Демоданные" : fresh ? "Данные Swift Gifts" : "Данные загружаются или неполны";
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
  if (page === "signals") {
    $("signal-status").textContent = data.transferCost == null
      ? "Расходы на перенос ещё не заданы. Чистый результат появится после настройки."
      : "Ориентир снижен на 5%. В расчёте 2% за продажу на Portals и " + ton(data.transferCost) + " за перенос.";
    showRows($("signals-list"), data.signals.filter(row => (row.totalCost ?? row.price) <= signalBudget).slice(0, 50), "signals", "В текущей выборке нет связок в пределах бюджета.");
  }
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
    $("error").hidden = true;
    render();
  } catch (error) {
    if (current !== generation) return;
    $("error").hidden = false;
    $("error").textContent = error.message;
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
window.addEventListener("hashchange", () => { window.scrollTo(0, 0); render(); });
$("signal-form").addEventListener("submit", event => {
  event.preventDefault();
  const control = event.currentTarget.elements.budget;
  const budget = Number(control.value.trim().replace(",", "."));
  if (!Number.isFinite(budget) || budget <= 0) {
    control.setCustomValidity("Введите положительный бюджет.");
    control.reportValidity();
    return;
  }
  signalBudget = budget;
  render();
});
$("signal-form").elements.budget.addEventListener("input", event => event.target.setCustomValidity(""));
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
  if (!ai && budget == null && !mono) {
    out.replaceChildren(element("p", "Укажите бюджет, например «до 10 TON», или запросите «самый дешёвый монохром»."));
    return;
  }
  button.disabled = true;
  out.replaceChildren(element("p", "Подбираем лоты…"));
  try {
    if (budget != null || mono) {
      const result = await api("/api/analysis", { period, mode: mono ? "mono" : "budget", budget: budget ?? 10 });
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
load();
setInterval(() => { if (!document.hidden) load(); }, 60000);
