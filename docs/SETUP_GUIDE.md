# 📖 Manual Appwrite Console Configuration Guide

This guide provides step-by-step instructions for configuring your Appwrite project via the Appwrite Console UI.

## 🎯 Overview

While the setup script (`scripts/setup-appwrite.js`) creates the database structure, some configurations **must** be done manually via the Appwrite Console:

1. ✅ Authentication settings
2. ✅ Collection permissions
3. ✅ User creation and role assignment
4. ✅ Platform configuration (web app domain)

---

## 1️⃣ Create Appwrite Project

1. Go to [https://cloud.appwrite.io](https://cloud.appwrite.io)
2. Sign up or log in
3. Click **Create Project**
4. **Project Name**: `UPT Reporting System`
5. Click **Create**
6. **Copy your Project ID** - you'll need this for `.env.local`

---

## 2️⃣ Configure Platform (Web App)

1. In your project, go to **Overview** → **Platforms**
2. Click **Add Platform** → **Web App**
3. **Name**: `UPT Reporting Web App`
4. **Hostname**: 
   - For local dev: `localhost`
   - For production: your actual domain (e.g., `upt-reports.pln.com`)
5. Click **Next**

> 💡 **Tip**: You can add multiple platforms (localhost + production domain)

---

## 3️⃣ Enable Email/Password Authentication

1. Go to **Auth** → **Settings**
2. Scroll to **Auth Methods**
3. Find **Email/Password**
4. Toggle it **ON** (if not already)
5. Optional configurations:
   - **Password Length**: Minimum 8 characters (recommended)
   - **Password Complexity**: Enable if you want stronger passwords
   - **Email Verification**: Enable if you want users to verify emails
   - **Personal Data**: Disable if you don't want to check for user data in passwords

---

## 4️⃣ Generate API Key (for setup scripts)

1. Go to **Overview** → **Integrations** → **API Keys**
2. Click **Create API Key**
3. **Name**: `Setup and Admin Scripts`
4. **Expiration**: Never (or set a date)
5. **Scopes**: Select these:
   ```
   ✅ databases.read
   ✅ databases.write
   ✅ collections.read
   ✅ collections.write
   ✅ attributes.read
   ✅ attributes.write
   ✅ documents.read
   ✅ documents.write
   ✅ users.read
   ✅ users.write
   ```
6. Click **Create**
7. **IMPORTANT**: Copy the API key immediately (you won't see it again!)
8. Save it securely - you'll use it with the setup scripts

---

## 5️⃣ Run Database Setup Script

Before continuing, run the database setup script:

```bash
export APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
export APPWRITE_PROJECT_ID=your_project_id_here
export APPWRITE_API_KEY=your_api_key_here

node scripts/setup-appwrite.js
```

This creates:
- Database: `db_kinerja_upt`
- Collection: `submissions`
- All necessary attributes

---

## 6️⃣ Configure Collection Permissions

### A. Enable Document Security

1. Go to **Databases** → `db_kinerja_upt` → `submissions`
2. Click the **Settings** tab
3. Scroll to **Security**
4. Find **Document Security**
5. Toggle it **ON** ✅

> ⚠️ **Critical**: Document security MUST be enabled for the permission model to work correctly!

### B. Set Collection-Level Permissions

Still in the `submissions` collection **Settings** tab:

1. Scroll to **Permissions** section
2. Configure each permission type:

#### **Read Permission**
- Click **+ Add role** under "Read access"
- Select **Label** from dropdown
- Enter: `admin`
- Click **Add**
- Result: Only users with the `admin` label can read all documents

#### **Create Permission**
- Click **+ Add role** under "Create access"
- Select **Label**
- Enter: `uptuser`
- Click **Add**
- Result: Only users with the `uptuser` label can create new documents

#### **Update Permission**
- Click **+ Add role** under "Update access"
- Select **Label**
- Enter: `admin`
- Click **Add**
- Result: Only admins can update documents

#### **Delete Permission**
- Click **+ Add role** under "Delete access"
- Select **Label**
- Enter: `admin`
- Click **Add**
- Result: Only admins can delete documents

### Final Permissions Summary:
```
Read:   label:admin
Create: label:uptuser
Update: label:admin
Delete: label:admin
```

---

## 7️⃣ Create Users

### Option A: Manual Creation via Console

#### Create Admin User

1. Go to **Auth** → **Users**
2. Click **Create user** (top right)
3. Fill in:
   - **Email**: `admin@pln.com` (or your preferred admin email)
   - **Password**: (create a strong password)
   - **Name**: `Admin User` (optional)
4. Click **Create**
5. Click on the newly created user
6. Go to **Labels** tab
7. Type `admin` and press Enter
8. The label `admin` should now appear

#### Create UPT User (Example: UPT Malang)

1. Go to **Auth** → **Users**
2. Click **Create user**
3. Fill in:
   - **Email**: `upt.malang@pln.com`
   - **Password**: (create a password)
   - **Name**: `UPT Malang User` (optional)
4. Click **Create**
5. Click on the newly created user
6. Go to **Labels** tab
7. Type `uptuser` and press Enter

8. Go to **Prefs** tab
9. Click **Add preference** or paste this JSON:
   ```json
   {
     "upt_name": "UPT Malang"
   }
   ```
10. Click **Update**

**Repeat for all UPTs:**
- UPT Malang → `upt.malang@pln.com` → prefs: `{"upt_name": "UPT Malang"}`
- UPT Probolinggo → `upt.probolinggo@pln.com` → prefs: `{"upt_name": "UPT Probolinggo"}`
- UPT Surabaya → `upt.surabaya@pln.com` → prefs: `{"upt_name": "UPT Surabaya"}`
- UPT Madiun → `upt.madiun@pln.com` → prefs: `{"upt_name": "UPT Madiun"}`
- UPT Bali → `upt.bali@pln.com` → prefs: `{"upt_name": "UPT Bali"}`
- UPT Gresik → `upt.gresik@pln.com` → prefs: `{"upt_name": "UPT Gresik"}`

### Option B: Automated Creation via Script

Use the user creation script:

```bash
export APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
export APPWRITE_PROJECT_ID=your_project_id_here
export APPWRITE_API_KEY=your_api_key_here

node scripts/create-users.js
```

Then follow the interactive prompts.

---

## 8️⃣ Verify Configuration

### Test Database Access

1. Go to **Databases** → `db_kinerja_upt` → `submissions`
2. You should see all attributes:
   - ✅ indicator_type (String)
   - ✅ sub_category (String)
   - ✅ submitted_by_upt (String)
   - ✅ submission_date (DateTime)
   - ✅ title (String)
   - ✅ narasi (String)
   - ✅ documentation_link (String)
   - ✅ submitted_by_user (String)

### Test Permissions

1. Check **Settings** → **Permissions**:
   ```
   Read: label:admin
   Create: label:uptuser
   Update: label:admin
   Delete: label:admin
   ```

2. **Document Security**: Should be **Enabled**

### Test Users

1. Go to **Auth** → **Users**
2. You should see:
   - At least 1 user with label `admin`
   - At least 1 user with label `uptuser`
3. Click on a UPT user → **Prefs** tab should show `upt_name`

---

## 9️⃣ Optional: Configure Email Templates

If you enabled email verification:

1. Go to **Auth** → **Templates**
2. Customize email templates:
   - Verification Email
   - Password Recovery
   - Magic URL
3. Add your branding/logo if desired

---

## 🔟 Update Environment Variables

In your Next.js project, update `.env.local`:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_actual_project_id_here
```

---

## ✅ Configuration Complete!

You can now:

1. ✅ Run the development server: `npm run dev`
2. ✅ Test login with admin credentials
3. ✅ Test login with UPT user credentials
4. ✅ Begin developing the UI components

---

## 🔍 Troubleshooting

### "User not authorized" errors
- ✅ Check that users have the correct **labels** (`admin` or `uptuser`)
- ✅ Verify **collection permissions** are set correctly
- ✅ Ensure **Document Security** is enabled

### "Missing permissions" errors
- ✅ Check collection-level permissions in Settings tab
- ✅ Verify your API key has the necessary scopes
- ✅ Ensure you're using the correct Project ID

### Email/Password login not working
- ✅ Verify Email/Password auth is **enabled** in Auth → Settings
- ✅ Check that the user exists in Auth → Users
- ✅ Confirm the password is correct

### Document creation fails
- ✅ User must have `uptuser` label
- ✅ Collection must have **Create** permission for `label:uptuser`
- ✅ Check that all required attributes are provided

---

## 📚 Related Documentation

- [PERMISSIONS.md](./PERMISSIONS.md) - Detailed permissions explanation
- [README.md](./README.md) - Project setup and overview
- [Appwrite Permissions Docs](https://appwrite.io/docs/advanced/platform/permissions)
- [Appwrite Labels Docs](https://appwrite.io/docs/products/auth/labels)

---

**Configuration complete! Ready to build the app! 🚀**
