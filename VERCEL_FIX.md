# 🚨 QUICK FIX: Login Redirect Issue di Vercel

## Problem
Setelah login di https://upt-reporting-app.vercel.app, tidak redirect ke halaman admin/upt.

## Root Cause
1. ❌ Middleware tidak detect cookie Appwrite dengan benar di production
2. ❌ Login page tidak handle parameter `?redirect=` dari URL
3. ❌ Domain Vercel mungkin belum terdaftar di Appwrite Console

## ✅ Fixes Applied

### 1. Middleware Cookie Detection (FIXED)
**File:** `middleware.ts`
- Sekarang support multiple cookie name patterns
- Fallback ke cookie apapun yang dimulai dengan `a_session`

### 2. Login Redirect Handling (FIXED)
**File:** `src/app/login/page.tsx`
- Sekarang baca parameter `?redirect=` dari URL
- Redirect ke halaman yang diminta setelah login sukses
- Tambah `router.refresh()` untuk force middleware re-check

## 🔧 Manual Steps Required

### Step 1: Pastikan Domain Terdaftar di Appwrite

1. Buka: https://cloud.appwrite.io
2. Pilih project Anda
3. **Settings** → **Platforms** → **Add Platform** → **Web App**
4. Tambahkan:
   ```
   Name: Production - Vercel
   Hostname: upt-reporting-app.vercel.app
   ```
5. (Optional) Tambahkan juga: `*.vercel.app` untuk preview deployments

### Step 2: Verifikasi Environment Variables di Vercel

1. Buka Vercel Dashboard
2. Pilih project: `upt-reporting-app`
3. **Settings** → **Environment Variables**
4. Pastikan ada:
   ```
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=[your_project_id]
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=db_kinerja_upt
   NEXT_PUBLIC_APPWRITE_SUBMISSIONS_COLLECTION_ID=submissions
   ```

### Step 3: Redeploy

Karena code sudah diperbaiki:

```bash
# Commit changes
git add .
git commit -m "fix: middleware cookie detection and login redirect handling for Vercel"

# Push ke GitHub (akan trigger auto-deploy di Vercel)
git push origin main
```

### Step 4: Test di Production

Setelah deploy selesai:

1. **Clear browser cache & cookies** (penting!)
2. Buka: https://upt-reporting-app.vercel.app/admin
3. Akan redirect ke: https://upt-reporting-app.vercel.app/login?redirect=%2Fadmin
4. Login dengan credentials
5. **Harus** redirect ke: https://upt-reporting-app.vercel.app/admin ✅

## 🐛 Jika Masih Bermasalah

### Debug Checklist

1. **Cek Cookie di Browser:**
   - F12 → Application → Cookies
   - Cari cookie `a_session_*`
   - Pastikan ada setelah login

2. **Cek Browser Console:**
   - F12 → Console
   - Lihat error (jika ada)

3. **Cek Network Tab:**
   - F12 → Network
   - Filter: `account`
   - Lihat response dari Appwrite API

4. **Cek Vercel Logs:**
   - Vercel Dashboard → Deployments
   - Klik deployment terakhir
   - Lihat Runtime Logs

### Common Errors

**Error: 401 Unauthorized**
→ Domain belum terdaftar di Appwrite Platforms

**Error: CORS**
→ Domain belum terdaftar atau typo di hostname

**Error: Session not found**
→ Cookie tidak di-set atau domain tidak match

## 📚 Full Documentation

Lihat file `VERCEL_DEPLOYMENT_GUIDE.md` untuk dokumentasi lengkap.

---

**Changes made:**
- ✅ `middleware.ts` - Improved cookie detection
- ✅ `src/app/login/page.tsx` - Added redirect parameter handling
- ✅ `VERCEL_DEPLOYMENT_GUIDE.md` - Complete troubleshooting guide
- ✅ `scripts/test-appwrite-connection.js` - Connection test script
