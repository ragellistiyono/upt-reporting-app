# 🚀 Vercel Deployment Guide

## Masalah yang Sudah Diperbaiki

### ❌ Problem: Login redirect tidak bekerja di Vercel
**Gejala:** Setelah login, tetap di halaman login (loop redirect)

**Penyebab:**
1. **Cookie detection di middleware** tidak handle variasi cookie name Appwrite di production
2. **Login page** tidak membaca parameter `?redirect=` dari URL
3. **Session cookie name** berbeda antara local dan production

**Solusi yang sudah diterapkan:**
- ✅ Middleware sekarang detect multiple cookie patterns
- ✅ Login page sekarang handle redirect parameter
- ✅ Tambah `router.refresh()` untuk force re-evaluation middleware

---

## ⚙️ Setup Appwrite untuk Vercel

### 1. **Tambahkan Domain Vercel ke Appwrite Console**

Di Appwrite Cloud Console (https://cloud.appwrite.io):

1. Pilih project Anda
2. Pergi ke **Settings** → **Platforms**
3. Klik **Add Platform** → **Web App**
4. Isi:
   - **Name:** `Production - Vercel`
   - **Hostname:** `upt-reporting-app.vercel.app` (tanpa https://)
   - **Hostname (alternative):** `*.vercel.app` (untuk preview deployments)
5. Klik **Next** dan **Create**

### 2. **Environment Variables di Vercel**

Pastikan environment variables sudah diset di Vercel Dashboard:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=db_kinerja_upt
NEXT_PUBLIC_APPWRITE_SUBMISSIONS_COLLECTION_ID=submissions
```

**Cara set di Vercel:**
1. Buka project di Vercel Dashboard
2. Pergi ke **Settings** → **Environment Variables**
3. Tambahkan semua variable di atas
4. Pastikan di-apply ke **Production**, **Preview**, dan **Development**

### 3. **CORS Configuration di Appwrite**

Appwrite otomatis handle CORS untuk platform yang didaftarkan, tapi pastikan:

- ✅ Domain Vercel sudah terdaftar di Platforms
- ✅ Tidak ada typo di hostname
- ✅ Untuk custom domain, tambahkan juga custom domain ke platforms

---

## 🔍 Debugging Tips

### Cek Cookie di Browser

1. Buka DevTools (F12)
2. Tab **Application** → **Cookies**
3. Cari cookie yang dimulai dengan `a_session`
4. Pastikan:
   - Cookie ada setelah login
   - Domain-nya benar (`.vercel.app` atau domain custom)
   - HttpOnly = true
   - Secure = true (untuk HTTPS)

### Cek Middleware Logs

Di Vercel, middleware tidak log ke console secara default. Untuk debug:

```typescript
// Temporary: Tambahkan di middleware.ts
console.log('Auth check:', {
  pathname,
  hasSession: !!sessionCookie,
  cookieName: sessionCookie?.name
});
```

Lalu cek logs di Vercel Dashboard → **Deployments** → [Your deployment] → **Functions** → **Edge Middleware**

### Test Flow Lengkap

1. **Logout** (jika sudah login)
2. **Clear browser cache & cookies**
3. **Akses protected route:** `https://upt-reporting-app.vercel.app/admin`
4. **Harus redirect ke:** `https://upt-reporting-app.vercel.app/login?redirect=%2Fadmin`
5. **Login dengan credentials**
6. **Harus redirect ke:** `https://upt-reporting-app.vercel.app/admin`

---

## 🐛 Common Issues & Solutions

### Issue 1: "Invalid credentials" padahal password benar
**Penyebab:** Appwrite session expired atau CORS issue

**Solusi:**
```bash
# Clear browser storage
1. F12 → Application → Storage → Clear site data
2. Coba login lagi
```

### Issue 2: Redirect loop di halaman home (/)
**Penyebab:** Role detection gagal di AuthContext

**Solusi:**
- Cek label user di Appwrite Console
- Pastikan user punya label `admin` atau `uptuser`
- Cek Console browser untuk error dari AuthContext

### Issue 3: 401 Unauthorized di production
**Penyebab:** Domain tidak terdaftar di Appwrite

**Solusi:**
1. Buka Appwrite Console
2. Settings → Platforms
3. Pastikan domain Vercel terdaftar
4. Tunggu 1-2 menit untuk propagasi
5. Hard refresh browser (Ctrl+Shift+R)

### Issue 4: Environment variables tidak terbaca
**Penyebab:** Prefix `NEXT_PUBLIC_` missing atau belum redeploy

**Solusi:**
1. Pastikan semua env var untuk client-side punya prefix `NEXT_PUBLIC_`
2. Setelah ubah env var di Vercel, **WAJIB REDEPLOY**
3. Vercel Dashboard → Deployments → [...] → Redeploy

---

## 📋 Checklist Deployment

Sebelum deploy ke production:

- [ ] ✅ Semua environment variables sudah diset di Vercel
- [ ] ✅ Domain Vercel sudah ditambahkan ke Appwrite Platforms
- [ ] ✅ Test login di local dulu (`npm run dev`)
- [ ] ✅ Build success di local (`npm run build`)
- [ ] ✅ Commit & push ke GitHub
- [ ] ✅ Deploy ke Vercel
- [ ] ✅ Test login di production URL
- [ ] ✅ Test redirect dari protected route
- [ ] ✅ Test logout
- [ ] ✅ Test dengan user admin dan UPT

---

## 🔄 Flow Authentication

```
User mencoba akses /admin
  ↓
Middleware check cookie
  ↓
Cookie tidak ada → redirect ke /login?redirect=/admin
  ↓
User input email + password → klik "Masuk"
  ↓
AuthContext.login() → Appwrite createEmailPasswordSession
  ↓
Login berhasil → cookie "a_session_xxx" dibuat
  ↓
Router.push(redirect || '/') → ke /admin
  ↓
Router.refresh() → middleware re-check
  ↓
Middleware check cookie → cookie ADA ✅
  ↓
Middleware allow request → pass ke page
  ↓
/admin page render → AuthContext check role
  ↓
Role = admin ✅ → tampilkan admin dashboard
```

---

## 📞 Support

Jika masih ada masalah:

1. **Check Vercel Function Logs:** Deployment → Functions
2. **Check Browser Console:** F12 → Console untuk error JavaScript
3. **Check Network Tab:** F12 → Network untuk API calls yang gagal
4. **Check Appwrite Logs:** Appwrite Console → Overview → Logs

---

**Last Updated:** December 3, 2025
