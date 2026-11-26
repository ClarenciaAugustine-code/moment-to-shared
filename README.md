# 🏛️ Moment to Shared

Website museum 3D untuk 50 teman. Tiap teman punya lukisan sendiri (emoji, warna, dan pola berbeda). Untuk membuka kenangannya mereka harus menebak password. Setelah terbuka, foto-foto polaroid "dilempar" ke atas meja; tiap foto bisa diklik untuk membaca ceritanya. Playlist lagu berputar terus dari awal masuk museum.

## Struktur folder

```
moment-to-shared/
├── site/                 ← YANG DI-DEPLOY (upload ke Vercel/Netlify)
│   ├── index.html        museum 3D + meja kenangan
│   ├── maintenance.js    ← ✏️ kunci website (maintenance) on/off
│   ├── css/style.css
│   ├── js/crypto.js      enkripsi (tidak perlu diedit)
│   ├── js/gate.js        layar maintenance (tidak perlu diedit)
│   ├── data/museum.js    ← hasil build (belum ada sampai kamu build)
│   └── assets/
│       ├── photos/       ← ✏️ taruh foto di sini
│       └── music/        ← ✏️ taruh lagu .mp3 di sini
├── .github/workflows/    deploy otomatis ke GitHub Pages
├── .gitignore            mencegah rahasia/ ter-upload
└── rahasia/              ← ⚠️ JANGAN DI-UPLOAD
    ├── friends.js        ← ✏️ DATA 50 ORANG (nama, password, foto & cerita)
    └── build.html        alat enkripsi
```

## Yang perlu kamu isi sendiri ✏️

| # | Apa | Di mana |
|---|-----|---------|
| 1 | Judul, subjudul, nama kamu | `rahasia/friends.js` → `MUSEUM_CONFIG` |
| 2 | **Playlist lagu** (file mp3) | taruh di `site/assets/music/`, daftarkan di `MUSEUM_CONFIG.playlist` |
| 3 | 50 orang: nama, emoji, warna, **password**, petunjuk, foto + cerita tiap foto | `rahasia/friends.js` → `FRIENDS` |
| 4 | Foto-foto | `site/assets/photos/<nama>/...` lalu tulis path-nya di `friends.js` |
| 5 | Hapus foto contoh | `site/assets/photos/contoh/` (setelah semua diganti) |

Semua bagian yang wajib diganti ditandai **✏️** di `friends.js`. Halaman `build.html` juga menghitung berapa orang yang masih ada tanda ✏️-nya.

**Tips password:** tidak peka huruf besar/kecil & spasi. Boleh kasih beberapa jawaban: `password: ["nasi goreng", "nasgor"]`. `hint2` baru muncul setelah salah 3x.

**Playlist:** satu daftar lagu untuk seluruh museum, diputar berurutan dan diulang terus. Musiknya tidak berhenti waktu meja teman dibuka. Tambah lagu = tambah 1 baris di `playlist`. Set `acak: true` kalau mau urutannya diacak. Pengunjung bisa mematikan suara (🔊) atau lompat ke lagu berikutnya (⏭).

## Cara preview (sambil ngedit)

Buka `site/index.html` langsung di Chrome (double-click), atau pakai **Live Server** di VS Code (klik kanan `site/index.html` → *Open with Live Server*).
Selama `data/museum.js` belum ada, museum otomatis membaca `rahasia/friends.js` (badge merah **MODE PREVIEW** di pojok).
Butuh internet karena Three.js, & font dimuat dari CDN.

> Foto sampul di lukisan 3D baru muncul kalau dibuka lewat Live Server / sudah online (batasan browser untuk `file://`). Di meja kenangan, foto tetap muncul.

## Cara publish 🚀

1. Buka `rahasia/build.html` di Chrome → klik **Enkripsi** → **Download museum.js**.
2. Pindahkan file itu ke `site/data/museum.js`.
3. Deploy **folder `site/` saja**:
   - **Netlify Drop**: buka app.netlify.com/drop → drag folder `site`.
   - **Vercel**: `vercel deploy` dari dalam folder `site`, atau set *Root Directory* = `site`.
4. Kalau `friends.js` diubah lagi → build ulang → timpa `museum.js` → deploy ulang.

Mau preview data mentah padahal `museum.js` sudah ada? Tambahkan `?preview` di URL lokal.

## Deploy ke GitHub Pages (bisa di-update kapan saja) 🐙

Sekali setup, setiap kali kamu **push** ke GitHub, website otomatis ter-update dalam sekitar 1 menit. **Alamatnya tetap sama**, jadi QR yang sudah dicetak tetap jalan.

**Setup (sekali saja):**
1. Buat repo baru di GitHub. ✏️ **Pilih nama repo yang final**, karena alamat website = `https://USERNAME.github.io/NAMA-REPO/`. Kalau nama repo atau username diganti nanti, alamatnya berubah dan QR-nya rusak.
2. Upload seluruh folder proyek ini. Folder `rahasia/` otomatis **tidak** ikut karena sudah ada di `.gitignore`.
3. Di repo: **Settings → Pages → Source: GitHub Actions**.
4. Tunggu tab **Actions** selesai (centang hijau). Alamat website muncul di Settings → Pages. **Itu link untuk QR-nya.**

**Update isi:** edit `rahasia/friends.js` → build ulang di `build.html` → timpa `site/data/museum.js` → commit & push.

⚠️ **Jangan pernah** upload `rahasia/friends.js` ke GitHub, walau cuma sekali. Riwayat git menyimpannya selamanya, dan repo GitHub Pages gratis harus publik. Kalau sampai ter-upload, hapus repo lalu buat yang baru. Workflow juga akan gagal dengan sengaja kalau mendeteksi file itu.

## Mode maintenance 🚧

Selama kamu masih ngisi, website tampil sebagai layar **"Pameran sedang ditata"**. Museum, nama, dan foto belum dimuat sama sekali.

Diatur di `site/maintenance.js`:

| Mau apa | Ubah ini |
|---|---|
| Kunci website | `aktif: true` |
| Buka untuk semua | `aktif: false` → deploy ulang |
| Buka otomatis di jam tertentu (ada hitung mundur) | `bukaPada: "2026-12-20T19:00"` (jam WIB) |
| Ganti tulisan | `judul`, `pesan` |

**Kamu tetap bisa masuk:** di layar maintenance klik **kurator?** lalu ketik kode pemilik.
- ✏️ Kode bawaan: `kurator-clarencia`. Sebaiknya diganti: buka `rahasia/build.html`, isi bagian **Kode pemilik**, lalu salin baris hasilnya ke `maintenance.js`.
- Kode cuma perlu diketik sekali per browser. Tombol **Kunci lagi** (badge di atas) mengembalikan layar maintenance.
- Teman yang ngerti "Inspect Element" bisa melewati layar ini, tapi meja kenangan tetap terkunci password masing-masing.

## Keamanan (kenapa ada build)

Tanpa build, password bisa diintip lewat *Inspect Element*. Setelah build, isi tiap meja (daftar foto, caption, cerita, julukan) **dienkripsi AES-256** pakai password masing-masing. Yang terlihat publik cuma nama, emoji, warna, dan petunjuk.
Catatan: file foto tetap bisa diakses kalau ada yang tahu path-nya, jadi beri nama folder/file yang tidak gampang ditebak (misal `photos/b7x2/1.jpg`).

## Meja kenangan

Setelah password benar, layar berganti ke **meja kayu** dan foto-foto polaroid "dilempar" ke atasnya secara acak.
- **Klik / ketuk foto** → foto membesar, di sebelahnya ada kertas berisi tanggal, caption, dan cerita (`text`).
- **Seret foto** untuk menggeser-geser di atas meja, seperti foto beneran.
- **↻ Lempar ulang** mengacak posisi foto lagi.
- Item tanpa `photo` jadi kertas catatan kuning, cocok untuk pesan singkat.
- Tambah foto = tambah 1 baris di `photos`. Paling enak 4–12 foto per orang. Cerita boleh panjang, ada scroll di HP.

## Kontrol

- **Laptop:** scroll / `W` `S` untuk jalan, drag atau `A` `D` untuk menoleh, klik lukisan, `Esc` untuk menutup.
- **HP:** geser ke atas untuk jalan, geser ke samping untuk menoleh, ketuk lukisan.
- Tombol **☰ Daftar Nama** untuk mencari nama dan langsung terbang ke lukisannya.
- **Di meja kenangan:** klik foto untuk membaca ceritanya, lalu tombol ‹ ›, panah ← →, atau swipe di HP untuk pindah foto.
- Meja yang sudah terbuka diingat di browser itu. Tombol "🔒 Kunci lagi" ada di pojok kanan bawah meja.
