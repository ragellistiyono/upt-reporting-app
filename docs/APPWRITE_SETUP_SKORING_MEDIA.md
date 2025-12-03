# 📝 Appwrite Setup Guide - Skoring Media Massa dan Media Sosial

## 🎯 **Tujuan**
Menambahkan support untuk indicator type baru "SKORING MEDIA MASSA DAN MEDIA SOSIAL" dengan field khusus untuk skor media massa dan media sosial.

---

## ⚙️ **Setting di Appwrite Console**

### **1. Login ke Appwrite Console**
- Buka: https://cloud.appwrite.io/console
- Login dengan akun Anda
- Pilih project: **UPT Reporting System**

### **2. Navigate ke Database Collection**
1. Di sidebar kiri, klik **"Databases"**
2. Pilih database: **`db_kinerja_upt`**
3. Klik collection: **`submissions`**
4. Klik tab **"Attributes"**

### **3. Tambahkan Attribute Baru**

Anda perlu menambahkan **2 (dua) attribute baru** untuk menyimpan skor media:

---

#### **Attribute 1: skor_media_massa**

**Klik tombol "Add Attribute" → Pilih "Number"** lalu isi:

| Field | Value |
|-------|-------|
| **Attribute ID** | `skor_media_massa` |
| **Attribute Type** | `Double` (Floating Point) |
| **Size** | 16 |
| **Required** | ❌ **NO** (tidak wajib) |
| **Array** | ❌ **NO** |
| **Default Value** | (kosongkan) |
| **Min Value** | 0 |
| **Max Value** | (kosongkan atau 999999999) |

**Klik "Create"**

---

#### **Attribute 2: skor_media_sosial**

**Klik tombol "Add Attribute" → Pilih "Number"** lalu isi:

| Field | Value |
|-------|-------|
| **Attribute ID** | `skor_media_sosial` |
| **Attribute Type** | `Double` (Floating Point) |
| **Size** | 16 |
| **Required** | ❌ **NO** (tidak wajib) |
| **Array** | ❌ **NO** |
| **Default Value** | (kosongkan) |
| **Min Value** | 0 |
| **Max Value** | (kosongkan atau 999999999) |

**Klik "Create"**

---

### **4. Update Existing Attributes (Optional but Recommended)**

Karena field `title`, `narasi`, dan `documentation_link` sekarang **tidak wajib** untuk indicator type "SKORING MEDIA", pastikan attribute-nya di-set sebagai **NOT REQUIRED**:

#### **Update Attribute: title**
1. Cari attribute `title` di list
2. Klik icon **⚙️ (Settings)**
3. Ubah **"Required"** menjadi **❌ NO**
4. Klik **"Update"**

#### **Update Attribute: narasi**
1. Cari attribute `narasi` di list
2. Klik icon **⚙️ (Settings)**
3. Ubah **"Required"** menjadi **❌ NO**
4. Klik **"Update"**

#### **Update Attribute: documentation_link**
1. Cari attribute `documentation_link` di list
2. Klik icon **⚙️ (Settings)**
3. Ubah **"Required"** menjadi **❌ NO**
4. Klik **"Update"**

---

## ✅ **Verification**

Setelah selesai setting, pastikan attribute list Anda memiliki field berikut:

| Attribute ID | Type | Required | Notes |
|--------------|------|----------|-------|
| `indicator_type` | String | ✅ YES | Existing |
| `sub_category` | String | ❌ NO | Existing |
| `submitted_by_upt` | String | ✅ YES | Existing |
| `submission_date` | DateTime | ✅ YES | Existing |
| `submitted_by_user` | String | ✅ YES | Existing |
| `title` | String | ❌ NO | **Updated** |
| `narasi` | String | ❌ NO | **Updated** |
| `documentation_link` | String | ❌ NO | **Updated** |
| `skor_media_massa` | Double | ❌ NO | **🆕 NEW** |
| `skor_media_sosial` | Double | ❌ NO | **🆕 NEW** |

---

## 🧪 **Testing**

Setelah setup Appwrite selesai, test fitur baru:

### **Test Case 1: Submit Skor Media Massa**
1. Login sebagai UPT user
2. Klik "NEW SUBMISSION"
3. Pilih **"INDICATOR_TYPE"** = `SKORING MEDIA MASSA DAN MEDIA SOSIAL`
4. Pilih **"SUB_CATEGORY"** = `MEDIA MASSA`
5. Isi **"SUBMISSION_DATE"** = (tanggal hari ini)
6. Isi **"SKOR_MEDIA_MASSA"** = `570000`
7. Klik **"SUBMIT REPORT"**
8. ✅ Harus berhasil dan redirect ke dashboard

### **Test Case 2: Submit Skor Media Sosial**
1. Login sebagai UPT user
2. Klik "NEW SUBMISSION"
3. Pilih **"INDICATOR_TYPE"** = `SKORING MEDIA MASSA DAN MEDIA SOSIAL`
4. Pilih **"SUB_CATEGORY"** = `MEDIA SOSIAL`
5. Isi **"SUBMISSION_DATE"** = (tanggal hari ini)
6. Isi **"SKOR_MEDIA_SOSIAL"** = `5000`
7. Klik **"SUBMIT REPORT"**
8. ✅ Harus berhasil dan redirect ke dashboard

### **Test Case 3: Verify Dashboard Display**
1. Setelah submit, cek **UPT Dashboard** (`/upt`)
2. Di card **"MY SUBMISSIONS"**
3. Pastikan ada indicator: **"skoring media massa dan media sosial"**
4. Pastikan count-nya bertambah sesuai submission yang dibuat

---

## 📊 **Data Structure**

### **Example Document - Media Massa**
```json
{
  "$id": "unique_id_123",
  "indicator_type": "SKORING MEDIA MASSA DAN MEDIA SOSIAL",
  "sub_category": "MEDIA MASSA",
  "submitted_by_upt": "UPT Malang",
  "submission_date": "2025-11-18T10:00:00.000Z",
  "submitted_by_user": "user_id_456",
  "skor_media_massa": 570000,
  "skor_media_sosial": null,
  "title": null,
  "narasi": null,
  "documentation_link": null
}
```

### **Example Document - Media Sosial**
```json
{
  "$id": "unique_id_789",
  "indicator_type": "SKORING MEDIA MASSA DAN MEDIA SOSIAL",
  "sub_category": "MEDIA SOSIAL",
  "submitted_by_upt": "UPT Surabaya",
  "submission_date": "2025-11-18T10:30:00.000Z",
  "submitted_by_user": "user_id_101",
  "skor_media_massa": null,
  "skor_media_sosial": 5000,
  "title": null,
  "narasi": null,
  "documentation_link": null
}
```

---

## 🚨 **Important Notes**

1. **Attribute Order**: Tidak masalah urutan attribute di Appwrite, yang penting semua attribute ada
2. **Data Type**: Pastikan `skor_media_massa` dan `skor_media_sosial` menggunakan type **Double**, bukan Integer
3. **Min Value**: Set min value 0 agar tidak bisa input nilai negatif
4. **Null Values**: Field yang tidak terpakai akan otomatis di-set `null` oleh aplikasi
5. **Backward Compatibility**: Submission lama (sebelum fitur ini) akan tetap berfungsi karena field baru optional

---

## 🔧 **Rollback Plan**

Jika ada masalah dan ingin rollback:

1. **Hapus attribute baru**:
   - Delete `skor_media_massa`
   - Delete `skor_media_sosial`

2. **Kembalikan attribute lama jadi required**:
   - Set `title` required = YES
   - Set `narasi` required = YES
   - Set `documentation_link` required = YES

3. **Rollback code**:
   ```bash
   cd /home/ragel/Documents/projek-web-pak-dharma/upt-reporting-app
   git checkout main  # atau commit sebelumnya
   ```

---

## ✅ **Checklist Setup**

- [ ] Login ke Appwrite Console
- [ ] Navigate ke database `db_kinerja_upt` → collection `submissions`
- [ ] Tambah attribute `skor_media_massa` (type: Double, required: NO)
- [ ] Tambah attribute `skor_media_sosial` (type: Double, required: NO)
- [ ] Update attribute `title` → required: NO
- [ ] Update attribute `narasi` → required: NO
- [ ] Update attribute `documentation_link` → required: NO
- [ ] Test submit Media Massa
- [ ] Test submit Media Sosial
- [ ] Verify dashboard menampilkan indicator baru
- [ ] Check data di Appwrite Console → Documents

---

**Setup selesai!** 🎉 Fitur "SKORING MEDIA MASSA DAN MEDIA SOSIAL" siap digunakan.
