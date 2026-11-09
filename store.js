/* Wafforia veri katmanı.
   Supabase bağlıysa: tüm cihazlar (müşteri telefonu, kasa bilgisayarı) aynı durumu canlı paylaşır.
   Bağlantı yoksa: localStorage + BroadcastChannel (aynı tarayıcıdaki sekmeler arasında) ile çalışır.
   Her değişiklik "rev" kontrolüyle yazılır; iki cihaz aynı anda yazarsa geride kalan, güncel durumu alıp işlemini tekrar uygular. */
(function () {
  const SB_URL = "https://hvdmodrcagrbpxiwjdtq.supabase.co";
  const SB_KEY = "sb_publishable_1y98p0cOvJN7kEL1kwKNbw_o6GieAKm";
  const ROOM = "wafforia-demo";
  const KEY = "wafforia_demo_v2";
  const ch = ("BroadcastChannel" in window) ? new BroadcastChannel("wafforia") : null;
  const subs = new Set();
  let sb = null, online = false, pending = Promise.resolve(), busy = 0;

  function fresh() {
    return {
      tables: Object.fromEntries(MENU.tables.map(t => [t.id, { id: t.id, status: "kapali", sessionId: null, waiter: null, bill: null }])),
      sessions: {}, orders: {}, unavailable: {}, seq: 1000, rev: 0
    };
  }
  function loadLocal() { try { return JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch (_) { return fresh(); } }
  let mem = loadLocal();
  function cache() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (_) {} ch && ch.postMessage({ rev: mem.rev }); }
  function emit() { subs.forEach(f => { try { f(mem); } catch (e) { console.error(e); } }); }
  function adopt(state, rev) { if (!state || rev <= mem.rev) return; state.rev = rev; mem = state; cache(); emit(); }
  const clone = o => JSON.parse(JSON.stringify(o));

  /* Yerel (bağlantısız) senkron */
  function refreshLocal() { if (online) return; const n = loadLocal(); if (n.rev !== mem.rev) { mem = n; emit(); } }
  ch && (ch.onmessage = () => online ? null : refreshLocal());
  window.addEventListener("storage", e => { if (e.key === KEY) refreshLocal(); });

  /* Uzak senkron */
  async function pull() {
    if (!sb) return;
    const { data, error } = await sb.from("wf_state").select("state,rev").eq("id", ROOM).maybeSingle();
    if (error) { setOnline(false); return; }
    setOnline(true);
    if (!data) { if (mem.rev === 0) await push(fresh(), 0); return; }
    if (!busy) adopt(data.state, data.rev);
  }
  async function push(state, base) {
    const { data, error } = await sb.rpc("wf_save", { p_id: ROOM, p_base: base, p_state: state });
    if (error) throw error;
    return data;
  }
  function setOnline(v) { if (online !== v) { online = v; document.documentElement.dataset.sync = v ? "on" : "off"; emit(); } }

  /* Her değişiklik: önce ekranda hemen uygula, sonra sunucuya yaz (çakışmada güncel durum üzerine tekrar uygula). */
  function tx(fn) {
    const local = clone(mem); const result = fn(local);
    local.rev = mem.rev; mem = local; cache(); emit();
    if (!sb) { mem.rev++; cache(); return result; }
    busy++;
    pending = pending.then(async () => {
      let base = mem.rev, state = clone(mem);
      for (let i = 0; i < 6; i++) {
        try {
          const r = await push(state, base);
          if (r && r.ok) { setOnline(true); mem.rev = r.rev; cache(); emit(); return; }
          const remote = r && r.state ? r.state : fresh(); remote.rev = r ? r.rev : 0;
          state = clone(remote); fn(state); base = remote.rev;
          state.rev = base; mem = clone(state); cache(); emit();
        } catch (e) { console.warn("senkron hatası", e); setOnline(false); await new Promise(r => setTimeout(r, 1500)); }
      }
    }).finally(() => { busy--; });
    return result;
  }

  function startRemote() {
    if (!window.supabase || SB_KEY.startsWith("__")) return;
    sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });
    pull();
    sb.channel("wf-" + ROOM)
      .on("postgres_changes", { event: "*", schema: "public", table: "wf_state", filter: "id=eq." + ROOM },
        p => { setOnline(true); if (!busy && p.new && p.new.state) adopt(p.new.state, p.new.rev); })
      .subscribe(s => { if (s === "SUBSCRIBED") setOnline(true); });
    setInterval(pull, 4000); // emniyet: realtime kopsa bile 4 sn'de bir güncelle
    document.addEventListener("visibilitychange", () => { if (!document.hidden) pull(); });
  }
  if (window.supabase) startRemote();
  else {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
    s.onload = startRemote; s.onerror = () => setOnline(false);
    document.head.appendChild(s);
  }
  setInterval(refreshLocal, 1500);

  const uid = p => p + Math.random().toString(36).slice(2, 8);
  const now = () => new Date().toISOString();
  const total = items => items.reduce((a, it) => a + it.price * (it.qty || 1), 0);
  const sessionOf = (m, tid) => { const t = m.tables[tid]; return t && t.sessionId ? m.sessions[t.sessionId] : null; };
  function openSession(m, tid, by, sid, at) {
    const s = { id: sid, tableId: tid, openedAt: at, closedAt: null, orderIds: [], openedBy: by };
    m.sessions[s.id] = s; m.tables[tid].sessionId = s.id; return s;
  }

  window.Store = {
    get: () => mem,
    isOnline: () => online,
    subscribe(f) { subs.add(f); f(mem); return () => subs.delete(f); },
    session(tid) { return sessionOf(mem, tid); },
    sessionOrders(tid) { const s = this.session(tid); return s ? s.orderIds.map(id => mem.orders[id]).filter(Boolean) : []; },
    sessionTotal(tid) { return this.sessionOrders(tid).filter(o => o.status !== "red").reduce((a, o) => a + o.total, 0); },
    isAvailable: id => !mem.unavailable[id],

    /* Müşteri (QR) siparişi. Boş masadan gelen ilk sipariş personel onayına düşer. */
    placeOrder(tid, items, note) {
      const oid = uid("o_"), sid = uid("s_"), at = now();
      tx(m => {
        const t = m.tables[tid]; let s = sessionOf(m, tid); let status = "yeni";
        if (!s) { s = openSession(m, tid, "qr", sid, at); t.status = "onay"; status = "onay"; }
        else if (t.status === "onay") status = "onay";
        m.orders[oid] = { id: oid, no: ++m.seq, tableId: tid, sessionId: s.id, items, note: note || "", total: total(items), status, source: "qr", seen: false, createdAt: at };
        s.orderIds.push(oid);
      });
      return mem.orders[oid];
    },
    /* Kasadan elle ekleme: onay gerekmez, masa kapalıysa açılır. */
    addManual(tid, items, note) {
      const oid = uid("o_"), sid = uid("s_"), at = now();
      tx(m => {
        const t = m.tables[tid]; let s = sessionOf(m, tid);
        if (!s) s = openSession(m, tid, "kasa", sid, at);
        if (t.status !== "acik") { t.status = "acik"; Object.values(m.orders).forEach(o => { if (o.sessionId === s.id && o.status === "onay") o.status = "yeni"; }); }
        m.orders[oid] = { id: oid, no: ++m.seq, tableId: tid, sessionId: s.id, items, note: note || "", total: total(items), status: "yeni", source: "kasa", seen: true, createdAt: at };
        s.orderIds.push(oid);
      });
      return mem.orders[oid];
    },
    approveTable(tid) {
      tx(m => { const t = m.tables[tid]; const s = sessionOf(m, tid); if (!s) return;
        t.status = "acik"; s.orderIds.forEach(id => { const o = m.orders[id]; if (o && o.status === "onay") { o.status = "yeni"; o.seen = true; } }); });
    },
    rejectTable(tid) {
      const at = now();
      tx(m => { const t = m.tables[tid]; const s = sessionOf(m, tid); if (!s) return;
        s.orderIds.forEach(id => { const o = m.orders[id]; if (o && o.status === "onay") o.status = "red"; });
        s.closedAt = at; s.closedReason = "red"; t.status = "kapali"; t.sessionId = null; t.waiter = t.bill = null; });
    },
    setOrderStatus(oid, st) { tx(m => { const o = m.orders[oid]; if (o) { o.status = st; o.seen = true; } }); },
    ackOrder(oid) { tx(m => { const o = m.orders[oid]; if (o) o.seen = true; }); },
    unseenOrders() { return Object.values(mem.orders).filter(o => o.source === "qr" && o.status === "yeni" && o.seen === false); },
    callWaiter(tid) { const at = now(); tx(m => { m.tables[tid].waiter = at; }); },
    requestBill(tid) { const at = now(); tx(m => { m.tables[tid].bill = at; }); },
    clearCall(tid, kind) { tx(m => { m.tables[tid][kind] = null; }); },
    closeTable(tid) {
      const at = now(); const s0 = this.session(tid);
      const summary = s0 ? { table: tid, orders: this.sessionOrders(tid).filter(o => o.status !== "red"), total: this.sessionTotal(tid), openedAt: s0.openedAt, closedAt: at } : null;
      tx(m => { const t = m.tables[tid]; const s = sessionOf(m, tid);
        if (s) { s.closedAt = at; s.total = s.orderIds.map(id => m.orders[id]).filter(o => o && o.status !== "red").reduce((a, o) => a + o.total, 0);
          s.orderIds.forEach(id => { const o = m.orders[id]; if (o && (o.status === "yeni" || o.status === "hazirlaniyor")) o.status = "teslim"; }); }
        t.status = "kapali"; t.sessionId = null; t.waiter = t.bill = null; });
      return summary;
    },
    toggleAvailable(id) { tx(m => { if (m.unavailable[id]) delete m.unavailable[id]; else m.unavailable[id] = true; }); },
    todayRevenue() {
      const d = new Date().toDateString();
      return Object.values(mem.orders).filter(o => o.status !== "red" && o.status !== "onay" && new Date(o.createdAt).toDateString() === d).reduce((a, o) => a + o.total, 0);
    },
    resetDemo() { tx(m => { const f = fresh(); Object.keys(m).forEach(k => delete m[k]); Object.assign(m, f); }); }
  };
})();
