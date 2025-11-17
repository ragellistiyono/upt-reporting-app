# 🚀 Quick Start Guide

Get your UPT Reporting System up and running in 10 minutes!

## Prerequisites

- Node.js 18+ installed
- Appwrite account (free at [cloud.appwrite.io](https://cloud.appwrite.io))

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd upt-reporting-app
npm install
```

### 2. Create Appwrite Project

1. Go to https://cloud.appwrite.io
2. Create a new project: "UPT Reporting System"
3. Copy your **Project ID**

### 3. Generate API Key

1. In Appwrite Console: **Overview** → **Integrations** → **API Keys**
2. Create API Key with scopes:
   - `databases.*`
   - `collections.*`
   - `attributes.*`
   - `users.*`
3. **Copy the API key!**

### 4. Configure Environment

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local with your values
# Replace with your actual Project ID
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
```

### 5. Set up Database

```bash
# Set these environment variables temporarily
export APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
export APPWRITE_PROJECT_ID=your_project_id_here
export APPWRITE_API_KEY=your_api_key_here

# Run the setup script
node scripts/setup-appwrite.js
```

Expected output:
```
✓ Database created: Kinerja UPT
✓ Collection created: Indicator Submissions
✓ Created: indicator_type
✓ Created: sub_category
... (all 8 attributes)
✅ Setup completed successfully!
```

### 6. Configure Permissions in Appwrite Console

1. **Databases** → `db_kinerja_upt` → `submissions` → **Settings**
2. Enable **Document Security** ✅
3. Set permissions:
   - **Read**: Add role → Label → `admin`
   - **Create**: Add role → Label → `uptuser` (alphanumeric only)
   - **Update**: Add role → Label → `admin`
   - **Delete**: Add role → Label → `admin`

### 7. Create Users

#### Option A: Use the Script (Recommended)

```bash
node scripts/create-users.js
```

Select option 3 to create all users at once!

#### Option B: Manual Creation

**Create Admin:**
1. **Auth** → **Users** → **Create user**
2. Email: `admin@pln.com`, Password: (your choice)
3. Click user → **Labels** → Add: `admin`

**Create UPT User (example):**
1. **Auth** → **Users** → **Create user**
2. Email: `upt.malang@pln.com`, Password: (your choice)
3. Click user → **Labels** → Add: `uptuser` (no underscores allowed)
4. **Prefs** → Add: `{"upt_name": "UPT Malang"}`

### 8. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🧪 Test Your Setup

### Test 1: Admin Login
1. Login with `admin@pln.com`
2. Should see admin dashboard
3. Should be able to view all submissions

### Test 2: UPT User Login
1. Login with `upt.malang@pln.com`
2. Should see UPT user dashboard
3. Should only see own submissions
4. Should be able to create new submission

## 📋 Default Test Users

After running the batch user creation script, you'll have:

| Email | Password | Role | UPT Name |
|-------|----------|------|----------|
| admin@pln.com | (your choice) | admin | - |
| upt.malang@pln.com | (your choice) | uptuser | UPT Malang |
| upt.probolinggo@pln.com | (your choice) | uptuser | UPT Probolinggo |
| upt.surabaya@pln.com | (your choice) | uptuser | UPT Surabaya |
| upt.madiun@pln.com | (your choice) | uptuser | UPT Madiun |
| upt.bali@pln.com | (your choice) | uptuser | UPT Bali |
| upt.gresik@pln.com | (your choice) | uptuser | UPT Gresik |

## ⚠️ Troubleshooting

### "Missing environment variables"
- Check that `.env.local` exists and has your Project ID
- Restart the dev server after changing `.env.local`

### "Permission denied" errors
- Verify Document Security is enabled
- Check user has correct label (`admin` or `uptuser`, alphanumeric only)
- Verify collection permissions are set

### "Cannot find module 'node-appwrite'"
- Run `npm install` to install all dependencies

### Setup script fails
- Check your API key has the right scopes
- Verify your Project ID is correct
- Make sure you've exported the environment variables

## 📚 Need More Help?

- [Full Setup Guide](./SETUP_GUIDE.md) - Detailed step-by-step instructions
- [Permissions Guide](./PERMISSIONS.md) - Understanding the permission model
- [README](./README.md) - Complete project documentation

## ✅ You're Ready!

Your UPT Reporting System is now set up and ready for development! 🎉

**Next steps:**
1. Build the login UI
2. Create the submission form
3. Build the dashboard
4. Add filtering and export features
