/* Masa QR'ı gösteren küçük pencere: telefonla okutup müşteri ekranını açmak için. */
(function () {
  let lib = null;
  function loadLib() {
    if (lib) return lib;
    lib = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js";
      s.onload = () => res(window.qrcode); s.onerror = rej; document.head.appendChild(s);
    });
    return lib;
  }
  const css = `.qrbg{position:fixed;inset:0;background:rgba(20,30,29,.55);display:grid;place-items:center;z-index:99;padding:16px;font-family:Nunito,system-ui,sans-serif}
.qrm{background:#fff;color:#22302f;border-radius:22px;padding:22px;max-width:360px;width:100%;text-align:center}
.qrm h3{font-size:22px;font-weight:900;margin:0 0 4px}.qrm p{color:#71807e;font-weight:700;font-size:14px;margin:0 0 12px;line-height:1.35}
.qrm .qr{background:#fff;border:2px solid #e3e9e8;border-radius:16px;padding:10px;display:inline-block;line-height:0}
.qrm .qr svg{width:220px;height:220px}
.qrm .u{font-size:12px;color:#71807e;word-break:break-all;margin:10px 0}
.qrm .r{display:flex;gap:8px;margin-top:6px}.qrm a,.qrm button{flex:1;font:inherit;font-weight:900;border:0;border-radius:12px;padding:11px;cursor:pointer;text-decoration:none;font-size:14px}
.qrm a{background:#e6f5f4;color:#06625f}.qrm button{background:#0b8a87;color:#fff}`;
  window.showTableQR = async function (tableId, tableLabel) {
    if (!document.getElementById("qrcss")) { const st = document.createElement("style"); st.id = "qrcss"; st.textContent = css; document.head.appendChild(st); }
    const url = new URL("menu.html?masa=" + tableId, location.href).href;
    const bg = document.createElement("div"); bg.className = "qrbg";
    bg.innerHTML = `<div class="qrm"><h3>📱 ${tableLabel}</h3><p>Telefonunun kamerasıyla okut, müşteri ekranı açılsın. Verdiğin sipariş bu kasaya canlı düşer.</p>
      <div class="qr" id="qrBox">Yükleniyor…</div><div class="u">${url}</div>
      <div class="r"><a href="${url}" target="_blank" rel="noopener">Bu cihazda aç</a><button type="button">Kapat</button></div></div>`;
    bg.addEventListener("click", e => { if (e.target === bg || e.target.tagName === "BUTTON") bg.remove(); });
    document.body.appendChild(bg);
    try { const q = (await loadLib())(0, "M"); q.addData(url); q.make(); bg.querySelector("#qrBox").innerHTML = q.createSvgTag({ cellSize: 6, margin: 2, scalable: true }); }
    catch (_) { bg.querySelector("#qrBox").textContent = "QR yüklenemedi, linki kullan."; }
  };
})();
