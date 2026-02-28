# Appwrite User Setup Guide

## Overview

Panduan ini menjelaskan cara membuat/mengupdate 7 user (6 UPT + 1 Admin) di Appwrite untuk sistem UPT Reporting.

Login menggunakan **username** (bukan email). Sistem secara internal memetakan username ke email dengan domain `@digitalcommtrack.com`.

---

## Daftar User

| No | Username | Password | Nama | Role | UPT Name | Email Internal |
|----|----------|----------|------|------|----------|----------------|
| 1 | uptbali | commuptbali123 | UPT Bali | uptuser | UPT Bali | uptbali@digitalcommtrack.com |
| 2 | uptprobolinggo | commuptpblg123 | UPT Probolinggo | uptuser | UPT Probolinggo | uptprobolinggo@digitalcommtrack.com |
| 3 | uptmalang | commuptmlg123 | UPT Malang | uptuser | UPT Malang | uptmalang@digitalcommtrack.com |
| 4 | uptsurabaya | commuptsby123 | UPT Surabaya | uptuser | UPT Surabaya | uptsurabaya@digitalcommtrack.com |
| 5 | uptgresik | commuptgrk123 | UPT Gresik | uptuser | UPT Gresik | uptgresik@digitalcommtrack.com |
| 6 | uptmadiun | commuptmdn123 | UPT Madiun | uptuser | UPT Madiun | uptmadiun@digitalcommtrack.com |
| 7 | adminjbm | admincommjbm | Admin JBM | admin | - | adminjbm@digitalcommtrack.com |

---

## Opsi 1: Setup Otomatis (Script)

### Prasyarat

1. Install dependency:
   ```bash
   npm install node-appwrite dotenv
   ```

2. Buat file `.env.local` di root project:
   ```env
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=<project-id-anda>
   APPWRITE_API_KEY=<api-key-anda>
   ```

   API Key harus memiliki scope: **users.read** dan **users.write**

### Jalankan Script

```bash
node scripts/setup-users.js
```

Atau menggunakan helper:

```bash
bash scripts/run-with-env.sh node scripts/setup-users.js
```

Script akan:
- Membuat user baru jika belum ada
- Mengupdate password, labels, dan preferences jika user sudah ada
- Memverifikasi email secara otomatis

---

## Opsi 2: Setup Manual via Appwrite Console

### Langkah 1: Login ke Appwrite Console

1. Buka https://cloud.appwrite.io/console
2. Login dan pilih project **UPT Reporting System**

### Langkah 2: Hapus/Update User Lama (jika ada)

User lama yang perlu ditangani:
- `admin@ragel.io` - Hapus atau nonaktifkan
- `uptmalang@ragel.io` - Hapus (akan dibuat ulang dengan email baru)
- `uptprobolinggo@ragel.io` - Hapus (akan dibuat ulang dengan email baru)

Cara hapus user:
1. Klik **Auth** di sidebar
2. Cari user yang ingin dihapus
3. Klik user tersebut
4. Klik **Delete** di bagian bawah

### Langkah 3: Buat User Baru

Untuk **setiap user** di tabel di atas:

1. Klik **Auth** di sidebar kiri
2. Klik **+ Create User**
3. Isi form:
   - **User ID**: (biarkan auto-generate)
   - **Name**: sesuai kolom "Nama" di tabel
   - **Email**: sesuai kolom "Email Internal" di tabel
   - **Password**: sesuai kolom "Password" di tabel
4. Klik **Create**

### Langkah 4: Set Labels

Setelah user dibuat, set label untuk menentukan role:

1. Klik user yang baru dibuat
2. Scroll ke bagian **Labels**
3. Tambahkan label:
   - Untuk UPT user: tambah label `uptuser`
   - Untuk Admin: tambah label `admin`
4. Klik **Update**

### Langkah 5: Set Preferences (UPT Users)

Untuk setiap **UPT user** (bukan admin):

1. Klik user yang baru dibuat
2. Scroll ke bagian **Preferences**
3. Klik **Edit**
4. Tambahkan JSON:
   ```json
   {
     "upt_name": "UPT Bali"
   }
   ```
   (ganti dengan nama UPT yang sesuai)
5. Klik **Update**

### Langkah 6: Verifikasi Email

1. Klik user yang baru dibuat
2. Di bagian **Email**, toggle **Verified** menjadi aktif

---

## Langkah Tambahan: Appwrite Schema

### Tambah Atribut untuk TikTok 2

Di collection `submissions` (database `db_kinerja_upt`), tambahkan 2 atribut baru:

1. **link_tiktok_2**
   - Type: String
   - Size: 2000
   - Required: NO

2. **username_tiktok_2**
   - Type: String
   - Size: 255
   - Required: NO

---

## Verifikasi

Setelah setup selesai, test login:

1. Buka halaman login aplikasi
2. Masukkan username (contoh: `uptbali`)
3. Masukkan password (contoh: `commuptbali123`)
4. Klik **Masuk**
5. Pastikan berhasil redirect ke dashboard UPT

Ulangi untuk admin:
1. Username: `adminjbm`
2. Password: `admincommjbm`
3. Harus redirect ke dashboard Admin
