/* Geçici waffle çizimi (SVG). Gerçek görseller gelince her malzeme için katman görseli kullanılacak;
   arayüz aynı kalır: renderWaffle(seçim, öncekiSeçim) → svg metni. */
(function () {
  const C = { x: 200, y: 205 };
  const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const MULTI = ["#E63946", "#F4A261", "#2A9D8F", "#457B9D", "#F1C40F", "#9B5DE5", "#F15BB5"];
  const col = (c, r) => c === "multi" ? MULTI[Math.floor(r() * MULTI.length)] : c;
  const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255;
    r = Math.max(0, Math.min(255, r * f)); g = Math.max(0, Math.min(255, g * f)); b = Math.max(0, Math.min(255, b * f));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + (b | 0)).toString(16).slice(1); };
  const inside = (hamur, x, y) => { const dx = x - C.x, dy = y - C.y;
    if (hamur === "bruksel") return Math.abs(dx) < 128 && Math.abs(dy) < 88;
    if (hamur === "bubble") return (dx * dx) / (140 * 140) + (dy * dy) / (112 * 112) < 1;
    return dx * dx + dy * dy < 128 * 128; };
  function pts(id, n, hamur, margin = 0) { const r = rng(hash(id)); const out = []; let guard = 0;
    while (out.length < n && guard++ < 500) { const x = C.x + (r() * 2 - 1) * 140, y = C.y + (r() * 2 - 1) * 120;
      if (inside(hamur, x, y) && inside(hamur, x + Math.sign(x - C.x) * margin, y + Math.sign(y - C.y) * margin)) out.push([x, y, r() * 360, r]); }
    return out; }

  function flowerPath(R, k, a) { let d = ""; for (let i = 0; i <= 360; i += 3) { const t = i * Math.PI / 180, r = R + a * Math.cos(k * t);
    d += (i ? "L" : "M") + (C.x + r * Math.cos(t)).toFixed(1) + " " + (C.y + r * Math.sin(t)).toFixed(1); } return d + "Z"; }

  function base(h, color) {
    const dark = shade(color, .78), light = shade(color, 1.12);
    const grad = `<radialGradient id="wg" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></radialGradient>`;
    if (h === "bubble") {
      const r = rng(7); let bubbles = "";
      for (let row = -4; row <= 4; row++) for (let colI = -5; colI <= 5; colI++) {
        const x = C.x + colI * 26 + (row % 2 ? 13 : 0), y = C.y + row * 23;
        if ((x - C.x) ** 2 / (132 * 132) + (y - C.y) ** 2 / (104 * 104) < 1) bubbles += `<circle cx="${x}" cy="${y}" r="13.5" fill="url(#bb)" />`;
      }
      return { defs: grad + `<radialGradient id="bb" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="${shade(color, 1.25)}"/><stop offset="1" stop-color="${shade(color, .82)}"/></radialGradient>
        <clipPath id="wc"><ellipse cx="${C.x}" cy="${C.y}" rx="142" ry="114"/></clipPath>`,
        body: `<ellipse cx="${C.x}" cy="${C.y}" rx="142" ry="114" fill="${dark}"/>${bubbles}` };
    }
    if (h === "bruksel") {
      let cells = ""; for (let i = -3; i < 3; i++) for (let j = -2; j < 2; j++) cells += `<rect x="${C.x + i * 42 + 6}" y="${C.y + j * 42 + 6}" width="30" height="30" rx="5" fill="${shade(color, .7)}" opacity=".55"/>`;
      return { defs: grad + `<clipPath id="wc"><rect x="${C.x - 132}" y="${C.y - 92}" width="264" height="184" rx="26"/></clipPath>`,
        body: `<rect x="${C.x - 132}" y="${C.y - 92}" width="264" height="184" rx="26" fill="url(#wg)" stroke="${dark}" stroke-width="3"/>${cells}` };
    }
    // çiçek
    const p = flowerPath(128, 8, 10); let grid = "";
    for (let i = -7; i <= 7; i++) grid += `<line x1="${C.x + i * 19}" y1="${C.y - 150}" x2="${C.x + i * 19}" y2="${C.y + 150}" stroke="${shade(color, .7)}" stroke-width="5" opacity=".5"/><line x1="${C.x - 150}" y1="${C.y + i * 19}" x2="${C.x + 150}" y2="${C.y + i * 19}" stroke="${shade(color, .7)}" stroke-width="5" opacity=".5"/>`;
    return { defs: grad + `<clipPath id="wc"><path d="${p}"/></clipPath>`,
      body: `<path d="${p}" fill="url(#wg)" stroke="${dark}" stroke-width="3"/><g clip-path="url(#wc)">${grid}</g>` };
  }

  const layer = (cls, isNew, inner) => `<g class="${cls}${isNew ? " pop" : ""}" style="transform-origin:${C.x}px ${C.y}px">${inner}</g>`;

  function choc(id, i, h) { const c = MENU_INDEX[id].color;
    const d = i === 0 ? `M60 60 L340 60 L340 ${C.y - 10} Q300 ${C.y + 30} 260 ${C.y - 5} Q220 ${C.y + 35} 180 ${C.y} Q140 ${C.y + 35} 100 ${C.y + 5} Q70 ${C.y + 30} 60 ${C.y} Z`
                      : `M60 ${C.y + 30} Q100 ${C.y + 60} 140 ${C.y + 30} Q180 ${C.y + 65} 220 ${C.y + 32} Q260 ${C.y + 62} 300 ${C.y + 30} Q330 ${C.y + 50} 340 ${C.y + 30} L340 360 L60 360 Z`;
    return `<g clip-path="url(#wc)"><path d="${d}" fill="${c}" opacity=".93"/><path d="${d}" fill="url(#gloss)" opacity=".35"/></g>`; }

  function fruit(it, h) { const p = pts(it.id, it.shape === "dot" ? 9 : 6, h, 18); const c = it.color;
    return p.map(([x, y, a, r]) => {
      if (it.shape === "slice") { const seeds = it.id === "kivi" ? Array.from({ length: 8 }, (_, k) => { const t = k / 8 * 6.283; return `<ellipse cx="${(x + 9 * Math.cos(t)).toFixed(1)}" cy="${(y + 9 * Math.sin(t)).toFixed(1)}" rx="1.6" ry="3" fill="#1d1d1d" transform="rotate(${k * 45} ${(x + 9 * Math.cos(t)).toFixed(1)} ${(y + 9 * Math.sin(t)).toFixed(1)})"/>`; }).join("") : `<circle cx="${x}" cy="${y}" r="3" fill="${shade(c, .75)}"/>`;
        return `<circle cx="${x}" cy="${y}" r="20" fill="${it.id === "kivi" ? "#5E8A2B" : shade(c, .92)}"/><circle cx="${x}" cy="${y}" r="16.5" fill="${c}"/><circle cx="${x}" cy="${y}" r="6" fill="${shade(c, 1.15)}"/>${seeds}`; }
      if (it.shape === "berry") return `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 -16 C14 -16 18 2 0 18 C-18 2 -14 -16 0 -16Z" fill="${c}"/><path d="M0 -10 C7 -10 9 1 0 10 C-9 1 -7 -10 0 -10Z" fill="#F6C2C8" opacity=".6"/><circle cx="-5" cy="-2" r="1.2" fill="#F8E7A0"/><circle cx="4" cy="3" r="1.2" fill="#F8E7A0"/><circle cx="0" cy="-7" r="1.2" fill="#F8E7A0"/></g>`;
      if (it.shape === "wedge") return `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M-18 8 Q0 -26 18 8 Z" fill="${c}" stroke="${shade(c, .8)}" stroke-width="2"/></g>`;
      return `<circle cx="${x}" cy="${y}" r="7" fill="${c}"/><circle cx="${x - 2}" cy="${y - 2}" r="2" fill="#fff" opacity=".35"/>`;
    }).join(""); }

  function sprinkles(it, h) { const r = rng(hash(it.id)); return pts(it.id + "s", 34, h, 4).map(([x, y, a]) => {
    const c = col(it.color, r); const k = r();
    if (/krep|biskuvi|biscoff|findik|fistig|antep|badem/.test(it.id)) return `<path d="M${x} ${y} l${4 + k * 5} ${-2 - k * 3} l${2 + k * 3} ${5 + k * 3} l${-6 - k * 4} ${1}z" fill="${c}" stroke="${shade(c === "#FBF8F1" ? "#d9d0c0" : c, .8)}" stroke-width=".8"/>`;
    if (/damla|pirinc|bonibon|cakil|jelibon/.test(it.id)) return `<circle cx="${x}" cy="${y}" r="${/bonibon|cakil|jelibon/.test(it.id) ? 4.5 : 3}" fill="${c}"/>`;
    return `<rect x="${x}" y="${y}" width="8" height="2.6" rx="1.3" fill="${c}" transform="rotate(${a} ${x} ${y})"/>`; }).join(""); }

  function candies(it, h) { const r = rng(hash(it.id)); return pts(it.id + "k", 6, h, 10).map(([x, y, a]) =>
    `<rect x="${x - 6}" y="${y - 6}" width="12" height="12" rx="3" fill="${col(it.color, r)}" transform="rotate(${a} ${x} ${y})" stroke="#fff" stroke-opacity=".35"/>`).join(""); }

  function sauce(id, i) { const c = MENU_INDEX[id].color; let d = ""; const off = i * 26 - 12;
    for (let k = 0; k <= 9; k++) { const x = 75 + k * 28, y = C.y + off + (k % 2 ? -78 : 78) * (i ? .8 : 1); d += (k ? "L" : "M") + x + " " + y; }
    return `<g clip-path="url(#wc)"><path d="${d}" fill="none" stroke="${shade(c, .85)}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>`; }

  function scoop(id, i) { const c = MENU_INDEX[id].color; const x = C.x + (i ? 34 : -22), y = C.y - 8 + (i ? 14 : 0);
    return `<ellipse cx="${x}" cy="${y + 26}" rx="34" ry="9" fill="#000" opacity=".18"/><path d="M${x - 38} ${y + 10} q8 14 18 4 q10 14 20 2 q10 14 20 2 q8 12 18 -4 a38 36 0 1 0 -76 -4z" fill="${c}"/><circle cx="${x - 12}" cy="${y - 14}" r="9" fill="#fff" opacity=".35"/>`; }

  window.renderWaffle = function (sel, prev) {
    prev = prev || {};
    const isNew = (step, id) => !(prev[step] || []).includes(id);
    const h = (sel.hamur || [])[0];
    const plate = `<ellipse cx="200" cy="372" rx="160" ry="16" fill="#000" opacity=".22"/><circle cx="200" cy="205" r="182" fill="url(#plate)"/><circle cx="200" cy="205" r="160" fill="none" stroke="#e9e3da" stroke-width="2"/>`;
    const defsBase = `<radialGradient id="plate" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ece6dc"/></radialGradient><linearGradient id="gloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
    if (!h) return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><defs>${defsBase}</defs>${plate}<text x="200" y="212" text-anchor="middle" font-size="18" font-family="inherit" fill="#b7a993">Hamurunu seç</text></svg>`;
    const b = base(h, MENU_INDEX[h].color);
    let g = layer("l-base", isNew("hamur", h), b.body);
    (sel.cikolata || []).forEach((id, i) => g += layer("l", isNew("cikolata", id), choc(id, i, h)));
    (sel.sos || []).forEach((id, i) => g += layer("l", isNew("sos", id), sauce(id, i)));
    (sel.meyve || []).forEach(id => g += layer("l", isNew("meyve", id), fruit(MENU_INDEX[id], h)));
    (sel.sekerleme || []).forEach(id => g += layer("l", isNew("sekerleme", id), candies(MENU_INDEX[id], h)));
    (sel.susleme || []).forEach(id => g += layer("l", isNew("susleme", id), sprinkles(MENU_INDEX[id], h)));
    (sel.dondurma || []).forEach((id, i) => g += layer("l", isNew("dondurma", id), scoop(id, i)));
    return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><defs>${defsBase}${b.defs}</defs>${plate}${g}</svg>`;
  };
})();
