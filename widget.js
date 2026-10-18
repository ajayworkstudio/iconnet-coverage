/*
 * Widget Cek Coverage ICONNET
 * Pasang di situs mana pun:
 *   <div id="iconnet-cek"></div>
 *   <script src="https://iconnet-coverage.vercel.app/widget.js" defer></script>
 *
 * Opsi (atribut di div):
 *   data-wa="6281339646353"   nomor WhatsApp tujuan
 *   data-title="..."          judul widget
 */
(function () {
  "use strict";
  var API = "https://iconnet-coverage.vercel.app/api/coverage";
  var host = document.getElementById("iconnet-cek");
  if (!host || host.dataset.ready) return;
  host.dataset.ready = "1";
  var TITLE = host.dataset.title || "Cek ketersediaan ICONNET di rumahmu";

  var css =
    ".icw{--b:#0A4BD6;--bd:#062E8F;--ink:#0B1B3A;--mu:#5A6B8C;--ln:#DCE4F2;--bg:#F4F7FD;--tint:#E8F0FF;--ok:#0E9F6E;--okt:#E3F7EF;--no:#C2410C;--not:#FDEEE6;" +
    "font-family:'Plus Jakarta Sans',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:var(--ink);background:#fff;border:1px solid var(--ln);border-radius:20px;padding:20px;max-width:560px;margin:0 auto;box-sizing:border-box;text-align:left;line-height:1.5}" +
    ".icw *{box-sizing:border-box}" +
    ".icw h3{margin:0 0 4px;font-size:19px;font-weight:800;letter-spacing:-.01em;color:var(--ink)}" +
    ".icw p{margin:0}" +
    ".icw .icw-lead{color:var(--mu);font-size:14px}" +
    ".icw .icw-row{display:flex;gap:8px;margin-top:14px}" +
    ".icw input{flex:1;min-width:0;padding:12px 13px;border:1.5px solid var(--ln);border-radius:12px;font:inherit;font-size:15px;color:var(--ink);background:#fff}" +
    ".icw input:focus{outline:none;border-color:var(--b);box-shadow:0 0 0 3px rgba(10,75,214,.12)}" +
    ".icw button{font:inherit;cursor:pointer}" +
    ".icw .icw-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 16px;border-radius:12px;border:0;font-weight:700;font-size:15px;background:var(--b);color:#fff;text-decoration:none}" +
    ".icw .icw-btn:hover{background:var(--bd)}" +
    ".icw .icw-btn:disabled{opacity:.6;cursor:default}" +
    ".icw .icw-line{background:#fff;color:var(--b);border:1.5px solid var(--ln)}" +
    ".icw .icw-line:hover{background:#fff;border-color:var(--b)}" +
    ".icw .icw-full{width:100%;margin-top:10px}" +
    ".icw svg{width:18px;height:18px;flex:none}" +
    ".icw .icw-err{color:var(--no);font-size:13.5px;font-weight:600;margin-top:8px}" +
    ".icw .icw-res{margin-top:14px;border-radius:14px;padding:14px;display:grid;gap:8px;border:1.5px solid var(--ln);background:var(--bg)}" +
    ".icw .icw-res.ok{background:var(--okt);border-color:#A7E3C9}" +
    ".icw .icw-res.warn{background:var(--not);border-color:#F6C9AE}" +
    ".icw .icw-hd{display:flex;align-items:center;gap:10px;font-weight:800;font-size:16px}" +
    ".icw .icw-ic{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;color:#fff;background:var(--mu);flex:none}" +
    ".icw .icw-ic svg{width:15px;height:15px}" +
    ".icw .ok .icw-ic{background:var(--ok)}.icw .warn .icw-ic{background:var(--no)}" +
    ".icw .icw-area{font-weight:700;overflow-wrap:anywhere}" +
    ".icw .icw-meta{font-size:13.5px;color:var(--mu)}" +
    ".icw .icw-meta a{color:var(--b)}" +
    ".icw .icw-pill{justify-self:start;display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;padding:4px 10px;border-radius:999px;background:#fff;border:1px solid var(--ln)}" +
    ".icw .icw-pill i{width:10px;height:10px;border-radius:50%;display:block}" +
    ".icw .icw-spin{width:16px;height:16px;border-radius:50%;border:2.5px solid rgba(255,255,255,.4);border-top-color:#fff;animation:icwsp .7s linear infinite}" +
    "@keyframes icwsp{to{transform:rotate(360deg)}}" +
    ".icw [hidden]{display:none!important}" +
    "@media (max-width:420px){.icw{padding:16px}.icw .icw-row{flex-direction:column}.icw .icw-row .icw-btn{width:100%}}";

  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  var I_PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="7.5"/></svg>';
  var I_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var I_NO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>';
  var I_WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 6v8M12 18h.01"/></svg>';
  var I_WA = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2s-1 .3-3.4-.7a11.6 11.6 0 0 1-4.5-4c-.4-.6-1-1.8-1-2.9s.6-1.7.9-2a.9.9 0 0 1 .6-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.6-.4.4c-.1.1-.2.3-.1.6a8 8 0 0 0 1.5 1.8 7 7 0 0 0 2.1 1.3c.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.4.2.5.3a2.4 2.4 0 0 1-.2 1.3z"/></svg>';

  host.innerHTML =
    '<div class="icw">' +
    "<h3></h3>" +
    '<p class="icw-lead">Tempel titik koordinat atau link Google Maps rumahmu, atau pakai lokasi HP saat ini.</p>' +
    '<form class="icw-row" novalidate>' +
    '<input type="text" inputmode="text" autocomplete="off" placeholder="-7.0051, 110.4381 atau link Maps" aria-label="Koordinat atau link Google Maps">' +
    '<button type="submit" class="icw-btn">Cek</button>' +
    "</form>" +
    '<button type="button" class="icw-btn icw-line icw-full" data-gps>' + I_PIN + "Pakai lokasi saya</button>" +
    '<p class="icw-err" hidden></p>' +
    '<div class="icw-res" hidden aria-live="polite"></div>' +
    "</div>";
  host.querySelector("h3").textContent = TITLE;

  var form = host.querySelector("form");
  var input = host.querySelector("input");
  var btn = form.querySelector("button");
  var gps = host.querySelector("[data-gps]");
  var err = host.querySelector(".icw-err");
  var res = host.querySelector(".icw-res");

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function km(m) {
    return m >= 1000 ? (m / 1000).toFixed(1).replace(".", ",") + " km" : m + " m";
  }
  function showErr(msg) {
    err.textContent = msg;
    err.hidden = false;
  }
  function busy(b) {
    btn.disabled = b;
    gps.disabled = b;
    btn.innerHTML = b ? '<span class="icw-spin"></span>' : "Cek";
  }
  // Dibaca saat tombol dibuat, jadi data-wa yang diubah belakangan (misalnya oleh
  // link marketer di situs pemasang) tetap terpakai.
  function waNumber() {
    return (host.dataset.wa || "6281339646353").replace(/\D/g, "");
  }
  function waLink(text) {
    return "https://wa.me/" + waNumber() + "?text=" + encodeURIComponent(text);
  }

  function render(d) {
    var lat = d.location.lat, lng = d.location.lng;
    var loc = lat.toFixed(6) + ", " + lng.toFixed(6);
    var maps = "https://www.google.com/maps?q=" + lat + "," + lng;
    var cls, head, icon, body = "", msg;
    if (d.covered && d.available !== false) {
      cls = "ok"; icon = I_OK; head = "Lokasi tercover";
      body =
        '<div class="icw-area">' + esc(d.area.name) + "</div>" +
        '<div class="icw-meta">Rumahmu bisa dipasang ICONNET. Lanjutkan pendaftaran lewat WhatsApp.</div>';
      msg = "Halo, saya mau pasang ICONNET.\n\nLokasi: " + loc + "\nMaps: " + maps + "\nArea: " + d.area.name + " (tercover)\n\nMohon info paket dan jadwal pemasangannya.";
      body += '<a class="icw-btn" target="_blank" rel="noopener" href="' + waLink(msg) + '">' + I_WA + "Daftar via WhatsApp</a>";
    } else if (d.covered) {
      cls = "warn"; icon = I_WARN; head = "Area tercover, kapasitas penuh";
      body =
        '<div class="icw-area">' + esc(d.area.name) + "</div>" +
        '<div class="icw-meta">Port di area ini sedang penuh. Hubungi kami untuk masuk daftar tunggu penambahan kapasitas.</div>';
      msg = "Halo, saya mau pasang ICONNET tapi area saya penuh.\n\nLokasi: " + loc + "\nMaps: " + maps + "\nArea: " + d.area.name + "\n\nMohon info kapan ada penambahan kapasitas.";
      body += '<a class="icw-btn icw-line" target="_blank" rel="noopener" href="' + waLink(msg) + '">' + I_WA + "Masuk daftar tunggu</a>";
    } else {
      cls = ""; icon = I_NO; head = "Belum tercover";
      body =
        (d.nearest ? '<div class="icw-meta">Jaringan terdekat sekitar <strong>' + km(d.nearest.distanceM) + "</strong> dari lokasimu.</div>" : "") +
        '<div class="icw-meta">Jaringan terus bertambah. Kirim lokasimu supaya kami kabari begitu sudah tersedia.</div>';
      msg = "Halo, lokasi saya belum tercover ICONNET.\n\nLokasi: " + loc + "\nMaps: " + maps + "\n\nMohon dicek manual dan dikabari kalau sudah tersedia.";
      body += '<a class="icw-btn icw-line" target="_blank" rel="noopener" href="' + waLink(msg) + '">' + I_WA + "Minta dicek manual</a>";
    }
    res.className = "icw-res " + cls;
    res.innerHTML =
      '<div class="icw-hd"><span class="icw-ic">' + icon + "</span>" + head + "</div>" + body +
      '<div class="icw-meta">Titik: <a href="' + maps + '" target="_blank" rel="noopener">' + loc + "</a></div>";
    res.hidden = false;
  }

  function check(query) {
    err.hidden = true;
    res.hidden = true;
    busy(true);
    fetch(API + "?" + query)
      .then(function (r) {
        return r.json().catch(function () {
          return { ok: false, error: "Server tidak merespons dengan benar. Coba lagi sebentar." };
        });
      })
      .then(function (d) {
        if (!d.ok) return showErr(d.error || "Gagal cek coverage.");
        render(d);
      })
      .catch(function () {
        showErr("Tidak bisa terhubung ke server. Cek koneksi internet, lalu coba lagi.");
      })
      .then(function () {
        busy(false);
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) {
      showErr("Masukkan koordinat atau link Google Maps dulu.");
      input.focus();
      return;
    }
    check("q=" + encodeURIComponent(v));
  });

  gps.addEventListener("click", function () {
    if (!navigator.geolocation) return showErr("Browser ini tidak mendukung lokasi. Tempel koordinat secara manual.");
    err.hidden = true;
    busy(true);
    navigator.geolocation.getCurrentPosition(
      function (p) {
        input.value = p.coords.latitude.toFixed(6) + ", " + p.coords.longitude.toFixed(6);
        check("lat=" + p.coords.latitude + "&lng=" + p.coords.longitude);
      },
      function () {
        busy(false);
        showErr("Izin lokasi ditolak atau GPS belum aktif. Aktifkan lokasi, atau tempel koordinat secara manual.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });
})();
