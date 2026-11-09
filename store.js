/* Wafforia veri katmanı.
   DEMO: localStorage + BroadcastChannel (aynı tarayıcıdaki sekmeler arasında canlı).
   CANLI: aynı fonksiyonlar Supabase tablolarına yazacak (masa, oturum, sipariş, çağrı, malzeme). */
(function () {
  const KEY = "wafforia_demo_v1";
  const ch = ("BroadcastChannel" in window) ? new BroadcastChannel("wafforia") : null;
  const subs = new Set();

  function fresh() {
    return {
      tables: Object.fromEntries(MENU.tables.map(t => [t.id, { id: t.id, status: "kapali", sessionId: null, waiter: null, bill: null }])),
      sessions: {}, orders: {}, unavailable: {}, seq: 1000, rev: 0
    };
  }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch (_) { return mem || fresh(); } }
  let mem = load();
  function save() { mem.rev++; try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (_) {} ch && ch.postMessage({ rev: mem.rev }); emit(); }
  function emit() { subs.forEach(f => { try { f(mem); } catch (e) { console.error(e); } }); }
  function refresh() { const n = load(); if (n.rev !== mem.rev) { mem = n; emit(); } }
  ch && (ch.onmessage = refresh);
  window.addEventListener("storage", e => { if (e.key === KEY) refresh(); });
  setInterval(refresh, 1500); // emniyet

  const uid = p => p + Math.random().toString(36).slice(2, 8);
  const now = () => new Date().toISOString();
  const total = items => items.reduce((a, it) => a + it.price * (it.qty || 1), 0);

  function openSession(tid, by) {
    const s = { id: uid("s_"), tableId: tid, openedAt: now(), closedAt: null, orderIds: [], openedBy: by };
    mem.sessions[s.id] = s; mem.tables[tid].sessionId = s.id; return s;
  }

  window.Store = {
    get: () => mem,
    subscribe(f) { subs.add(f); f(mem); return () => subs.delete(f); },
    session(tid) { const t = mem.tables[tid]; return t && t.sessionId ? mem.sessions[t.sessionId] : null; },
    sessionOrders(tid) { const s = this.session(tid); return s ? s.orderIds.map(id => mem.orders[id]).filter(Boolean) : []; },
    sessionTotal(tid) { return this.sessionOrders(tid).filter(o => o.status !== "red").reduce((a, o) => a + o.total, 0); },
    isAvailable: id => !mem.unavailable[id],

    /* Müşteri (QR) siparişi. Boş masadan gelen ilk sipariş personel onayına düşer. */
    placeOrder(tid, items, note) {
      mem = load();
      const t = mem.tables[tid]; let s = this.session(tid); let status = "yeni";
      if (!s) { s = openSession(tid, "qr"); t.status = "onay"; status = "onay"; }
      else if (t.status === "onay") status = "onay";
      const o = { id: uid("o_"), no: ++mem.seq, tableId: tid, sessionId: s.id, items, note: note || "", total: total(items), status, source: "qr", seen: false, createdAt: now() };
      mem.orders[o.id] = o; s.orderIds.push(o.id); save(); return o;
    },
    /* Kasadan elle ekleme: onay gerekmez, masa kapalıysa açılır. */
    addManual(tid, items, note) {
      mem = load();
      const t = mem.tables[tid]; let s = this.session(tid);
      if (!s) s = openSession(tid, "kasa");
      if (t.status !== "acik") { t.status = "acik"; Object.values(mem.orders).forEach(o => { if (o.sessionId === s.id && o.status === "onay") o.status = "yeni"; }); }
      const o = { id: uid("o_"), no: ++mem.seq, tableId: tid, sessionId: s.id, items, note: note || "", total: total(items), status: "yeni", source: "kasa", seen: true, createdAt: now() };
      mem.orders[o.id] = o; s.orderIds.push(o.id); save(); return o;
    },
    approveTable(tid) {
      mem = load(); const t = mem.tables[tid]; const s = this.session(tid); if (!s) return;
      t.status = "acik"; s.orderIds.forEach(id => { const o = mem.orders[id]; if (o && o.status === "onay") { o.status = "yeni"; o.seen = true; } }); save();
    },
    rejectTable(tid) {
      mem = load(); const t = mem.tables[tid]; const s = this.session(tid); if (!s) return;
      s.orderIds.forEach(id => { const o = mem.orders[id]; if (o && o.status === "onay") o.status = "red"; });
      s.closedAt = now(); s.closedReason = "red"; t.status = "kapali"; t.sessionId = null; t.waiter = t.bill = null; save();
    },
    setOrderStatus(oid, st) { mem = load(); const o = mem.orders[oid]; if (o) { o.status = st; o.seen = true; save(); } },
    ackOrder(oid) { mem = load(); const o = mem.orders[oid]; if (o) { o.seen = true; save(); } },
    unseenOrders() { return Object.values(mem.orders).filter(o => o.source === "qr" && o.status === "yeni" && o.seen === false); },
    callWaiter(tid) { mem = load(); mem.tables[tid].waiter = now(); save(); },
    requestBill(tid) { mem = load(); mem.tables[tid].bill = now(); save(); },
    clearCall(tid, kind) { mem = load(); mem.tables[tid][kind] = null; save(); },
    closeTable(tid) {
      mem = load(); const t = mem.tables[tid]; const s = this.session(tid);
      const summary = s ? { table: tid, orders: this.sessionOrders(tid).filter(o => o.status !== "red"), total: this.sessionTotal(tid), openedAt: s.openedAt, closedAt: now() } : null;
      if (s) { s.closedAt = summary.closedAt; s.total = summary.total;
        s.orderIds.forEach(id => { const o = mem.orders[id]; if (o && (o.status === "yeni" || o.status === "hazirlaniyor")) o.status = "teslim"; }); }
      t.status = "kapali"; t.sessionId = null; t.waiter = t.bill = null; save(); return summary;
    },
    toggleAvailable(id) { mem = load(); if (mem.unavailable[id]) delete mem.unavailable[id]; else mem.unavailable[id] = true; save(); },
    todayRevenue() {
      const d = new Date().toDateString();
      return Object.values(mem.orders).filter(o => o.status !== "red" && o.status !== "onay" && new Date(o.createdAt).toDateString() === d).reduce((a, o) => a + o.total, 0);
    },
    resetDemo() { mem = fresh(); save(); }
  };
})();
