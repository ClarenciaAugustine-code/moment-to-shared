/* ==========================================================
   MuseumCrypto — kunci diary pakai enkripsi beneran (AES-GCM)
   Dipakai oleh index.html (buka diary) & rahasia/build.html
   (enkripsi). Kamu TIDAK perlu edit file ini.
   ========================================================== */
(function () {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const ITERATIONS = 150000;

  // Field yang BOLEH terlihat publik (nama di plakat, petunjuk, dll).
  const PUBLIC_FIELDS = ['name', 'nickname', 'icon', 'color', 'hint', 'hint2'];
  // Field yang dikunci (hanya terbuka kalau password benar).
  const PRIVATE_FIELDS = ['title', 'cover', 'photos', 'entries'];  // entries = nama lama dari photos

  function toB64(buf) {
    const bytes = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(s);
  }
  function fromB64(str) {
    const bin = atob(str);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  // Password tidak peka huruf besar/kecil & spasi berlebih.
  function normalize(s) {
    return String(s ?? '').normalize('NFKC').toLowerCase().trim().replace(/\s+/g, ' ');
  }

  function hash(str) {
    let h = 2166136261 >>> 0;
    for (const ch of String(str)) {
      h ^= ch.codePointAt(0);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function slug(s) {
    return normalize(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'teman';
  }
  function makeId(name, i) {
    return String(i + 1).padStart(2, '0') + '-' + slug(name);
  }

  function publicPart(f, i) {
    const o = { id: makeId(f.name, i) };
    PUBLIC_FIELDS.forEach((k) => { if (f[k] !== undefined) o[k] = f[k]; });
    return o;
  }
  function privatePart(f) {
    const o = {};
    PRIVATE_FIELDS.forEach((k) => { if (f[k] !== undefined) o[k] = f[k]; });
    return o;
  }
  function answersOf(f) {
    return [].concat(f.password ?? []).map(normalize).filter(Boolean);
  }

  async function deriveKey(answer, salt) {
    const base = await crypto.subtle.importKey('raw', enc.encode(normalize(answer)), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
      base,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Isi diary dienkripsi 1x dengan kunci acak, lalu kunci acak itu
  // "digembok" ulang untuk setiap jawaban yang diterima.
  async function seal(obj, answers) {
    const contentKeyRaw = crypto.getRandomValues(new Uint8Array(32));
    const contentKey = await crypto.subtle.importKey('raw', contentKeyRaw, 'AES-GCM', false, ['encrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, contentKey, enc.encode(JSON.stringify(obj)));
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const locks = [];
    for (const a of answers) {
      const k = await deriveKey(a, salt);
      const wiv = crypto.getRandomValues(new Uint8Array(12));
      const wrapped = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: wiv }, k, contentKeyRaw);
      locks.push({ iv: toB64(wiv), key: toB64(wrapped) });
    }
    return { salt: toB64(salt), iv: toB64(iv), data: toB64(data), locks };
  }

  async function open(sealed, answer) {
    if (!sealed || !answer) return null;
    const k = await deriveKey(answer, fromB64(sealed.salt));
    for (const l of sealed.locks) {
      try {
        const raw = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(l.iv) }, k, fromB64(l.key));
        const ck = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
        const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(sealed.iv) }, ck, fromB64(sealed.data));
        return JSON.parse(dec.decode(pt));
      } catch (e) { /* bukan gembok ini, coba berikutnya */ }
    }
    return null;
  }

  const api = {
    seal, open, normalize, hash, makeId, publicPart, privatePart, answersOf,
    PUBLIC_FIELDS, PRIVATE_FIELDS,
    available: !!(globalThis.crypto && globalThis.crypto.subtle),
  };
  if (typeof window !== 'undefined') window.MuseumCrypto = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
