const flipMarkets = Object.freeze({
  portals: { label: "Portals", url: "https://t.me/portals", fee: .02, withdrawal: .35 },
  mrkt: { label: "MRKT", url: "https://t.me/mrkt", fee: 0, withdrawal: 0 },
});
const flipListingLifetime = 20 * 60 * 1000;
const flipSaleLifetime = 24 * 60 * 60 * 1000;
const flipEvents = ["listing", "price", "delisting", "sale"];
const flipSaleKinds = ["sale", "purchase", "buy", "listing", "offer"];

function flipTraits(slug, model, backdrop) {
  return JSON.stringify([slug, model.trim().toLowerCase(), backdrop.trim().toLowerCase()]);
}

function rankFlips(rows, sales, rules) {
  const byTraits = new Map();
  const salesByTraits = new Map();
  for (const row of rows) {
    const pair = byTraits.get(row.traits) ?? { portals: [], mrkt: [] };
    pair[row.market].push(row);
    byTraits.set(row.traits, pair);
  }
  for (const sale of sales) {
    const key = sale.market + sale.traits;
    const prices = salesByTraits.get(key) ?? [];
    prices.push(sale.price);
    salesByTraits.set(key, prices);
  }

  const candidates = [];
  for (const [traits, pair] of byTraits) {
    if (!pair.portals.length || !pair.mrkt.length) continue;
    for (const market of Object.keys(flipMarkets)) {
      if (rules.market && rules.market !== market) continue;
      const target = market === "portals" ? "mrkt" : "portals";
      const cost = Math.max(rules.transfer, flipMarkets[market].withdrawal);
      const buyRows = pair[market].filter(row => !row.unlock && row.price + cost <= rules.budget)
        .sort((a, b) => a.price - b.price);
      const sellRows = [...pair[target]].sort((a, b) => a.price - b.price);
      const buy = buyRows[0];
      const ask = buy && sellRows.find(row => row.number !== buy.number);
      if (!ask) continue;
      const comparables = (salesByTraits.get(target + traits) ?? []).sort((a, b) => a - b);
      const count = comparables.length;
      const median = count ? (comparables[Math.floor(count / 2)] + comparables[Math.floor((count - 1) / 2)]) / 2 : null;
      if (rules.salesOnly && count < 3) continue;
      const targetPrice = (count >= 3 ? Math.min(ask.price, median) : ask.price) * .95;
      const entry = buy.price + cost;
      const fee = targetPrice * flipMarkets[target].fee;
      const net = targetPrice - fee - entry;
      if (net >= Math.max(.25, entry * .05)) {
        candidates.push({ buy, ask, target, targetPrice, cost, fee, entry, net, sample: count });
      }
    }
  }
  return candidates.sort((a, b) => Number(b.sample >= 3) - Number(a.sample >= 3) || b.net - a.net).slice(0, 12);
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
    socket.addEventListener("close", () => {
      if (this.socket !== socket) return;
      clearTimeout(this.connectTimer);
      clearTimeout(this.heartbeatTimer);
      this.socket = null;
      this.status = "retry";
        this.listings.clear();
      this.latest.clear();
      if (this.active) this.reconnect = setTimeout(() => this.connect(), 6000);
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
      this.sales.set(id + ":" + stamp, { at: stamp, market, price: amount, traits });
    }
    const previous = this.latest.get(id);
    if (previous && (stamp < previous.at || (stamp === previous.at && previous.removed))) return true;
    const removed = event === "sale" || event === "delisting" || !amount || !traits
      || gift.premarket === true || gift.preMarket === true;
    this.latest.set(id, { at: stamp, removed });
    if (removed) this.listings.delete(id);
    else this.listings.set(id, {
      at: stamp, traits, slug, number, model, backdrop, market, price: amount,
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
