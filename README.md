# UTBK Quest — The Scholar's Guild

Game belajar UTBK: React, Vite, Tailwind, Phaser, Zustand. Versi Vercel ini adalah **uji coba sekolah, mode tamu**. Tidak memerlukan akun ChatGPT. Progres tersimpan di browser dan domain yang sama, belum tersinkron ke perangkat lain. Simpanan dari situs sebelumnya tidak otomatis pindah ke domain Vercel.

## Jalankan dan deploy
- Node 22.13+ (disarankan Node 24).
- `npm ci`
- `npm run dev:vercel`
- `npm test`
- `npm run build:vercel` → `dist-vercel/`
- Import repository ini di Vercel. Framework **Other**, root repository, build `npm run build:vercel`, output `dist-vercel`, install `npm ci`. Konfigurasi juga tersedia di `vercel.json`.
- Tidak ada environment variable atau database yang diperlukan untuk mode tamu.

## Cara bermain
1. Pilih karakter dan isi nama panggilan.
2. HP/tablet: geser joystick kiri untuk bergerak, lepaskan untuk berhenti. Laptop: WASD/panah.
3. Buka **Denah kampus**, pilih PK/PM/PU. Titik kuning adalah posisimu; panah tujuan adalah arah langsung, bukan jalur otomatis.
4. Dekati pintu, ketuk tombol interaksi kanan (laptop: E/Space).
5. Dekati Station untuk 10 soal atau Guru Utama untuk 20 soal campuran.
6. Selesaikan sesi, baca pembahasan dan buka Jurnal belajar.

Kamera: HP zoom 0.68, tablet 0.85, desktop 1.0. UI dan tombol tidak ikut diperkecil. Denah dapat digulir di layar pendek.

## Batas uji coba
- 30 soal latihan orisinal awal; bukan soal resmi SNBT. Soal dapat berulang.
- Hadiah +100 poin dan +5 koin per jawaban benar; Quant-Hacker mendapat +10 poin untuk PK. Belum ada sistem level/XP, toko koin, multiplayer, chat atau leaderboard.
- Timer tetap berjalan saat halaman ditutup. Menghapus data browser menghapus progres tamu.
- Jangan menilai kemampuan siswa dari poin permainan; pengulangan sesi bisa menghasilkan poin kembali.
- Belum ada uji beban ratusan pemain atau verifikasi lengkap pada perangkat HP/tablet nyata. Mulai dari kelompok kecil.

## Source backend sebelumnya
Seluruh source aplikasi, server progres, tes, skema/migrasi D1, dan integrasi Sites tetap disertakan di `app/`, `server/`, `db/`, `drizzle/`, `build/`, `lib/`, dan `scripts/`. Backend lama menggunakan identitas server dari hosting Sites, bukan autentikasi yang bisa dijalankan langsung di Vercel. `npm run build` adalah jalur backend lama; **gunakan `npm run build:vercel` untuk Vercel**. Template manifest backend tersedia di `.openai/hosting.example.json`; identitas hosting lama sengaja tidak dihubungkan ke repository baru.

`VITE_GUEST_ONLY` ditetapkan oleh konfigurasi Vercel untuk menonaktifkan permintaan login/cloud, bukan sebagai mekanisme keamanan. Jangan mengaktifkan backend akun sebelum menambahkan penyedia autentikasi, verifikasi token server, dan database dengan isolasi akun. Kode server lama tidak mempercayai ID pemain tamu sebagai kredensial.

## Verifikasi
45 pengujian otomatis: bank soal, timer, skill, hadiah, simpanan lokal, profil, joystick, dan backend SQLite. Build Vercel berhasil. Pengujian backend menggunakan identitas simulasi, bukan bukti login akun produksi pada Vercel.

## Aset
Placeholder karakter 32×32 dan lingkungan dibuat melalui Canvas, disertakan dalam source. Tidak memerlukan unduhan aset eksternal.
