# Panduan Deploy — Zaki Ansyari Premium Portfolio

## Isi paket
- `index.html`: website publik (profil, keahlian, proyek, timeline, sertifikat/CV, galeri, musik, buku tamu, formulir kontak, kartu kontak digital, statistik kunjungan).
- `admin.html`: dashboard admin dengan login Google; CRUD konten, moderasi buku tamu, dan pengelolaan pesan kontak.
- `assets/site.css`, `assets/space-theme.css`, `assets/site.js`, `assets/admin.js`, `assets/admin-project-image.js`: tampilan responsif dan logika frontend.
- `apps-script/Code.gs`: API server Google Apps Script untuk membaca/menulis Google Sheets dan memverifikasi admin.
- `vercel.json`: konfigurasi hosting statis Vercel.

## A. Siapkan Google Sheets
1. Buat spreadsheet baru di Google Sheets. Salin ID dari URL di antara `/d/` dan `/edit`.
2. Buka **Extensions → Apps Script**.
3. Hapus kode contoh, salin seluruh isi `apps-script/Code.gs` ke editor Apps Script.
4. Di bagian atas `Code.gs`, ganti `PASTE_YOUR_GOOGLE_SHEET_ID_HERE` dengan ID spreadsheet dan `your-admin-email@gmail.com` dengan alamat Gmail admin yang akan dipakai login.
5. Jangan pernah memasukkan password akun Google ke kode. Jangan bagikan token atau spreadsheet kepada publik.

## B. Buat OAuth Client ID untuk login admin
1. Buka [Google Cloud Console](https://console.cloud.google.com/), buat/pilih project, lalu atur **OAuth consent screen / Google Auth Platform**. Pilih tipe **External** jika akun Gmail biasa yang akan digunakan; tambahkan email admin sebagai test user jika aplikasi masih berstatus Testing.
2. Buka **Clients → Create client → Web application**.
3. Pada **Authorized JavaScript origins**, masukkan origin website, misalnya `https://NAMA-PROYEK.vercel.app` (tanpa path). Untuk uji lokal tambahkan `http://localhost:5500` jika menggunakan Live Server.
4. Buat client dan salin **Client ID** (bukan Client Secret). Isi `OAUTH_CLIENT_ID` pada `Code.gs` dan `GOOGLE_CLIENT_ID` pada `assets/admin.js` dengan nilai yang sama.
5. Setelah domain Vercel diketahui, pastikan origin cocok persis. Jika menggunakan domain custom, tambahkan origin itu juga.

## C. Buat sheet otomatis
1. Di Apps Script pilih fungsi `setupSheets` dan klik **Run**.
2. Setujui permintaan izin yang diminta Google. Fungsi ini membuat tab `Profile`, `Skills`, `Projects`, `Timeline`, `Credentials`, `Gallery`, `Songs`, `Messages`, dan `Guests` serta header awal.
3. Pastikan `setupSheets` selesai tanpa error. Jangan hapus baris header pada baris pertama tiap tab.

## D. Deploy Apps Script sebagai API
1. Klik **Deploy → New deployment → Select type → Web app**.
2. **Execute as:** Me. **Who has access:** Anyone. Ini diperlukan agar halaman publik dapat membaca konten dan pengunjung dapat mengirim pesan; tindakan admin tetap memerlukan token Google yang diverifikasi server dan email allowlist.
3. Klik Deploy, berikan izin jika diminta, lalu salin URL Web app yang berakhir dengan `/exec`.
4. Ganti `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` di `assets/site.js` dan `assets/admin.js` dengan URL itu.
5. Setelah mengubah kode Apps Script di masa depan, buka **Deploy → Manage deployments → Edit → New version → Deploy**. URL `/exec` biasanya tetap sama.
6. Untuk menampilkan gambar pada kartu proyek, isi **URL gambar proyek (HTTPS)** di dashboard saat menambahkan proyek. Saat proyek disimpan, kolom `image` ditambahkan otomatis ke tab `Projects` bila belum tersedia. Pada deployment yang sudah berjalan, salin `Code.gs` terbaru lalu deploy sebagai versi baru agar penyimpanan gambar aktif.

## E. Deploy frontend ke Vercel gratis
1. Unggah folder proyek ini ke repositori GitHub baru. Pastikan `index.html`, `admin.html`, `assets/`, `apps-script/`, dan `vercel.json` berada di root repositori.
2. Masuk ke [Vercel](https://vercel.com/), pilih **Add New → Project**, import repositori tersebut.
3. Untuk situs statis ini tidak perlu build command. Framework preset dapat dipilih **Other**; output directory gunakan `.` atau kosong sesuai pilihan antarmuka.
4. Deploy dan catat domain `https://...vercel.app`.
5. Masukkan domain tersebut sebagai **Authorized JavaScript origin** pada OAuth Client ID. Tunggu propagasi konfigurasi, lalu tes login admin.

## F. Konfigurasi akhir
- URL Apps Script di `assets/site.js` dan `assets/admin.js` harus sama dan tidak boleh masih berisi `PASTE_...`.
- `OAUTH_CLIENT_ID` di `Code.gs` harus sama dengan `GOOGLE_CLIENT_ID` di `assets/admin.js`.
- `ADMIN_EMAILS` harus memuat email admin yang benar.
- Data profil, proyek, keahlian, timeline, sertifikat, galeri, dan musik dikelola dari `/admin.html` setelah login.
- Foto profil, gambar proyek, foto galeri, CV, dan sertifikat dapat diunggah langsung dari dashboard admin ke folder Google Drive **Portfolio Website Uploads**. URL Drive akan diisikan otomatis ke formulir; klik tombol simpan formulir untuk menerapkannya ke website. Tautan HTTPS manual tetap didukung.
- File yang diunggah dibagikan dengan izin **siapa saja yang memiliki link dapat melihat** agar website publik bisa menampilkan foto dan membuka dokumen. Maksimal 8 MB per file; format yang didukung: JPG, PNG, GIF, WebP, PDF, DOC, dan DOCX. Jangan unggah file privat atau sensitif.
- Setelah menyalin `Code.gs` terbaru ke Apps Script, pilih dan jalankan fungsi `authorizeDriveAccess` satu kali di editor Apps Script, lalu setujui izin Google Drive. Setelah itu deploy sebagai versi baru Web App. Folder upload dibuat otomatis saat upload pertama.
- Buku tamu baru berstatus `pending`; admin harus menyetujuinya sebelum tampil publik.
- Fitur live chat telah dihapus. Deploy ulang `Code.gs` sebagai versi baru agar endpoint chat lama ikut dinonaktifkan. Jika spreadsheet lama memiliki tab `Chat`, tab dan datanya dibiarkan utuh tetapi tidak lagi digunakan.

## G. Checklist pengujian sebelum dipakai
1. Buka domain publik di mode incognito; pastikan halaman tampil di desktop dan ponsel.
2. Buka DevTools → Console dan Network; pastikan tidak ada error JavaScript dan permintaan `?action=site` mendapat JSON `ok: true`.
3. Pastikan statistik kunjungan bertambah setelah halaman dimuat ulang.
4. Kirim formulir kontak dengan email valid; cek tab `Messages`.
5. Kirim buku tamu; pastikan belum tampil publik. Login admin, setujui pesan, refresh situs publik, dan pastikan tampil. Uji sembunyikan dan hapus.
6. Login admin menggunakan akun yang masuk `ADMIN_EMAILS`; coba akun lain yang tidak diizinkan dan pastikan ditolak.
7. Tambahkan/hapus satu item di masing-masing tab dashboard; periksa spreadsheet dan halaman publik.
8. Uji tombol download kartu kontak digital; pastikan file `.vcf` terunduh.
9. Uji tautan foto/CV/lagu, menu mobile, formulir kosong, karakter HTML pada buku tamu, dan tampilan layar 360px.

## Catatan keamanan dan batasan
- Dashboard memerlukan login Google; server memverifikasi token Google dan memeriksa email terhadap allowlist. Jangan menaruh rahasia atau kredensial admin di frontend.
- Endpoint publik tetap dapat diakses siapa saja untuk konten publik, buku tamu, dan formulir kontak. Ini bukan sistem akun pengunjung. Untuk penggunaan besar, tambahkan CAPTCHA/rate limit dan kebijakan privasi.
- Statistik saat ini menghitung pemuatan halaman yang meminta API `site`; refresh halaman juga menambah hitungan. Ini statistik sederhana, bukan analytics unik dan bukan pengukuran anti-bot.
- Apps Script/Sheets mempunyai kuota layanan. Jika trafik meningkat, pindahkan API ke backend dengan rate limiting/database khusus.
- File ini sudah diperiksa secara statis untuk struktur dan sintaks dasar; integrasi live Google, izin OAuth, kuota, dan deploy tetap harus diuji menggunakan akun dan project milik Anda. Jangan anggap koneksi berhasil sebelum checklist pengujian lulus.

## Layar pemuatan dan sinkronisasi awal

Halaman publik sekarang menggunakan tampilan hitam dengan aksen biru angkasa dan layar pemuatan senada sebelum konten utama terlihat. Saat integrasi Google Apps Script sudah dikonfigurasi, website mencoba mengambil data terbaru dari Google Sheets terlebih dahulu. Data berhasil diambil akan disimpan sebagai cache browser agar kunjungan berikutnya dapat menampilkan data tersimpan sambil memuat pembaruan.

- Jika sinkronisasi berhasil, layar pemuatan menampilkan status selesai lalu membuka website.
- Jika URL Apps Script belum dikonfigurasi atau server tidak merespons dalam sekitar 8 detik, layar menampilkan status yang sesuai dan menyediakan tombol **Masuk ke website**. Website juga melanjutkan secara otomatis sesaat setelah status tersebut ditampilkan, supaya pengunjung tidak terjebak di layar pemuatan.
- Jika data cache tersedia, cache digunakan sebagai tampilan sementara saat menunggu data live.
- Layar pemuatan tidak menggantikan pengaturan backend: pastikan URL Web App, akses deployment, izin Google, dan struktur Google Sheets sudah benar.

### Checklist pengujian layar pemuatan

1. Dengan URL Apps Script valid dan Sheets berisi data, muat ulang website dan pastikan status sinkronisasi selesai muncul sebelum halaman ditampilkan.
2. Putuskan koneksi internet atau gunakan URL API yang tidak merespons. Pastikan website tetap dapat dibuka dan tidak macet di layar pemuatan.
3. Setelah kunjungan sukses, muat ulang dan pastikan data cache bisa dipakai sementara ketika sinkronisasi berlangsung.
4. Uji di perangkat mobile dan desktop serta aktifkan opsi pengurangan animasi di sistem operasi untuk memeriksa aksesibilitas.
