/* =============================================================
   Gerbang maintenance. Dijalankan paling awal (sebelum museum).
   window.MaintenanceGate.ready → Promise yang selesai saat
   museum boleh dimuat.
   ============================================================= */
(function () {
  var M = window.MAINTENANCE || {};
  var KEY = 'mk:owner';
  var body = document.body;

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function del(k) { try { localStorage.removeItem(k); } catch (e) { } }

  // "2026-12-20T19:00" dianggap jam WIB kalau tidak ada zona waktu.
  function parseDate(s) {
    if (!s) return null;
    s = String(s).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += 'T00:00';
    if (!/(Z|[+-]\d{2}:?\d{2})$/.test(s)) s += '+07:00';
    var t = Date.parse(s);
    return isNaN(t) ? null : t;
  }
  function normalize(s) {
    return String(s || '').normalize('NFKC').toLowerCase().trim().replace(/\s+/g, ' ');
  }
  function sha256hex(text) {
    if (!(window.crypto && crypto.subtle)) return Promise.reject(new Error('no-subtle'));
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }
  function ownerHash(code) { return sha256hex('mts-owner:' + normalize(code)); }

  var openAt = parseDate(M.bukaPada);
  var locked = M.aktif === true && !(openAt && Date.now() >= openAt);
  var isOwner = !!M.kodePemilik && get(KEY) === M.kodePemilik;

  var resolveReady;
  var ready = new Promise(function (r) { resolveReady = r; });
  window.MaintenanceGate = { ready: ready, ownerHash: ownerHash, locked: locked };

  if (!locked) { resolveReady(); return; }

  if (isOwner) {
    body.classList.add('owner-mode');
    onDom(showOwnerBadge);
    resolveReady();
    return;
  }

  // Terkunci: sembunyikan museum, tampilkan gerbang.
  body.classList.add('maint');
  onDom(setupGate);

  function onDom(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function showOwnerBadge() {
    var b = document.createElement('div');
    b.id = 'ownerBadge';
    b.innerHTML = '<span>🔑 Mode pemilik · <i>yang lain masih lihat layar maintenance</i></span> <button type="button">Kunci lagi</button>';
    b.querySelector('button').addEventListener('click', function () { del(KEY); location.reload(); });
    body.appendChild(b);
  }

  function release() {
    var g = document.getElementById('gate');
    body.classList.add('maint-leaving');
    setTimeout(function () {
      body.classList.remove('maint', 'maint-leaving');
      if (g) g.setAttribute('aria-hidden', 'true');
    }, 900);
    resolveReady();
  }

  function setupGate() {
    var $ = function (id) { return document.getElementById(id); };
    var g = $('gate');
    g.removeAttribute('aria-hidden');
    if (M.judul) $('gateTitle').textContent = M.judul;
    if (M.pesan) $('gateMsg').textContent = M.pesan;

    // Hitung mundur
    if (openAt) {
      var box = $('gateCount');
      box.hidden = false;
      var d = new Date(openAt);
      $('gateWhen').textContent = 'Dibuka ' + d.toLocaleString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta'
      }) + ' WIB';
      var cells = box.querySelectorAll('[data-u]');
      var tick = function () {
        var left = Math.max(0, openAt - Date.now());
        var s = Math.floor(left / 1000);
        var v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
        for (var i = 0; i < cells.length; i++) {
          var u = cells[i].getAttribute('data-u');
          cells[i].textContent = u === 'd' ? v.d : ('0' + v[u]).slice(-2);
        }
        if (left <= 0) { clearInterval(timer); release(); }
      };
      var timer = setInterval(tick, 1000);
      tick();
    }

    // Pintu kecil untuk pemilik
    var form = $('gateForm'), input = $('gateCode'), err = $('gateErr');
    $('gateOwnerBtn').addEventListener('click', function () {
      form.hidden = !form.hidden;
      if (!form.hidden) input.focus();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.textContent = '';
      if (!input.value.trim()) return;
      ownerHash(input.value).then(function (h) {
        if (h === M.kodePemilik) {
          set(KEY, h);
          body.classList.add('owner-mode');
          showOwnerBadge();
          release();
        } else {
          err.textContent = 'Kodenya bukan itu.';
          form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
          input.select();
        }
      }, function () {
        err.textContent = 'Buka lewat alamat https:// supaya kode bisa dicek.';
      });
    });
  }
})();
