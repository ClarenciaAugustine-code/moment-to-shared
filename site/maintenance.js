/* =============================================================
   MODE MAINTENANCE — Moment to Shared
   Selama aktif, semua orang cuma lihat layar "sedang disiapkan".
   Museum & diary belum dimuat sama sekali.
   ============================================================= */
window.MAINTENANCE = {
  // ✏️ true  = website dikunci (lagi kamu isi)
  //    false = website dibuka untuk semua teman
  aktif: true,

  // ✏️ Opsional: tanggal buka otomatis. Ada hitung mundur di layar,
  //    dan website kebuka sendiri saat waktunya tiba (jam WIB).
  //    Contoh: "2026-12-20T19:00"   ·   null = tanpa tanggal
  bukaPada: "2027-01-31T00:00",

  // ✏️ Kalimat di layar maintenance
  judul: "Pameran sedang ditata",
  pesan: "Kenangan kalian lagi dibingkai satu per satu. Sabar ya, sebentar lagi pintunya dibuka.",

  // ✏️ Kode masuk khusus kamu (biar bisa ngecek website walau masih dikunci).
  //    Ini hash, bukan kodenya. Kode bawaan: "kurator-clarencia"
  //    Mau ganti? Buka rahasia/build.html → bagian "Kode pemilik".
  kodePemilik: "df56de1e3fe59e940a177df6ea70a82297ed6d536d9443c3a93a43c0c507118c"
};
