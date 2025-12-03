# 📊 UPT Reporting System - PLN Indonesia

Sistem Pelaporan Kinerja Unit Pelaksana Teknis PLN Indonesia.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Appwrite (BaaS)
- **Hosting**: Vercel

## 📋 Features

- ✅ Login dengan role-based access (Admin & UPT User)
- ✅ Dashboard Admin dengan filter dan export Excel
- ✅ Dashboard UPT dengan submission history
- ✅ Form entry untuk 5 indikator kinerja
- ✅ Sistem instruksi dari Admin ke UPT
- ✅ Target management per UPT

## 🔐 Environment Variables

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=db_kinerja_upt
NEXT_PUBLIC_APPWRITE_SUBMISSIONS_COLLECTION_ID=submissions
```

## 📁 Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # Reusable React components
├── contexts/      # React Context providers
├── lib/           # Utility functions and configurations
└── types/         # TypeScript type definitions
```

## 📚 Documentation

Dokumentasi lengkap tersedia di folder `docs/`.

## 📄 License

© 2025 PLN Indonesia. All Rights Reserved.
