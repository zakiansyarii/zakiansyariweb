# Panduan deploy website Zaki Ansyari (versi Home / Gallery / Songs / Contact)

## Apa yang ada?
- `index.html`: satu halaman dengan navigasi Home, Gallery, Songs, Contact.
- `assets/site.css`: desain hitam/navy dan emas, responsif.
- `assets/site.js`: konten publik membaca Google Sheets melalui Apps Script; formulir kontak menyimpan pesan ke tab Messages.
- `admin.html`: dashboard untuk login Google dan mengelola profil, foto gallery, serta lagu.
- `assets/admin.js`: login Google dan operasi admin.
- `apps-script/Code.gs`: backend Google Apps Script.
- `vercel.json`: konfigurasi hosting Vercel.

Foto di screenshot Anda belum tersedia sebagai file foto asli terpisah, jadi website memakai gambar placeholder sampai Anda memasukkan URL foto asli. Untuk mendapatkan hasil paling mirip, upload foto asli Anda ke layanan yang menyediakan URL gambar HTTPS publik, lalu masukkan URL-nya di Admin. Jangan menggunakan URL halaman Google Drive biasa; gunakan link gambar yang memang dapat diakses sebagai gambar.

## A. Buat Google Sheets
1. Buka https://sheets.google.com lalu buat spreadsheet `Database Website Zaki`.
2. Salin Spreadsheet ID dari URL: `https://docs.google.com/spreadsheets/d/ID_INI/edit`.
3. Jangan buat spreadsheet publik. Backend Apps Script yang membaca data untuk situs; pemilik tetap mengontrol akses spreadsheet.

## B. Buat backend
1. Dari spreadsheet pilih **Ekstensi → Apps Script**.
2. Ganti kode default dengan seluruh isi `apps-script/Code.gs`.
3. Ganti `PASTE_YOUR_GOOGLE_SHEET_ID_HERE` dengan Spreadsheet ID.
4. Ganti `your-admin-email@gmail.com` di `ADMIN_EMAILS` dengan email Google admin Anda, huruf kecil.
5. Simpan, pilih fungsi `setupSheets`, klik **Run**, lalu berikan izin yang diminta.
6. Kembali ke Sheets dan pastikan tab `Profile`, `Gallery`, `Songs`, `Messages` sudah dibuat.

## C. Buat Google OAuth Client ID
1. Buka https://console.cloud.google.com dan pilih/buat Google Cloud project.
2. Buka Google Auth Platform/OAuth consent screen. Lengkapi nama aplikasi dan email dukungan.
3. Untuk aplikasi pribadi Gmail yang masih diuji, pilih External bila opsi audience tersedia dan tambahkan email admin sebagai Test user jika aplikasi dalam mode testing.
4. Buat OAuth Client ID tipe **Web application**.
5. Pada Authorized JavaScript origins tambahkan `http://localhost:3000`. Setelah website live, tambahkan juga origin Vercel, contoh `https://nama-proyek.vercel.app` (tanpa `/admin.html`).
6. Salin Client ID yang berakhir `.apps.googleusercontent.com`. Ini bukan Client Secret.

## D. Konfigurasi Client ID dan Apps Script URL
1. Dalam `apps-script/Code.gs`, di fungsi `getOAuthClientId_()`, ganti `PASTE_YOUR_GOOGLE_OAUTH_WEB_CLIENT_ID_HERE` dengan Client ID Anda.
2. Dalam `assets/admin.js`, ganti `GOOGLE_CLIENT_ID` dengan Client ID yang sama.
3. Di `assets/site.js` dan `assets/admin.js`, ganti `API_URL` dengan URL deployment Apps Script yang berakhir `/exec`.
4. Simpan semua file.

## E. Deploy Apps Script
1. Klik **Deploy → New deployment → Web app**.
2. Execute as: **Me**.
3. Who has access: pilih opsi yang mengizinkan pengunjung anonim mengakses web app, jika tersedia. Ini dibutuhkan agar konten publik bisa dibaca; operasi admin tetap memerlukan token Google dan email yang masuk daftar admin.
4. Deploy dan salin URL `/exec`.
5. Jika mengubah `Code.gs`, buka **Deploy → Manage deployments → Edit → New version → Deploy**. Pastikan frontend memakai URL `/exec` deployment tersebut.
6. Buka URL `/exec` di browser. Seharusnya tampil JSON dengan `ok:true` dan data.

## F. Tes lokal
1. Ekstrak ZIP ke folder.
2. Buka terminal pada folder proyek lalu jalankan `python -m http.server 3000` (Windows bisa `py -m http.server 3000`).
3. Buka `http://localhost:3000`.
4. Buka `http://localhost:3000/admin.html`, lalu login dengan email admin yang sudah didaftarkan.
5. Tambah foto gallery memakai URL gambar HTTPS, tambahkan lagu, lalu ubah kutipan Home.
6. Pastikan item masuk ke Google Sheets dan muncul pada halaman publik.

## G. Deploy Vercel
1. Buat repository GitHub lalu upload isi folder proyek (file `index.html` harus di root repository).
2. Buka https://vercel.com, pilih **Add New → Project**, lalu import repository.
3. Framework Preset: **Other**. Build command kosong, Output Directory `.` atau root.
4. Klik Deploy.
5. Salin URL domain Vercel. Tambahkan origin tersebut ke Authorized JavaScript origins di Google Cloud.
6. Tunggu perubahan OAuth berlaku, lalu tes halaman `/` dan `/admin.html`.
7. Pastikan URL Apps Script dan Client ID pada file JS sudah benar sebelum deployment.

## H. Bagaimana cara memasukkan foto seperti screenshot?
1. Siapkan file foto asli dalam format JPG/PNG.
2. Upload ke penyimpanan yang memberi URL gambar HTTPS publik, atau hosting gambar yang Anda percaya.
3. Buka `admin.html` → login → Gallery → masukkan judul dan URL gambar → Tambah foto.
4. Untuk foto profil, isi URL foto pada bagian Profil.
5. Jangan memasukkan screenshot penuh halaman sebagai foto gallery kecuali memang itu yang Anda inginkan. Foto asli menghasilkan tampilan lebih bagus.

## I. Tes final
- [ ] Home, Gallery, Songs, Contact bisa dibuka dari navbar.
- [ ] Foto profil dan gallery tampil.
- [ ] Admin Google yang terdaftar bisa login.
- [ ] Email Google lain ditolak.
- [ ] Profil dan lagu dapat ditambah/diedit sesuai fitur dashboard (versi ini menyediakan tambah dan hapus untuk Gallery/Songs; profil dapat diperbarui).
- [ ] Pesan Contact tersimpan pada tab Messages.
- [ ] Perubahan Google Sheets muncul di halaman publik.

## Catatan keamanan
Web app Apps Script berjalan dengan izin pemilik. Jangan simpan data sensitif pada tab yang dibaca publik. Verifikasi ID token dalam starter ini menggunakan endpoint Google `tokeninfo`, cocok untuk prototipe/pengujian; untuk sistem produksi yang menangani data sensitif, tingkatkan verifikasi token sesuai panduan resmi Google. Batasi `ADMIN_EMAILS` dan jangan menaruh Client Secret atau kredensial privat di JavaScript.

Saya tidak bisa membuat OAuth Client ID, mengakses Google Sheets, atau melakukan deploy ke akun Anda dari chat. Koneksi baru benar-benar aktif setelah Anda memasukkan nilai konfigurasi dan menyelesaikan tes di atas.
