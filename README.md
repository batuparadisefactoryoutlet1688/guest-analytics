# Batu Paradise Guest Analytics — Frontend

## Cara pakai
1. Upload semua isi folder ini ke repo GitHub, aktifkan GitHub Pages.
2. Buka `index.html` (halaman login), masuk pakai password Admin atau Viewer.
3. Kalau URL deployment Apps Script berubah, edit satu baris di `js/api.js`:
   ```js
   const API_URL = 'https://script.google.com/macros/s/.../exec';
   ```

## Struktur
- `index.html` — Login
- `dashboard.html` — KPI Today/This Month/This Year + trend 7 hari
- `input.html` — Admin only: input, edit, hapus data harian
- `comparison.html` — 6 mode: Hari, Hari yang Sama, Minggu, Posisi Hari, Bulan, Custom
- `analytics.html` — Lantai 1 vs 2, Pagi vs Sore, Weekend vs Weekday
- `css/` — style per halaman + `responsive.css` global
- `js/` — `utils.js` (helper & nav), `api.js` (panggilan ke Apps Script),
  lalu satu file JS per halaman
- `manifest.json` + `sw.js` — supaya bisa di-install sebagai PWA
  (ikon di `assets/icons/` belum ada — tambahkan `icon-192.png` dan
  `icon-512.png` sendiri, atau app tetap jalan normal tanpa ikon)

## Catatan
- Semua permission (Viewer tidak bisa input/edit/hapus) memang sudah
  ditolak di backend juga (`Auth.gs`), tombol yang disembunyikan di
  frontend cuma untuk UX, bukan satu-satunya lapisan keamanan.
- Sheet `USERS` dan `SETTING` diasumsikan sudah sesuai yang dibahas
  sebelumnya (password di-hash, 1 baris Admin + 1 baris Viewer).
