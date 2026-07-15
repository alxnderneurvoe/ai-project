# Device Handover System

## Ringkasan
Proyek ini adalah aplikasi internal berbasis PHP untuk mengelola inventaris perangkat, transaksi serah terima (handover), dan riwayat penggunaan. Aplikasi menggunakan session login sederhana, tampilan dashboard, formulir handover dinamis, dan API PHP yang terhubung dengan webhook n8n.

## Struktur Proyek

- `index.html` : Halaman landing yang langsung melakukan redirect ke `login.php`.
- `login.php` : Halaman login dengan kredensial hardcoded.
- `logout.php` : Menghancurkan sesi dan mengembalikan pengguna ke login.
- `dashboard.php` : Halaman utama yang menampilkan statistik perangkat dan daftar inventaris.
- `handover.php` : Formulir serah terima perangkat (handover) yang dinamis.
- `history.php` : Halaman riwayat transaksi handover.
- `auth.php` : Middleware session sederhana untuk memproteksi halaman internal.
- `config/webhook.php` : Konfigurasi URL webhook untuk n8n.
- `templates/header.php` : Header HTML bersama untuk halaman internal.
- `templates/footer.php` : Footer HTML bersama.
- `assets/style.css` : Gaya tampilan aplikasi.
- `assets/files/` : Logika JavaScript front-end.
- `api/` : Endpoints API PHP untuk data device, history, dan submit.

## Requirement

- PHP 8.x atau lebih tinggi
- Web server seperti Apache (XAMPP)
- n8n untuk menerima dan memproses webhook
- Browser modern dengan dukungan JavaScript

## Konfigurasi

1. Pastikan aplikasi dijalankan di environment lokal di `d:\xampp\htdocs\ai-project`.
2. Update endpoint webhook di `config/webhook.php` jika n8n berjalan di host atau port berbeda.

Contoh konfigurasi default:

```php
define('WEBHOOK_UPDATE', 'http://localhost:5678/webhook/update-handover');
define('WEBHOOK_DEVICE', 'http://localhost:5678/webhook/get-device');
define('WEBHOOK_HISTORY', 'http://localhost:5678/webhook/get-history');
define('WEBHOOK_ASSIGNED', 'http://localhost:5678/webhook/get-device-assigned');
```

## Cara Menjalankan

1. Jalankan Apache dan PHP di XAMPP.
2. Letakkan folder project di dalam `htdocs`.
3. Akses `http://localhost/ai-project/index.html`.
4. Masuk dengan kredensial default:

> Catatan: aplikasi kini menggunakan SQLite lokal untuk autentikasi, dengan akun default dibuat otomatis di `data/app.db` saat pertama kali login. Untuk penggunaan produksi, ganti password default dan tambahkan manajemen pengguna yang lebih lengkap.

## Halaman dan Fungsionalitas

### `index.html`
- Redirect otomatis ke `login.php`.
- Menampilkan animasi loading singkat jika redirect gagal.

### `login.php`
- Menjalankan `session_start()`.
- Memeriksa kredensial `admin/admin123`.
- Menetapkan `$_SESSION['login']` dan `$_SESSION['username']` jika valid.
- Mengarahkan ke `dashboard.php` setelah login.

### `dashboard.php`
- Mewajibkan login dengan `auth.php`.
- Menampilkan statistik jumlah perangkat.
- Tabel inventaris perangkat.
- Data diambil dari API `api/devices.php` melalui JavaScript front-end.

### `handover.php`
- Mewajibkan login dengan `auth.php`.
- Form dinamis untuk transaksi handover.
- Opsi keterangan transaksi:
  - `New Employee`
  - `Replacing-Lama`
  - `Replacing-Baru`
  - `Exit Clearance`
  - `Service`
  - `Done Service`
- UI menampilkan bidang yang berbeda berdasarkan pilihan transaksi.
- Mengirim data ke `api/submit.php`.

### `history.php`
- Mewajibkan login dengan `auth.php`.
- Menampilkan tabel riwayat handover.
- Data diambil dari API `api/history.php`.

### `logout.php`
- Menghancurkan sesi dengan `session_destroy()`.
- Redirect kembali ke login.

## API Endpoints

### `api/devices.php`
- Method: GET
- Mengambil data device dari webhook `WEBHOOK_DEVICE`.
- Mengembalikan JSON.
- Digunakan oleh `assets/files/devices.js` untuk mengisi daftar inventaris dan dropdown.

### `api/history.php`
- Method: GET
- Mengambil riwayat transaksi dari webhook `WEBHOOK_HISTORY`.
- Mengembalikan JSON.
- Digunakan oleh `assets/history.js`.

### `api/submit.php`
- Method: POST
- Menerima: `keterangan`, `name`, `sn`, `division`.
- Validasi sederhana untuk field wajib.
- Mengirim payload ke webhook `WEBHOOK_UPDATE`.
- Mengembalikan JSON status sukses/gagal.

## Front-end JavaScript

### `assets/files/devices.js`
- Mengambil daftar perangkat dari `api/devices.php`.
- Menyaring entri perangkat valid.
- Menyimpan data di variabel global `allDevices`.

### `assets/files/populate.js`
- Mengisi elemen select `snSelect` dan `nameSelect` berdasarkan status perangkat.
- Menentukan daftar perangkat `Available`, `Assigned`, dan `Service`.

### `assets/files/form.js`
- Menangani perubahan pilihan `keterangan`.
- Menyesuaikan tampilan input `name` dan `sn`.
- Mengisi otomatis `division`, `laptop`, `brand`, dan `spesifikasi`.

### `assets/files/submit.js`
- Mengumpulkan data form dan memvalidasi pada sisi klien.
- Mengirim request POST ke `api/submit.php`.
- Menampilkan pesan feedback dengan `showFeedback`.

### `assets/files/main.js`
- Inisialisasi event listener saat DOM siap.
- Memanggil `initializeDevices()`.
- Menghubungkan event form submit.

### `assets/files/ui.js`
- Menyediakan helper UI untuk menampilkan alert.
- Fungsi `escapeHTML` untuk keamanan tampilan.

## Template Bersama

- `templates/header.php` : Menyisipkan tag HTML umum, CSS, dan navbar.
- `templates/footer.php` : Menutup container dan memuat skrip Bootstrap.

## Role dan Hak Akses

Ada tiga level role yang tersedia:

- `admin` : akses penuh ke semua halaman dan fungsi.
- `user` : akses ke dashboard, handover, dan history.
- `viewer` : akses hanya ke dashboard dan history.

Role disimpan di session sebagai `user_role` setelah login. Akun admin default dibuat otomatis di database SQLite lokal.

## Integrasi Webhook n8n

Sistem ini tidak menyimpan data langsung di database lokal. Sebagai gantinya, `api/*.php` memanggil endpoint n8n yang kemudian mengolah dan menyimpan data.

Webhook utama:
- `WEBHOOK_UPDATE` : menerima payload handover.
- `WEBHOOK_DEVICE` : mengembalikan inventaris perangkat.
- `WEBHOOK_HISTORY` : mengembalikan log histori.
- `WEBHOOK_ASSIGNED` : belum dipanggil langsung dalam kode front-end saat ini, tetapi tersedia di konfigurasi.

## Catatan Tambahan

- `auth.php` melindungi halaman internal; setiap halaman internal harus meng-include `auth.php`.
- `login.php` menggunakan kredensial statis; disarankan mengganti dengan sistem login berbasis database atau LDAP.
- `api/submit.php` saat ini mengandalkan validasi minimal.
- `assets/files/` memuat semua logika form client-side yang diperlukan untuk interaksi dinamis.
- `api/test-hit api.csv` adalah file sample untuk pengujian API.

## Pengembangan Lebih Lanjut

- Tambahkan autentikasi pengguna dinamis.
- Buat model database untuk menyimpan perangkat, user, dan handover.
- Tambahkan fitur pencarian dan filter di dashboard.
- Berikan validasi input sisi server yang lebih ketat.
- Tambahkan dokumentasi n8n flow jika tersedia.
