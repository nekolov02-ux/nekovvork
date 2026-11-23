const flipMarkets = Object.freeze({
  portals: { label: "Portals", url: "https://t.me/portals", fee: .02, withdrawal: .35 },
  mrkt: { label: "MRKT", url: "https://t.me/mrkt", fee: 0, withdrawal: 0 },
});
const flipListingLifetime = 20 * 60 * 1000;
const flipSaleLifetime = 7 * 24 * 60 * 60 * 1000;
const flipEvents = ["listing", "price", "delisting", "sale"];
const flipSaleKinds = ["sale", "purchase", "buy", "listing", "offer"];

function flipTraits(slug, model, backdrop) {
  return JSON.stringify([slug.toLowerCase(), model.trim().toLowerCase(), backdrop.trim().toLowerCase()]);
}

function flipModel(slug, model) {
  return JSON.stringify([slug.toLowerCase(), model.trim().toLowerCase()]);
}

const flipRecentSale = 3 * 24 * 60 * 60 * 1000;

function priceFlip(candidate, rules, buyPrice, askPrice) {
  const { buy, ask, target, cost, salesFloor, latestSale } = candidate;
  const targetPrice = Math.min(askPrice, salesFloor, latestSale.price) * .95;
  const entry = buyPrice + cost;
  const fee = targetPrice * flipMarkets[target].fee;
  const proceeds = targetPrice - fee;
  const net = proceeds - entry;
  const goal = Math.max(.25, rules.profit ?? .25);
  const maxBuy = Math.floor((Math.min(rules.budget, proceeds - goal, proceeds / 1.05) - cost + 1e-9) * 100) / 100;
  if (maxBuy <= 0) return null;
  const waiting = entry > rules.budget || net + 1e-9 < Math.max(goal, entry * .05);
  if (waiting && !rules.includeWaiting) return null;
  return { ...candidate, buy: { ...buy, price: buyPrice }, ask: ask && { ...ask, price: askPrice }, targetPrice, fee, entry, net, maxBuy, waiting };
}

function flipPairs(rows, rules, listedOnly = false) {
  const byTraits = new Map();
  for (const row of rows) {
    const key = flipModel(row.slug, row.model);
    const pair = byTraits.get(key) ?? { portals: [], mrkt: [] };
    pair[row.market].push(row);
    byTraits.set(key, pair);
  }
  const pairs = [];
  for (const pair of byTraits.values()) {
    if (!listedOnly && (!pair.portals.length || !pair.mrkt.length)) continue;
    for (const market of Object.keys(flipMarkets)) {
      if (rules.market && rules.market !== market) continue;
      const target = market === "portals" ? "mrkt" : "portals";
      const cost = Math.max(rules.transfer, flipMarkets[market].withdrawal);
      const buy = pair[market].filter(row => !row.unlock && row.price + cost <= rules.budget)
        .sort((a, b) => a.price - b.price)[0];
      if (!buy) continue;
      const ask = pair[target].filter(row => row.number !== buy.number).sort((a, b) => a.price - b.price)[0];
      if (listedOnly) {
        if (!ask) pairs.push({ buy, ask: null, target, cost });
        continue;
      }
      if (!ask) continue;
      const entry = buy.price + cost;
      const ceiling = ask.price * .95 * (1 - flipMarkets[target].fee) - entry;
      const quotePass = ceiling >= Math.max(rules.profit ?? .25, .25, entry * .05);
      if (quotePass || rules.includeWaiting) pairs.push({ buy, ask, target, cost, ceiling, quotePass });
    }
  }
  if (!listedOnly) return pairs.sort((a, b) => b.ceiling - a.ceiling);
  const queues = new Map();
  for (const pair of pairs.sort((a, b) => a.buy.price - b.buy.price)) {
    const key = pair.buy.slug.toLowerCase() + ":" + pair.target;
    const queue = queues.get(key) ?? [];
    queue.push(pair);
    queues.set(key, queue);
  }
  // Visit each collection before spending more requests on the same one.
  const ordered = [];
  for (const [key, queue] of queues) {
    ordered.push(queue.shift());
    if (!queue.length) queues.delete(key);
    else {
      queues.delete(key);
      queues.set(key, queue);
    }
  }
  return ordered;
}

function rankFlips(rows, sales, rules, now = Date.now(), pairs = flipPairs(rows, rules)) {
  const salesByTraits = new Map();
  for (const sale of sales) {
    const key = sale.market + flipModel(sale.slug.split("-")[0], sale.model);
    const group = salesByTraits.get(key) ?? [];
    group.push(sale);
    salesByTraits.set(key, group);
  }
  const candidates = [];
  for (const pair of pairs) {
    const { buy, ask, target } = pair;
    const recent = (salesByTraits.get(target + flipModel(buy.slug, buy.model)) ?? []).filter(sale => sale.number !== buy.number
      && sale.at >= now - flipSaleLifetime && sale.at <= now + 30000).sort((a, b) => b.at - a.at);
    const distinct = sales => [...new Map([...sales].reverse().map(sale => [sale.number, sale])).values()]
      .sort((a, b) => b.at - a.at);
    const exact = distinct(recent.filter(sale => sale.traits === buy.traits));
    const useExact = exact.length >= 3 && exact[0].at >= now - flipRecentSale;
    const comparables = useExact ? exact : distinct(recent);
    const latestSale = comparables[0];
    if (comparables.length < 3 || latestSale.at < now - flipRecentSale) continue;
    const prices = comparables.map(sale => sale.price).sort((a, b) => a - b);
    const salesFloor = prices[Math.floor((prices.length - 1) / 4)];
    const result = priceFlip({ ...pair, sample: comparables.length, latestSale, salesFloor, match: useExact ? "backdrop" : "model" },
      rules, buy.price, ask?.price ?? Infinity);
    if (result) candidates.push(result);
  }
  return orderFlipResults(candidates).slice(0, 12);
}

function orderFlipResults(results) {
  return results.sort((a, b) => Number(a.waiting) - Number(b.waiting)
    || (a.waiting ? (a.buy.price - a.maxBuy) - (b.buy.price - b.maxBuy) : b.net - a.net));
}

class FlipStream {
  active = false;
  status = "idle";
  nextPrune = 0;
  socket = null;
  reconnect = null;
  connectTimer = null;
  heartbeatTimer = null;
  listings = new Map();
  latest = new Map();
  sales = new Map();

  setActive(value) {
    if (value === this.active) return;
    this.active = value;
    if (value) this.connect();
    else this.stop();
  }

  stop() {
    clearTimeout(this.reconnect);
    clearTimeout(this.connectTimer);
    clearTimeout(this.heartbeatTimer);
    const socket = this.socket;
    this.socket = null;
    socket?.close();
    this.status = "idle";
    this.listings.clear();
    this.latest.clear();
  }

  connect() {
    if (!this.active || this.socket) return;
    if (typeof WebSocket !== "function") {
      this.status = "unavailable";
      return;
    }
    this.status = "connecting";
    const socket = new WebSocket("wss://live.see.tg/v1/ws");
    this.socket = socket;
    this.connectTimer = setTimeout(() => socket.close(), 12000);
    const heartbeat = () => {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = setTimeout(() => socket.close(), 35000);
    };
    socket.addEventListener("open", () => {
      if (this.socket === socket) socket.send(JSON.stringify({
        type: "subscribe", events: [...flipEvents, "stats"], markets: Object.keys(flipMarkets),
      }));
    });
    socket.addEventListener("message", event => {
      if (this.socket !== socket) return;
      let message;
      try { message = JSON.parse(event.data); } catch { return; }
      if (!message || typeof message !== "object") return;
      heartbeat();
      if (message.type === "subscribed") {
        if (!flipEvents.every(kind => message.events?.includes(kind))) {
          socket.close();
          return;
        }
        clearTimeout(this.connectTimer);
        this.status = "live";
      } else if (message.type === "error" || (message.type === "kind_disabled" && flipEvents.includes(message.event))) {
        socket.close();
      } else if (this.status === "live" && message.type === "event") {
        this.apply(message);
      }
    });
    socket.addEventListener("close", event => {
      if (this.socket !== socket) return;
      clearTimeout(this.connectTimer);
      clearTimeout(this.heartbeatTimer);
      this.socket = null;
      const occupied = event.code === 4409;
      this.status = occupied ? "occupied" : "retry";
      this.listings.clear();
      this.latest.clear();
      if (this.active && !occupied) this.reconnect = setTimeout(() => this.connect(), 6000);
    });
  }

  apply({ event, market, gift, at, price, sale_kind: kind }) {
    if (!Object.hasOwn(flipMarkets, market) || !flipEvents.includes(event) || !gift) return false;
    const { slug, num: number, model, backdrop } = gift;
    if (typeof slug !== "string" || !/^[A-Za-z][A-Za-z0-9]{0,100}$/.test(slug)
        || !Number.isSafeInteger(number) || number < 1) return false;
    const stamp = Date.parse(at);
    const now = Date.now();
    if (now >= this.nextPrune) this.prune(now);
    if (!Number.isFinite(stamp) || stamp < now - flipListingLifetime || stamp > now + 30000) return false;

    const id = market + ":" + slug + "-" + number;
    const amount = ["ton", "gram"].includes(price?.currency) && Number.isSafeInteger(price.amount)
      && price.amount > 0 ? price.amount / 1e9 : null;
    const hasTraits = [model, backdrop].every(value => typeof value === "string" && value.trim());
    const traits = hasTraits ? flipTraits(slug, model, backdrop) : null;
    if (event === "sale" && traits && amount && flipSaleKinds.includes(kind)) {
      this.sales.set(id + ":" + stamp, { at: stamp, market, price: amount, traits, slug, number, model, backdrop });
    }
    const previous = this.latest.get(id);
    if (previous && (stamp < previous.at || (stamp === previous.at && previous.removed))) return true;
    const removed = event === "sale" || event === "delisting" || !amount || !traits
      || gift.premarket === true || gift.preMarket === true;
    this.latest.set(id, { at: stamp, removed });
    if (removed) this.listings.delete(id);
    else this.listings.set(id, {
      at: stamp, traits, slug, number, model, backdrop, market, price: amount,
      market_url: gift.market_url,
      title: typeof gift.title === "string" ? gift.title.slice(0, 100) : slug,
      unlock: gift.unlockAt || gift.unlock_at,
    });
    return true;
  }

  prune(now) {
    this.nextPrune = now + 60000;
    // Drop tombstones after the same time limit used to accept incoming events.
    for (const [id, row] of this.latest) {
      if (row.at < now - flipListingLifetime) {
        this.latest.delete(id);
        this.listings.delete(id);
      }
    }
    for (const [id, sale] of this.sales) if (sale.at < now - flipSaleLifetime) this.sales.delete(id);
  }

  snapshot(now = Date.now()) {
    return {
      listings: [...this.listings.values()].filter(row => row.at >= now - flipListingLifetime),
      sales: [...this.sales.values()].filter(row => row.at >= now - flipSaleLifetime),
    };
  }
}
