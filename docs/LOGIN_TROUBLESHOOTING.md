# 🔐 Login Troubleshooting Guide

## ❌ Error: "Email atau password salah"

### Kemungkinan Penyebab:

#### 1. **Password Memang Salah**
- Gunakan password yang sama ketika create user
- Test credentials dari output `node scripts/list-users.js`:
  - Admin: `admin@ragel.io`
  - UPT: `uptmalang@ragel.io` atau `uptprobolinggo@ragel.io`

#### 2. **CORS / Domain Issue** (untuk Production)
Jika error hanya di Vercel, bukan di local:

**Solusi:**
1. Buka Appwrite Console: https://cloud.appwrite.io
2. Pilih project Anda
3. **Settings** → **Platforms**
4. Pastikan domain terdaftar:
   ```
   Name: Production
   Hostname: upt-reporting-app.vercel.app
   ```
5. Tunggu 1-2 menit untuk propagasi
6. Clear browser cache & cookies
7. Test lagi

#### 3. **Environment Variables Berbeda**
Local menggunakan `.env.local`, Vercel menggunakan environment variables di dashboard.

**Cek di Vercel:**
1. Buka: https://vercel.com/dashboard
2. Pilih project: upt-reporting-app
3. **Settings** → **Environment Variables**
4. Pastikan sama dengan local:
   ```
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=691af99f0027cd5bd83d
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=db_kinerja_upt
   NEXT_PUBLIC_APPWRITE_SUBMISSIONS_COLLECTION_ID=submissions
   ```

**⚠️ PENTING:** Setelah ubah env vars, **WAJIB REDEPLOY!**

#### 4. **Browser Console Error**
Buka DevTools (F12) → Console dan cek error:

**Kalau ada error CORS:**
```
Access to fetch at 'https://sgp.cloud.appwrite.io/v1/account/sessions/email' 
from origin 'https://upt-reporting-app.vercel.app' has been blocked by CORS policy
```
→ Domain belum terdaftar di Appwrite Platforms

**Kalau ada 401 Unauthorized:**
```
AppwriteException: Invalid credentials
```
→ Email/password salah ATAU project ID salah

**Kalau ada Network Error:**
```
Failed to fetch
```
→ Endpoint salah atau internet issue

---

## 🧪 Testing Steps

### Test di Local:
1. Stop dev server: `Ctrl+C`
2. Start lagi: `npm run dev`
3. Buka: http://localhost:3000/admin
4. Login dengan:
   - Email: `admin@ragel.io`
   - Password: [password yang Anda buat]
5. Buka Console (F12) dan lihat error (jika ada)

### Test di Production:
1. Clear browser cache & cookies (**PENTING!**)
2. Buka: https://upt-reporting-app.vercel.app/admin
3. Login dengan credentials yang sama
4. Buka Console (F12) dan lihat error

---

## 🔧 Quick Fixes

### Reset Password User (jika lupa):

```bash
# Jalankan script ini untuk reset password
node scripts/reset-password.js
```

### Create New Test User:

```bash
# Create user baru untuk testing
node scripts/create-users.js
```

### Check Current Users:

```bash
# List semua user
node scripts/list-users.js
```

---

## 📊 Expected Behavior

**✅ Login Berhasil:**
1. Input email + password
2. Klik "Masuk"
3. Loading spinner muncul
4. Redirect ke dashboard (/admin atau /upt)
5. Tidak ada error di Console

**❌ Login Gagal:**
1. Input email + password
2. Klik "Masuk"
3. Loading spinner muncul
4. Error message: "Email atau password salah"
5. Tetap di halaman login

---

## 🐛 Debug Mode

Untuk melihat error detail, buka `AuthContext.tsx` dan lihat console.error di line:

```typescript
} catch (error) {
  console.error('Login error:', error);  // <-- Lihat ini di Console
  throw error;
}
```

Error object akan show:
- `error.message`: Error message
- `error.code`: Error code (401, 404, etc)
- `error.type`: Error type dari Appwrite

---

## 💡 Common Solutions

| Symptom | Solution |
|---------|----------|
| Error di production, OK di local | Check domain di Appwrite Platforms |
| Error di keduanya | Check password atau run `list-users.js` |
| CORS error | Add domain to Appwrite Platforms |
| 401 Unauthorized | Check Project ID di env vars |
| Network error | Check endpoint URL |

---

**Users yang tersedia (dari `list-users.js`):**

1. **Admin:**
   - Email: `admin@ragel.io`
   - Role: admin
   
2. **UPT Malang:**
   - Email: `uptmalang@ragel.io`
   - Role: uptuser
   
3. **UPT Probolinggo:**
   - Email: `uptprobolinggo@ragel.io`
   - Role: uptuser

**Password:** Yang Anda set saat create user (hanya Anda yang tahu)
