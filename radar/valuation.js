const changes = "https://api.changes.tg";
const day = 86400000;
const priceLabels = {
  traits: "Та же модель, фон и узор",
  backdrop: "Та же модель и фон",
  mono: "Та же модель и класс монохромности",
  model: "Та же модель",
};
const traitName = value => value.normalize("NFKC").trim().replace(/[’‘]/g, "'").toLowerCase();
const monoClass = score => score == null ? null : score >= 60;

function valuationSlug(input) {
  let value = input.trim();
  if (/^(?:https?:\/\/)?(?:t|telegram)\.me\/nft\//i.test(value)) {
    const url = new URL(value.startsWith("http") ? value : "https://" + value);
    if (!["t.me", "telegram.me"].includes(url.hostname) || url.username || url.password) return null;
    value = url.pathname.split("/")[2];
  }
  return /^[A-Za-z][A-Za-z0-9]{0,100}-[1-9]\d{0,9}$/.test(value) ? value : null;
}

function modelVariant(catalog, model) {
  const matches = (catalog.models || []).filter(row =>
    traitName(row.telegramName || row.name) === traitName(model.name));
  if (matches.length > 1) return matches.find(row =>
    model.rarity != null && Math.abs(row.rarity - model.rarity) < .001 &&
    matches.filter(candidate => Math.abs(candidate.rarity - model.rarity) < .001).length === 1);
  return matches[0];
}

function hsv(r, g, b) {
  const max = Math.max(r, g, b), delta = max - Math.min(r, g, b);
  let hue = 0;
  if (delta) {
    const segment = max === r ? (g - b) / delta : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
    hue = (segment / 6 + 1) % 1;
  }
  return [hue, max ? delta / max : 0, max / 255];
}

function pixelPalette(imageData) {
  const pixels = [];
  let transparent = false;
  for (let i = 0; i < imageData.length; i += 4) {
    if (imageData[i + 3] < 200) transparent = true;
    else pixels.push(hsv(imageData[i], imageData[i + 1], imageData[i + 2]));
  }
  return transparent && pixels.length >= 30 ? pixels : null;
}

function priceColorMatch(pixels, backdrop) {
  if (!pixels || !backdrop || ![backdrop.centerColor, backdrop.edgeColor].every(
    color => Number.isInteger(color) && color >= 0 && color <= 0xffffff)) return null;
  const colors = [backdrop.centerColor, backdrop.edgeColor].map(color => hsv(color >> 16, color >> 8 & 255, color & 255));
  const matches = pixels.filter(([h, s, v]) => colors.some(([bh, bs, bv]) => {
    if (bs < .2 || bv < .15) return (s < .26 || v < .14) && Math.abs(v - bv) <= .38;
    const distance = Math.abs(h - bh);
    return s >= .19 && v >= .15 && Math.min(distance, 1 - distance) <= .063 && Math.abs(v - bv) <= .56;
  })).length;
  return Math.round(matches * 100 / pixels.length);
}

async function valuationColors(gift, sales) {
  const collection = gift.slug.split("-")[0];
  const response = await fetch(changes + "/gift/" + encodeURIComponent(collection), { signal: AbortSignal.timeout(5000) });
  if (!response.ok) return;
  const catalog = await response.json();
  const variant = modelVariant(catalog, gift.model);
  if (!variant) return;
  const asset = changes + "/model/" + encodeURIComponent(collection) + "/" + encodeURIComponent(variant.name) + ".png?size=64";
  const image = await fetch(asset, { signal: AbortSignal.timeout(5000) });
  if (!image.ok || !image.headers.get("content-type")?.startsWith("image/png")) return;
  const imageUrl = URL.createObjectURL(await image.blob());
  let palette;
  try {
    const frame = new Image();
    frame.src = imageUrl;
    await frame.decode();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(frame, 0, 0, 64, 64);
    palette = pixelPalette(ctx.getImageData(0, 0, 64, 64).data);
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
  if (!palette) return;
  const colors = new Map((catalog.backdrops || []).map(row => [traitName(row.name), row]));
  const targetBackdrop = colors.get(traitName(gift.backdrop.name));
  gift.mono = priceColorMatch(palette, targetBackdrop);
  gift.preview = asset;
  gift.swatch = targetBackdrop?.hex?.centerColor;
  const scores = new Map();
  for (const sale of sales) {
    const backdrop = traitName(sale.backdrop);
    if (!scores.has(backdrop)) scores.set(backdrop, priceColorMatch(palette, colors.get(backdrop)));
    sale.mono = scores.get(backdrop);
  }
}

function quantile(values, p) {
  const position = (values.length - 1) * p;
  const low = Math.floor(position), high = Math.ceil(position);
  return values[low] + (values[high] - values[low]) * (position - low);
}

function numberType(value) {
  const digits = String(value);
  if (!/^[1-9]\d{0,9}$/.test(digits)) return null;
  if (digits.length === 1) return "Однозначный номер";
  if (digits.length === 2) return "Двузначный номер";
  if (/^(\d)\1{2,}$/.test(digits)) return "Повтор цифр";
  const sequence = [...digits].map(Number);
  const step = sequence[1] - sequence[0];
  if (Math.abs(step) === 1 && sequence.slice(1).every((d, index) => d - sequence[index] === step)) {
    return "Цифры подряд";
  }
  if (digits === [...digits].reverse().join("")) return "Палиндром";
  if (/00$/.test(digits)) return "Круглый номер";
  if (digits.length === 3) return "Трёхзначный номер";
  return null;
}

function serialAdjustment(gift, items) {
  const type = numberType(gift.number);
  if (!type) return null;
  // Control for traits and currency, and count unique gifts so one resale cannot create a premium.
  const unique = new Map();
  for (const sale of items) {
    const slug = sale.slug.toLowerCase();
    if (!unique.has(slug) && sale.currency === items[0]?.currency) unique.set(slug, sale);
  }
  const comparable = [], regular = [];
  for (const [slug, sale] of unique) {
    const group = numberType(slug.split("-").at(-1));
    if (group === type) comparable.push(sale);
    else if (!group) regular.push(sale);
  }
  if (comparable.length < 3 || regular.length < 3) return { type, sample: comparable.length };
  const medianPrice = rows => quantile(rows.map(sale => sale.price).sort((a, b) => a - b), .5);
  return { type, sample: comparable.length, control: regular.length,
    multiplier: medianPrice(comparable) / medianPrice(regular), examples: comparable.slice(0, 3) };
}

function computeValuation(gift, sales, now = Date.now()) {
  const matchesBackdrop = sale => traitName(sale.backdrop) === traitName(gift.backdrop.name);
  const matchesSymbol = sale => traitName(sale.symbol) === traitName(gift.symbol.name);
  const model = traitName(gift.model.name);
  const observed = sales.filter(sale => Number.isFinite(sale.at) && sale.at <= now + 60000
    && sale.at >= now - 30 * day && Number.isFinite(sale.price) && sale.price > 0
    && traitName(sale.model) === model && sale.slug.toLowerCase() !== gift.slug.toLowerCase())
    .sort((a, b) => b.at - a.at);
  const sets = [
    ["traits", observed.filter(sale => matchesBackdrop(sale) && matchesSymbol(sale))],
    ["backdrop", observed.filter(matchesBackdrop)],
    ["mono", observed.filter(sale => monoClass(sale.mono) != null && monoClass(sale.mono) === monoClass(gift.mono))],
    ["model", observed],
  ];
  // Prefer precise comps if the sample is sufficient and has a recent print.
  const selected = sets.find(([, items]) => items.length >= 3 && items[0].at >= now - 7 * day)
    || sets.find(([, items]) => items.length >= 3 && items[0].at >= now - 14 * day)
    || sets.find(([, items]) => items.length && items[0].at >= now - 14 * day);
  const nearest = sets.find(([tier, items]) => tier !== "mono" && items.length)?.[1][0] || observed[0];
  if (!selected) return { last: nearest, sales: observed.slice(0, 5), serial: serialAdjustment(gift, []) };
  const [tier, items] = selected;
  const serial = serialAdjustment(gift, items);
  const regular = serial?.multiplier ? items.filter(sale => !numberType(sale.slug.split("-").at(-1))
    && sale.currency === items[0].currency) : [];
  const baseline = regular.length ? regular : items;
  const prices = baseline.map(sale => sale.price).sort((a, b) => a - b);
  const median = quantile(prices, .5);
  const low = prices.length >= 3 ? quantile(prices, .25) : prices[0];
  const high = prices.length >= 3 ? quantile(prices, .75) : prices.at(-1);
  const latest = baseline[0];
  const boundedLast = Math.min(high, Math.max(low, latest.price));
  return {
    tier, count: items.length, last: nearest, usedLast: latest,
    median, low, high, serial,
    list: Math.ceil((median * .7 + boundedLast * .3) * (serial?.multiplier ?? 1) * 100) / 100,
    sales: items.slice(0, 5),
  };
}

const saleDate = new Intl.DateTimeFormat("ru", {
  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
});

function saleCard(sale) {
  const row = element("article", null, "valuation-sale");
  const gift = element("div");
  gift.append(giftLink(sale, sale.slug, "gift-link"), element("p", sale.model + " · " + sale.backdrop + " · " + sale.symbol));
  const value = element("div", null, "valuation-sale-price");
  value.append(element("strong", fmt(sale.price) + " " + sale.currency), element("time", saleDate.format(sale.at)));
  const links = element("div", null, "valuation-sale-links");
  links.append(externalLink(sale.post, "Пост о продаже"));
  const historical = specificMarketURL(sale.market_url, "mrkt");
  if (historical) links.append(externalLink(historical, "Карточка продажи MRKT"));
  const type = numberType(sale.slug.split("-").at(-1));
  if (type) links.append(element("span", type, "muted"));
  if (sale.mono != null) links.append(element("span", "Совпадение цвета · " + sale.mono + "%", "muted"));
  row.append(gift, value, links);
  return row;
}

function showValuation(gift, sales, partial) {
  const result = computeValuation(gift, sales);
  const out = document.getElementById("valuation-result");
  const identity = element("article", null, "panel valuation-gift");
  const art = giftLink(gift, null, "valuation-art");
  art.setAttribute("aria-label", "Открыть карточку подарка");
  if (/^#[0-9a-f]{6}$/i.test(gift.swatch || "")) art.style.backgroundColor = gift.swatch;
  if (gift.preview) {
    const img = element("img");
    img.src = gift.preview;
    img.alt = "";
    art.append(img);
  } else art.textContent = "🎁";
  const details = element("div");
  const link = giftLink(gift, gift.collection + " #" + gift.number, "gift-link");
  const title = element("h2");
  title.append(link);
  details.append(title);
  const tags = element("div", null, "valuation-traits");
  for (const [label, trait] of [["Модель", gift.model], ["Фон", gift.backdrop], ["Узор", gift.symbol]]) {
    tags.append(element("span", label + " · " + trait.name + (trait.rarity == null ? "" : " · " + fmt(trait.rarity) + "%")));
  }
  if (result.serial) tags.append(element("span", result.serial.type));
  details.append(tags, element("p", gift.mono == null ? "Совпадение цвета не удалось измерить"
    : (gift.mono >= 60 ? "Монохром" : "Обычный фон") + " · совпадение цвета " + gift.mono + "%", "muted"));
  details.append(marketLinks(gift));
  identity.append(art, details);

  const pricing = element("div", null, "stats valuation-stats");
  const figures = [
    ["Торговый ориентир", result.median == null ? "—" : fmt(result.median) + " GRAM"],
    ["Цена выставления", result.list == null ? "—" : fmt(result.list) + " GRAM"],
    ["Последняя близкая продажа", result.last ? fmt(result.last.price) + " " + result.last.currency : "—"],
  ];
  for (const [label, value] of figures) {
    const stat = element("div", null, "stat");
    stat.append(element("div", label, "stat-label"), element("div", value, "stat-value"));
    pricing.append(stat);
  }

  const notes = element("div", null, "valuation-notes");
  if (result.tier) {
    notes.append(element("p", priceLabels[result.tier] + " · " + fmt(result.count) + " продаж за 30 дней."));
    if (result.count >= 3) notes.append(element("p", (result.serial?.multiplier ? "Средняя половина выборки обычных номеров: " : "Средняя половина выборки: ") + fmt(result.low) + "–" + fmt(result.high) + " GRAM."));
    else notes.append(element("p", "Мало сопоставимых продаж. Оценка предварительная."));
    if (result.tier === "model") notes.append(element("p", "Данных для отдельной надбавки за фон, узор или монохром недостаточно."));
    if (result.tier === "backdrop" || result.tier === "mono") notes.append(element("p", "Отдельная надбавка за узор не подтверждена выборкой."));
  } else {
    notes.append(element("p", "Для цены выставления нужна хотя бы одна сопоставимая продажа за последние 14 дней."));
  }
  if (result.serial) {
    const { multiplier, sample, control } = result.serial;
    notes.append(element("p", multiplier
      ? "Поправка за номер: " + (multiplier >= 1 ? "+" : "") + fmt((multiplier - 1) * 100)
        + "%. Продано " + sample + " с таким типом номера и " + control + " с обычным."
      : "Поправка за номер не рассчитана. Продаж с таким типом номера в выборке: " + sample + "."));
  }
  if (partial) notes.append(element("p", "Часть результатов поиска MRKT временно недоступна."));

  const evidence = element("section", null, "panel valuation-evidence");
  evidence.append(element("h2", "Что продалось на MRKT"));
  const items = [...new Map([result.last, ...(result.serial?.examples || []), ...result.sales]
    .filter(Boolean).map(sale => [sale.id, sale])).values()].slice(0, 6);
  if (!items.length) evidence.append(element("p", "В поиске канала нет сопоставимых продаж за 30 дней.", "empty"));
  else for (const sale of items) evidence.append(saleCard(sale));
  out.replaceChildren(identity, pricing, notes, evidence);
}

const valuationForm = document.getElementById("valuation-form");
valuationForm.addEventListener("submit", async event => {
  event.preventDefault();
  const input = event.currentTarget.elements.gift;
  let slug;
  try { slug = valuationSlug(input.value); } catch { slug = null; }
  const state = document.getElementById("valuation-status");
  if (!slug) {
    input.setCustomValidity("Вставьте ссылку t.me/nft/… или имя подарка с номером.");
    input.reportValidity();
    return;
  }
  const button = valuationForm.querySelector("button");
  button.disabled = true;
  state.textContent = "Ищем продажи по модели и фону…";
  document.getElementById("valuation-result").replaceChildren();
  try {
    const response = await fetch(priceApi + "/api/valuation?" + new URLSearchParams({ gift: slug }), {
      signal: AbortSignal.timeout(17000),
    });
    if (!response.headers.get("content-type")?.includes("application/json")) throw new Error("Сервис оценки недоступен.");
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Сервис оценки недоступен.");
    await valuationColors(result.gift, result.sales).catch(() => {});
    showValuation(result.gift, result.sales, result.partial);
    state.textContent = "";
  } catch (error) {
    state.textContent = error instanceof TypeError ? "Сервис оценки недоступен. Попробуйте позже." : error.message;
  } finally { button.disabled = false; }
});
valuationForm.elements.gift.addEventListener("input", event => event.target.setCustomValidity(""));

const requestedGift = new URLSearchParams(location.search).get("gift");
if (pageName() === "valuation" && requestedGift && fullGiftSlug.test(requestedGift)) {
  valuationForm.elements.gift.value = requestedGift;
  valuationForm.requestSubmit();
}
