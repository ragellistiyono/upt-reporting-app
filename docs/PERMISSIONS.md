# 🔐 Appwrite Permissions Configuration Guide

This document provides step-by-step instructions for configuring permissions in your Appwrite project for the UPT Reporting System.

## Overview

The permissions system ensures that:
- **Admin users** can view all submissions from all UPTs
- **UPT users** can only view their own submissions
- **UPT users** can create new submissions
- Only **Admins** can update or delete submissions

## Important Concepts

### 1. User Roles
We use custom user attributes to define roles:
- `role`: Either `admin` or `uptuser`
- `upt_name`: The UPT name (e.g., "UPT Malang", "UPT Probolinggo") - only for UPT users

### 2. Collection-Level vs Document-Level Permissions
- **Collection-Level**: Controls who can create, read, update, delete ANY document
- **Document-Level**: Controls permissions for INDIVIDUAL documents

### 3. Permission Types
- `read`: View data
- `create`: Add new documents
- `update`: Modify existing documents
- `delete`: Remove documents

## 📋 Step-by-Step Configuration

### A. Enable Email/Password Authentication

1. Go to **Appwrite Console** → Your Project → **Auth** → **Settings**
2. Ensure **Email/Password** is enabled
3. Optional: Configure email verification settings

### B. Add Custom User Attributes

⚠️ **IMPORTANT**: Custom user attributes cannot be added programmatically. You MUST use the Appwrite Console.

Unfortunately, **Appwrite does not currently support custom attributes on the built-in User Auth model** through the Console UI either. 

**Recommended Solutions:**

#### Option 1: Use User Labels (Recommended for Role)
1. Go to **Auth** → **Users** → Select a user
2. Add labels: `admin` or `uptuser` (Note: Labels only allow alphanumeric characters, no underscores)
3. Use `Role.label('admin')` and `Role.label('uptuser')` for permissions

#### Option 2: Use User Preferences (For UPT Name)
1. Store `upt_name` in user preferences
2. Access via `account.getPrefs()`

#### Option 3: Create a Separate Users Collection (Most Flexible)
Create a `user_profiles` collection with:
- `user_id` (String, relationship to auth user)
- `role` (Enum: `admin`, `uptuser`)
- `upt_name` (String)
- `email` (String)

**We'll use Option 1 + Option 2 for this project:**
- **Labels** for role (`admin`, `uptuser`)
- **Preferences** for UPT name

### C. Configure Collection Permissions

1. Go to **Databases** → `db_kinerja_upt` → `submissions` collection
2. Click on the **Settings** tab
3. Ensure **Document Security** is **ENABLED** ✅

4. Set **Collection-Level Permissions**:

   ```
   Read:     Role: Label (admin)
   Create:   Role: Label (uptuser)
   Update:   Role: Label (admin)
   Delete:   Role: Label (admin)
   ```

   **How to add these in the Console:**
   - Click **+ Add Role** under the permission type
   - Select **Label** from the dropdown
   - Enter the label name (e.g., `admin` or `uptuser`) - only alphanumeric, no underscores
   - Click **Add**

### D. Configure Document-Level Permissions (In Code)

When creating a new submission document, the code must set permissions like this:

```javascript
import { databases, ID, Permission, Role } from '@/lib/appwrite';

// Get the current user ID
const user = await account.get();
const userId = user.$id;

// Create submission with proper permissions
const submission = await databases.createDocument(
    'db_kinerja_upt',
    'submissions',
    ID.unique(),
    {
        indicator_type: 'PUBLIKASI SIARAN PERS',
        submitted_by_upt: 'UPT Probolinggo',
        submitted_by_user: userId,
        submission_date: new Date().toISOString(),
        title: 'Example Title',
        narasi: 'Example narration',
        documentation_link: 'https://example.com',
        // ... other fields
    },
    [
        // Admins can read all submissions
        Permission.read(Role.label('admin')),
        
        // The creator can read their own submission
        Permission.read(Role.user(userId)),
        
        // Only admins can update
        Permission.update(Role.label('admin')),
        
        // Only admins can delete
        Permission.delete(Role.label('admin'))
    ]
);
```

## 🧪 Testing Permissions

### Test Case 1: Admin User
1. Create a user with label `admin`
2. Login as this user
3. Should see **all** submissions from all UPTs
4. Should be able to **update** and **delete** submissions

### Test Case 2: UPT User
1. Create a user with label `uptuser`
2. Set preferences with `upt_name`: "UPT Malang"
3. Create a submission as this user
4. Should see **only their own** submissions
5. Should **NOT** be able to update or delete any submissions

### Test Case 3: UPT User Cannot See Other UPT Data
1. Login as UPT User A
2. Create a submission
3. Login as UPT User B
4. Should **NOT** see UPT User A's submission

## 📝 Creating Users via Console

### Create Admin User
1. Go to **Auth** → **Users** → **Create User**
2. Fill in email and password
3. After creation, click on the user
4. Go to **Labels** tab → Add label: `admin`

### Create UPT User
1. Go to **Auth** → **Users** → **Create User**
2. Fill in email (e.g., `upt.malang@pln.com`) and password
3. After creation, click on the user
4. Go to **Labels** tab → Add label: `uptuser`
5. Go to **Prefs** tab → Add preference:
   ```json
   {
     "upt_name": "UPT Malang"
   }
   ```

## 🔧 Programmatic User Creation (Optional)

You can also create users via the Server SDK:

```javascript
const sdk = require('node-appwrite');

const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const users = new sdk.Users(client);

// Create Admin User
const admin = await users.create(
    sdk.ID.unique(),
    'admin@pln.com',
    undefined, // phone (optional)
    'SecurePassword123!',
    'Admin User'
);

// Add admin label
await users.updateLabels(admin.$id, ['admin']);

// Create UPT User
const uptUser = await users.create(
    sdk.ID.unique(),
    'upt.malang@pln.com',
    undefined,
    'SecurePassword123!',
    'UPT Malang User'
);

// Add uptuser label
await users.updateLabels(uptUser.$id, ['uptuser']);

// Set UPT name in preferences
await users.updatePrefs(uptUser.$id, {
    upt_name: 'UPT Malang'
});
```

## ⚠️ Common Pitfalls

1. **Forgetting Document Security**: Always enable Document Security on the collection
2. **Missing Labels**: Users must have the correct label (`admin` or `uptuser`)
3. **Label Format**: Labels only support alphanumeric characters (no underscores or special characters)
4. **Missing Permissions in Code**: When creating documents, always include the permission array
5. **Using Wrong Role Type**: Use `Role.label('admin')` not `Role.role('admin')`

## 🔍 Debugging Permissions

If a user can't access data:

1. Check user labels in **Auth** → **Users** → [User] → **Labels**
2. Verify label format is alphanumeric only (no underscores)
3. Check collection settings: **Databases** → **Collections** → **Settings**
4. Check document permissions in **Databases** → **Collections** → **Documents** → Click document → **Permissions** tab
5. Check browser console for permission errors
6. Verify `submitted_by_user` field matches the user's ID

## 📚 Additional Resources

- [Appwrite Permissions Documentation](https://appwrite.io/docs/advanced/platform/permissions)
- [Appwrite Labels Documentation](https://appwrite.io/docs/products/auth/labels)
- [Appwrite Security Best Practices](https://appwrite.io/docs/advanced/security)
