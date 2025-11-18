# 📊 UPT Reporting System - Internal Web Application

A Next.js-based internal web application for PLN to centralize UPT (Unit Pelaksana Teknis) performance indicator reporting. Replaces manual WhatsApp/Spreadsheet workflows with a structured form-based system with role-based access control.

## 🎯 Project Overview

This application provides:
- **Form-based data entry** for 5 performance indicators
- **Admin dashboard** with filtering and Excel export
- **UPT user dashboard** showing only their own submissions
- **Role-based access control** (Admin vs UPT User)
- **Centralized data storage** using Appwrite backend

## 🏗️ Tech Stack

- **Frontend Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Backend/Database**: Appwrite (BaaS)
- **Authentication**: Appwrite Auth with Email/Password
- **Deployment**: Vercel (recommended) or any Node.js hosting

## 📋 Features

### For UPT Users
- ✅ Login with credentials
- ✅ View personal submission history
- ✅ Submit new performance indicator reports via form
- ✅ Auto-populate UPT name from user profile

### For Admin Users
- ✅ Login with admin credentials
- ✅ View all submissions from all UPTs
- ✅ Filter by UPT, indicator type, and date range
- ✅ Export filtered data to Excel
- ✅ Full CRUD access to all submissions

### Performance Indicators
1. PUBLIKASI SIARAN PERS
2. PRODUKSI KONTEN
3. INFLUENCER DAN SMR (with sub-categories: INFLUENCER, SMR)
4. KONTEN IN-CHANGE
5. KONTEN WAG

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Appwrite Account** (free at [cloud.appwrite.io](https://cloud.appwrite.io))

### 1. Clone and Install

```bash
cd /home/ragel/Documents/projek-web-pak-dharma/upt-reporting-app
npm install
```

### 2. Set Up Appwrite Project

#### A. Create Appwrite Project
1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Click **Create Project**
3. Name it: `UPT Reporting System`
4. Copy your **Project ID**

#### B. Enable Authentication
1. Go to **Auth** → **Settings**
2. Ensure **Email/Password** is enabled

#### C. Generate API Key
1. Go to **Overview** → **Integrations** → **API Keys**
2. Click **Create API Key**
3. Name: `Setup Script`
4. Scopes: Select:
   - ✅ `databases.*` (all database permissions)
   - ✅ `collections.*` (all collection permissions)
   - ✅ `attributes.*` (all attribute permissions)
   - ✅ `users.read` (optional, for user management)
   - ✅ `users.write` (optional, for user management)
5. **Copy the API Key** (you won't see it again!)

### 3. Configure Environment Variables

Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
```

For the setup script, also create `.env` or set these temporarily:

```bash
export APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
export APPWRITE_PROJECT_ID=your_project_id
export APPWRITE_API_KEY=your_api_key
```

### 4. Run Database Setup Script

```bash
node scripts/setup-appwrite.js
```

This will:
- ✅ Create database: `db_kinerja_upt`
- ✅ Create collection: `submissions`
- ✅ Create 8 attributes (indicator_type, sub_category, title, etc.)

### 5. Configure Permissions

⚠️ **IMPORTANT**: Follow the detailed instructions in [PERMISSIONS.md](./PERMISSIONS.md)

Quick summary:
1. Enable **Document Security** on the `submissions` collection
2. Set collection permissions using **Labels** (alphanumeric only, no underscores):
   - Read: `label:admin`
   - Create: `label:uptuser`
   - Update: `label:admin`
   - Delete: `label:admin`

### 6. Create Users

#### Create Admin User:
1. **Appwrite Console** → **Auth** → **Users** → **Create User**
2. Email: `admin@pln.com`, Password: (secure password)
3. After creation → **Labels** tab → Add: `admin`

#### Create UPT Users:
1. **Create User**: `upt.malang@pln.com`
2. **Labels** tab → Add: `uptuser` (alphanumeric only, no underscores)
3. **Prefs** tab → Add JSON:
   ```json
   {
     "upt_name": "UPT Malang"
   }
   ```

Repeat for all UPTs:
- UPT Probolinggo
- UPT Surabaya
- UPT Madiun
- UPT Bali
- UPT Gresik

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
upt-reporting-app/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx            # Root layout with AuthProvider ✅
│   │   ├── page.tsx              # Home page with smart routing ✅
│   │   ├── globals.css           # Cyberpunk theme & Tailwind ✅
│   │   ├── login/
│   │   │   └── page.tsx          # Cyberpunk login page ✅
│   │   ├── admin/
│   │   │   └── page.tsx          # Admin dashboard (pink theme) ✅
│   │   └── upt/
│   │       └── page.tsx          # UPT dashboard (green theme) ✅
│   ├── contexts/
│   │   └── AuthContext.tsx       # Auth state management ✅
│   ├── lib/
│   │   ├── appwrite.ts           # Appwrite client config ✅
│   │   └── constants.ts          # App-wide constants ✅
│   └── types/
│       └── index.ts              # TypeScript type definitions ✅
├── scripts/
│   ├── setup-appwrite.js         # Database setup script ✅
│   ├── create-users.js           # User creation script ✅
│   └── test-connection.js        # Appwrite connection test ✅
├── middleware.ts                 # Route protection & auth ✅
├── PERMISSIONS.md                # Permissions guide ✅
├── SETUP_GUIDE.md                # Complete setup instructions ✅
├── STAGE1_COMPLETE.md            # Stage 1 implementation docs ✅
├── CYBERPUNK_GUIDE.md            # Visual design system guide ✅
├── PROJECT_SUMMARY.md            # Project overview ✅
├── QUICKSTART.md                 # Quick start guide ✅
├── CHECKLIST.md                  # Development checklist ✅
├── .env.local.example            # Environment template ✅
├── .env.local                    # Next.js environment vars
├── .env                          # Scripts environment vars
└── README.md                     # This file ✅
```

## 🔒 Security & Permissions

This app uses a multi-layered security model:

1. **Authentication**: Email/password via Appwrite Auth
2. **User Labels**: `admin` or `uptuser` roles (alphanumeric only)
3. **Collection Permissions**: Control create/read/update/delete at collection level
4. **Document Permissions**: Each submission has permissions set to:
   - Admin can read all
   - Creator can read their own
   - Only admin can update/delete

See [PERMISSIONS.md](./PERMISSIONS.md) for complete details.

## 📊 Database Schema

### Collection: `submissions`

| Field                | Type     | Required | Description                          |
|---------------------|----------|----------|--------------------------------------|
| indicator_type      | String   | Yes      | Type of performance indicator        |
| sub_category        | String   | No       | INFLUENCER or SMR (if applicable)    |
| submitted_by_upt    | String   | Yes      | UPT name (e.g., "UPT Malang")       |
| submission_date     | DateTime | Yes      | Date of submission                   |
| title               | String   | Yes      | Report title                         |
| narasi              | String   | Yes      | Narrative/description (max 5000)     |
| documentation_link  | String   | Yes      | URL to supporting documentation      |
| submitted_by_user   | String   | Yes      | Appwrite User ID (for permissions)   |

## 🧪 Testing Checklist

- [ ] Admin can login
- [ ] UPT user can login
- [ ] UPT user can create submission
- [ ] UPT user sees only their submissions
- [ ] Admin sees all submissions
- [ ] Admin can filter submissions
- [ ] Admin can export to Excel
- [ ] Form validation works
- [ ] Date picker works
- [ ] Sub-category appears for "INFLUENCER DAN SMR"

## 🚢 Deployment

### Deploying to Vercel

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com) → Import Project
3. Select your repository
4. Add environment variables:
   - `NEXT_PUBLIC_APPWRITE_ENDPOINT`
   - `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
5. Deploy!

### Deploying to Other Platforms

Works on any platform supporting Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🛠️ Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🤝 Contributing

This is an internal PLN project. For changes:

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit for review

## 📞 Support

For issues or questions:
- Check [PERMISSIONS.md](./PERMISSIONS.md) for permission issues
- Review [Appwrite Docs](https://appwrite.io/docs)
- Contact the development team

## 📄 License

Internal PLN Project - Proprietary

---

**Built with ❤️ for PLN UPT Performance Tracking**
