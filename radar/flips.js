const flipMarkets = Object.freeze({
  portals: { label: "Portals", url: "https://t.me/portals", fee: .02, withdrawal: .35 },
  mrkt: { label: "MRKT", url: "https://t.me/mrkt", fee: 0, withdrawal: 0 },
});
const flipListingLifetime = 20 * 60 * 1000;
const flipSaleLifetime = 7 * 24 * 60 * 60 * 1000;
const flipEvents = ["listing", "price", "delisting", "sale"];
const flipSaleKinds = ["sale", "purchase", "buy", "listing", "offer"];

function flipTraits(slug, model, backdrop) {
  return JSON.stringify([slug, model.trim().toLowerCase(), backdrop.trim().toLowerCase()]);
}

const flipRecentSale = 3 * 24 * 60 * 60 * 1000;

function priceFlip(candidate, rules, buyPrice, askPrice) {
  const { buy, ask, target, cost, salesFloor, latestSale } = candidate;
  const targetPrice = Math.min(askPrice, salesFloor, latestSale.price) * .95;
  const entry = buyPrice + cost;
  const fee = targetPrice * flipMarkets[target].fee;
  const net = targetPrice - fee - entry;
  if (entry > rules.budget || net < Math.max(.25, entry * .05)) return null;
  return { ...candidate, buy: { ...buy, price: buyPrice }, ask: { ...ask, price: askPrice }, targetPrice, fee, entry, net };
}

function flipPairs(rows, rules) {
  const byTraits = new Map();
  for (const row of rows) {
    const pair = byTraits.get(row.traits) ?? { portals: [], mrkt: [] };
    pair[row.market].push(row);
    byTraits.set(row.traits, pair);
  }
  const pairs = [];
  for (const pair of byTraits.values()) {
    if (!pair.portals.length || !pair.mrkt.length) continue;
    for (const market of Object.keys(flipMarkets)) {
      if (rules.market && rules.market !== market) continue;
      const target = market === "portals" ? "mrkt" : "portals";
      const cost = Math.max(rules.transfer, flipMarkets[market].withdrawal);
      const buy = pair[market].filter(row => !row.unlock && row.price + cost <= rules.budget)
        .sort((a, b) => a.price - b.price)[0];
      if (!buy) continue;
      const ask = pair[target].filter(row => row.number !== buy.number).sort((a, b) => a.price - b.price)[0];
      if (!ask) continue;
      const entry = buy.price + cost;
      const ceiling = ask.price * .95 * (1 - flipMarkets[target].fee) - entry;
      if (ceiling >= Math.max(.25, entry * .05)) pairs.push({ buy, ask, target, cost, ceiling });
    }
  }
  return pairs.sort((a, b) => b.ceiling - a.ceiling);
}

function rankFlips(rows, sales, rules, now = Date.now(), pairs = flipPairs(rows, rules)) {
  const salesByTraits = new Map();
  for (const sale of sales) {
    const key = sale.market + sale.traits;
    const group = salesByTraits.get(key) ?? [];
    group.push(sale);
    salesByTraits.set(key, group);
  }
  const candidates = [];
  for (const pair of pairs) {
    const { buy, ask, target } = pair;
    const recent = (salesByTraits.get(target + buy.traits) ?? []).filter(sale => sale.number !== buy.number
      && sale.at >= now - flipSaleLifetime && sale.at <= now + 30000).sort((a, b) => b.at - a.at);
    const seen = new Set();
    const comparables = recent.filter(sale => {
      if (seen.has(sale.number)) return false;
      seen.add(sale.number);
      return true;
    });
    const latestSale = comparables[0];
    if (comparables.length < 3 || latestSale.at < now - flipRecentSale) continue;
    const prices = comparables.map(sale => sale.price).sort((a, b) => a - b);
    const salesFloor = prices[Math.floor((prices.length - 1) / 4)];
    const result = priceFlip({ ...pair, sample: comparables.length, latestSale, salesFloor },
      rules, buy.price, ask.price);
    if (result) candidates.push(result);
  }
  return candidates.sort((a, b) => b.net - a.net).slice(0, 12);
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
      this.sales.set(id + ":" + stamp, { at: stamp, market, price: amount, traits, slug, number });
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
