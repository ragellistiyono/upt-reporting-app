## Plan: Seed Data Semester 1 2026 + Modifikasi Dashboard Media Sosial

**TL;DR**: Ada 2 bagian pekerjaan: (1) **Modifikasi kode dashboard** agar realisasi Media Sosial dihitung dari SUM `skor_media_sosial` (bukan count dokumen), dan (2) **Membuat script Node.js** untuk seed submission documents ke Appwrite — **per UPT** masing-masing 15 Siaran Pers, 18 Konten Medsos, 3 Media Massa, ~5 Media Sosial (total skor 2500/UPT), dan 3 Video In-Change. Total 44 dokumen × 6 UPT = **264 dokumen**. Script menggunakan Appwrite Server SDK + API Key yang sudah ada di [.env.local](.env.local).

> **Catatan penting**: Semua angka Target dan Filled di bawah adalah **per UPT**. Setiap UPT mendapat target & filled yang sama.

---

**Steps**

### Bagian A: Modifikasi Kode Dashboard (Media Sosial = SUM skor)

1. **Modifikasi [src/app/upt/page.tsx](src/app/upt/page.tsx)**
   - Di `indicatorCounts` useMemo ([baris ~217](src/app/upt/page.tsx#L217)): ubah logika `ind3b` (Media Sosial) dari `counts[cfg.key]++` menjadi `counts[cfg.key] += (sub.skor_media_sosial || 0)` — hanya untuk `cfg.key === 'ind3b'`, indikator lain tetap `++`
   - Di `chartDataByIndicator` useMemo ([baris ~233](src/app/upt/page.tsx#L233)): sama, ubah realisasi ind3b dari `.length` menjadi SUM `skor_media_sosial`

2. **Modifikasi [src/app/admin/page.tsx](src/app/admin/page.tsx)**
   - Di `chartData` useMemo ([baris ~262](src/app/admin/page.tsx#L262)): ubah logika Media Sosial (`cfg.key === 'ind3b'`) dari `.length` menjadi SUM `skor_media_sosial` dari filtered submissions    
   - Pastikan `totalRealisasi` masih konsisten (sudah otomatis karena membaca dari `chartData`)

### Bagian B: Script Seed Data

3. **Buat file `scripts/seed-semester1-2026.js`** — script Node.js yang:
   - Load `.env.local` (pakai `dotenv`)
   - Init Appwrite Server SDK (`node-appwrite`) dengan API Key
   - List semua users via `Users.list()` → mapping `upt_name` → `user.$id`
   - Untuk **setiap 6 UPT** (UPT Malang, Probolinggo, Surabaya, Madiun, Bali, Gresik), insert submission documents ke collection `submissions`:

   | Indikator | Filled per UPT | Target per UPT | `indicator_type` | `sub_category` | Field utama |
   |-----------|:--------------:|:--------------:|-------------------|-----------------|-------------|
   | Publikasi Siaran Pers | **15** | 30 | `PUBLIKASI SIARAN PERS` | `null` | `title`, `narasi`, `documentation_link` |
   | Produksi Konten Medsos | **18** | 36 | `PRODUKSI KONTEN MEDIA SOSIAL UNIT` | `null` | `title`, `narasi`, `documentation_link` |
   | Media Massa | **3** | 6 | `SKORING MEDIA MASSA DAN MEDIA SOSIAL` | `MEDIA MASSA` | `title`, `link_publikasi`, `nama_media` |
   | Media Sosial | **~5 dok** (total skor **2500**) | 5000 | `SKORING MEDIA MASSA DAN MEDIA SOSIAL` | `MEDIA SOSIAL` | `skor_media_sosial` (5×500=2500) |
   | Video In-Change | **3** | 6 | `KONTEN VIDEO IN-CHANGE` | `null` | `title`, `link_media` |

   - **Total per UPT**: 44 dokumen → **Total semua 6 UPT**: 264 dokumen
   - Submission dates: di-spread secara random antara **1 Jan 2026 – 30 Jun 2026**
   - Dummy data: judul berupa `"Laporan [Indikator] #N - [UPT]"` dll
   - Untuk **Media Sosial**: `file_id = null` (tidak upload file), `skor_media_sosial` dibagi 5 submission × 500 skor = **2500 per UPT**. Ini best practice karena tidak perlu generate dummy Excel files — yang penting skor tercatat

4. **Script juga verifikasi targets** — sebelum seed, cek apakah target dokumen sudah ada di collection `targets` untuk year=2026, semester=1. Jika belum ada, buat sesuai konfigurasi (masing-masing di-set **per UPT**, jadi 6 dokumen per indikator):

   | Indikator (target type) | `target_value` **per UPT** | Total dokumen target |
   |------------------------|:------------------------:|:--------------------:|
   | `PUBLIKASI SIARAN PERS` | 30 | 6 (1 × 6 UPT) |
   | `PRODUKSI KONTEN MEDIA SOSIAL UNIT` | 36 | 6 |
   | `SKORING MEDIA MASSA` | 6 | 6 |
   | `SKORING MEDIA SOSIAL` | 5000 | 6 |
   | `KONTEN VIDEO IN-CHANGE` | 6 | 6 |

   Total: 30 target documents (5 indikator × 6 UPT)

5. **Jalankan script**: `node scripts/seed-semester1-2026.js`

---

**Verification**

- Jalankan `node scripts/seed-semester1-2026.js` → harus sukses tanpa error
- Login sebagai admin → Dashboard admin menunjukkan rekap per UPT dengan bar chart terisi, semua 6 UPT memiliki data yang sama
- Login sebagai **setiap UPT user** (UPT Malang, Probolinggo, dll) → Di "Laporan Saya" masing-masing menampilkan:
  - Siaran Pers: **15/30 (50%)**
  - Konten Medsos: **18/36 (50%)**
  - Media Massa: **3/6 (50%)**
  - Media Sosial: **2500/5000 (50%)** ← butuh modifikasi kode (Bagian A)
  - Video In-Change: **3/6 (50%)**
- Filter bulan di dashboard UPT → submission tersebar di Jan-Jun 2026

**Decisions**
- **Media Sosial realisasi = SUM(skor_media_sosial)**: Dipilih modifikasi kode karena target 5000 jelas merujuk ke skor kumulatif, bukan jumlah dokumen. Setiap submission Media Sosial mengupload Excel yang menghasilkan skor — dashboard harus menampilkan total skor.
- **Media Sosial seed tanpa file upload**: Set `file_id = null` karena hanya butuh data skor di database. Fitur download file di data table admin akan menampilkan "—" untuk entry ini — acceptable untuk data seeding.
- **5 submission Media Sosial per UPT (à 500 skor)**: Angka realistis — setara 5 bulan upload (1×/bulan selama semester). Total skor per UPT = 2500.
- **Semua UPT identik**: Setiap UPT mendapat target dan filled yang sama persis, sehingga dashboard semua UPT menunjukkan 50% capaian secara seragam.