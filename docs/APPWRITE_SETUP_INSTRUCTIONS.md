# Appwrite Setup: Instructions & Notifications System

## Overview
This document provides comprehensive setup instructions for implementing the **Admin-to-UPT Instructions** feature with notification system.

## Prerequisites
- Access to Appwrite Console (https://cloud.appwrite.io)
- Project: **upt-reporting-app**
- Database: **main**

---

## Part 1: Create `instructions` Collection

### Step 1: Create Collection
1. Navigate to **Databases** → **main**
2. Click **"+ Create Collection"**
3. Collection ID: `instructions`
4. Collection Name: `instructions`
5. Click **"Create"**

### Step 2: Add Attributes

#### Core Fields

**1. status** (String - REQUIRED)
- Attribute ID: `status`
- Type: String
- Size: 50
- Required: ✅ YES
- Array: ❌ NO
- Default: `DRAFT`

**2. indicator_type** (String - REQUIRED)
- Attribute ID: `indicator_type`
- Type: String
- Size: 100
- Required: ✅ YES
- Array: ❌ NO
- Default: `INFLUENCER DAN SMR`

**3. sub_category** (String - REQUIRED)
- Attribute ID: `sub_category`
- Type: String
- Size: 50
- Required: ✅ YES
- Array: ❌ NO

**4. target_type** (String - REQUIRED)
- Attribute ID: `target_type`
- Type: String  
- Size: 50
- Required: ✅ YES
- Array: ❌ NO

**5. target_upt** (String Array - OPTIONAL)
- Attribute ID: `target_upt`
- Type: String
- Size: 100
- Required: ❌ NO
- Array: ✅ YES (Array of strings)

**6. created_by_user** (String - REQUIRED)
- Attribute ID: `created_by_user`
- Type: String
- Size: 100
- Required: ✅ YES
- Array: ❌ NO

**7. created_by_name** (String - REQUIRED)
- Attribute ID: `created_by_name`
- Type: String
- Size: 255
- Required: ✅ YES
- Array: ❌ NO

**8. published_at** (DateTime - OPTIONAL)
- Attribute ID: `published_at`
- Type: DateTime
- Required: ❌ NO
- Array: ❌ NO

#### Content Fields

**9. nomor_konten** (String - REQUIRED)
- Attribute ID: `nomor_konten`
- Type: String
- Size: 255
- Required: ✅ YES
- Array: ❌ NO

**10. title** (String - REQUIRED)
- Attribute ID: `title`
- Type: String
- Size: 500
- Required: ✅ YES
- Array: ❌ NO

#### Instagram Fields (4 attributes)

**11. link_instagram_1**
- Type: String | Size: 500 | Required: ❌ NO

**12. username_instagram_1**
- Type: String | Size: 255 | Required: ❌ NO

**13. link_instagram_2**
- Type: String | Size: 500 | Required: ❌ NO

**14. username_instagram_2**
- Type: String | Size: 255 | Required: ❌ NO

#### Twitter/X Fields (4 attributes)

**15. link_twitter_1**
- Type: String | Size: 500 | Required: ❌ NO

**16. username_twitter_1**
- Type: String | Size: 255 | Required: ❌ NO

**17. link_twitter_2**
- Type: String | Size: 500 | Required: ❌ NO

**18. username_twitter_2**
- Type: String | Size: 255 | Required: ❌ NO

#### YouTube Fields (4 attributes)

**19. link_youtube_1**
- Type: String | Size: 500 | Required: ❌ NO

**20. username_youtube_1**
- Type: String | Size: 255 | Required: ❌ NO

**21. link_youtube_2**
- Type: String | Size: 500 | Required: ❌ NO

**22. username_youtube_2**
- Type: String | Size: 255 | Required: ❌ NO

#### TikTok Fields (2 attributes)

**23. link_tiktok**
- Type: String | Size: 500 | Required: ❌ NO

**24. username_tiktok**
- Type: String | Size: 255 | Required: ❌ NO

#### Facebook Fields (2 attributes)

**25. link_facebook**
- Type: String | Size: 500 | Required: ❌ NO

**26. username_facebook**
- Type: String | Size: 255 | Required: ❌ NO

**Total Attributes**: 26

---

## Part 2: Create `instruction_reads` Collection

### Step 1: Create Collection
1. Navigate to **Databases** → **main**
2. Click **"+ Create Collection"**
3. Collection ID: `instruction_reads`
4. Collection Name: `instruction_reads`
5. Click **"Create"**

### Step 2: Add Attributes

**1. instruction_id** (String - REQUIRED)
- Attribute ID: `instruction_id`
- Type: String
- Size: 100
- Required: ✅ YES
- Array: ❌ NO

**2. user_id** (String - REQUIRED)
- Attribute ID: `user_id`
- Type: String
- Size: 100
- Required: ✅ YES
- Array: ❌ NO

**3. upt_name** (String - REQUIRED)
- Attribute ID: `upt_name`
- Type: String
- Size: 100
- Required: ✅ YES
- Array: ❌ NO

**4. read_at** (DateTime - REQUIRED)
- Attribute ID: `read_at`
- Type: DateTime
- Required: ✅ YES
- Array: ❌ NO

**Total Attributes**: 4

---

## Part 3: Configure Permissions

### For `instructions` Collection

#### Read Permission (UPT Users can read published instructions)
1. Go to **Settings** tab in `instructions` collection
2. Scroll to **Permissions** section
3. Click **"+ Add Role"**
4. Select **"Any"** (all authenticated users)
5. Check: ✅ **Read**
6. Click **"Create"**

#### Write Permission (Only Admins)
Handled at document level when creating instructions.

### For `instruction_reads` Collection

#### Read Permission
1. Select **"Any"** role
2. Check: ✅ **Read**

#### Create Permission
1. Select **"Any"** role  
2. Check: ✅ **Create**

---

## Part 4: Create Indexes (Performance Optimization)

### For `instructions` Collection

**Index 1: status_published_at**
- Attribute: `status` (ASC)
- Attribute: `published_at` (DESC)
- Purpose: Fetch published instructions sorted by publish date

**Index 2: target_type**
- Attribute: `target_type` (ASC)
- Purpose: Filter by broadcast/specific target

**Index 3: sub_category**
- Attribute: `sub_category` (ASC)
- Purpose: Filter INFLUENCER vs SMR instructions

### For `instruction_reads` Collection

**Index 1: user_instruction**
- Attribute: `user_id` (ASC)
- Attribute: `instruction_id` (ASC)
- Type: Unique
- Purpose: Prevent duplicate reads, fast lookup

**Index 2: instruction_id**
- Attribute: `instruction_id` (ASC)
- Purpose: Count total reads per instruction

---

## Part 5: Testing

### Test Case 1: Create DRAFT Instruction (INFLUENCER)
```
Admin Dashboard → CREATE INSTRUCTION
- Sub-Category: INFLUENCER
- Target: All UPTs
- Nomor Konten: INF-TEST-001
- Title: Test Influencer Instruction  
- Link Instagram 1: https://www.instagram.com/test/
- Username Instagram 1: @test
- Link Twitter 1: https://twitter.com/test
- Username Twitter 1: @test
- Click: SAVE AS DRAFT
```
**Expected**: 
- ✅ Instruction created with status=DRAFT
- ✅ NOT visible in UPT dashboard (only PUBLISHED shown)

### Test Case 2: Publish Instruction
```
Admin Dashboard → Instructions Table
- Find DRAFT instruction
- Click: PUBLISH
```
**Expected**:
- ✅ Status changes to PUBLISHED
- ✅ published_at timestamp set
- ✅ Instruction now visible in ALL UPT dashboards

### Test Case 3: Broadcast vs Specific Target
```
Create Instruction:
- Target: Specific UPT
- Select: UPT Malang, UPT Surabaya
- Publish
```
**Expected**:
- ✅ Only UPT Malang and Surabaya see notification
- ✅ Other UPTs don't see this instruction

### Test Case 4: Mark as Read
```
UPT Dashboard → Bell Icon → Click instruction
- View instruction details
- Click: MARK AS READ
```
**Expected**:
- ✅ Document created in instruction_reads collection
- ✅ Badge counter decreases
- ✅ Instruction still visible but marked as read

### Test Case 5: SMR Instruction
```
Create Instruction:
- Sub-Category: SMR
- Target: All UPTs
- Fill: Instagram, Facebook, Twitter (1 each)
- Publish
```
**Expected**:
- ✅ SMR-specific fields populated
- ✅ Influencer-only fields (YouTube, TikTok, Instagram 2, Twitter 2) = NULL
- ✅ UPT sees SMR instruction

---

## Data Flow Diagram

```
┌──────────┐
│  ADMIN   │
└────┬─────┘
     │
     │ Creates Instruction
     ▼
┌─────────────────────┐
│  DRAFT INSTRUCTION  │  (status=DRAFT)
└─────────┬───────────┘
          │
          │ Admin clicks PUBLISH
          ▼
┌──────────────────────┐
│ PUBLISHED INSTRUCTION│  (status=PUBLISHED, published_at set)
└──────────┬───────────┘
           │
           │ Query by UPT Dashboard
           ▼
    ┌──────────────┐
    │ UPT SEES IT  │
    └──────┬───────┘
           │
           │ User clicks notification
           ▼
    ┌─────────────────────┐
    │ INSTRUCTION DETAIL  │
    └──────┬──────────────┘
           │
           │ User clicks "Mark as Read"
           ▼
    ┌──────────────────────┐
    │ instruction_reads    │  (user_id, instruction_id, read_at)
    └──────────────────────┘
```

---

## Query Examples

### Fetch Published Instructions for Specific UPT
```typescript
const response = await databases.listDocuments(
  APPWRITE_CONFIG.DATABASE_ID,
  APPWRITE_CONFIG.COLLECTIONS.INSTRUCTIONS,
  [
    Query.equal('status', 'PUBLISHED'),
    Query.or([
      Query.equal('target_type', 'ALL'),
      Query.contains('target_upt', currentUptName)
    ]),
    Query.orderDesc('published_at')
  ]
);
```

### Check if User Has Read Instruction
```typescript
const response = await databases.listDocuments(
  APPWRITE_CONFIG.DATABASE_ID,
  APPWRITE_CONFIG.COLLECTIONS.INSTRUCTION_READS,
  [
    Query.equal('user_id', userId),
    Query.equal('instruction_id', instructionId)
  ]
);

const hasRead = response.total > 0;
```

### Count Unread Instructions
```typescript
// Fetch all published instructions for user's UPT
const instructions = await fetchInstructionsForUPT(uptName);

// Fetch all read statuses for current user
const reads = await databases.listDocuments(
  APPWRITE_CONFIG.DATABASE_ID,
  APPWRITE_CONFIG.COLLECTIONS.INSTRUCTION_READS,
  [Query.equal('user_id', userId)]
);

const readIds = new Set(reads.documents.map(r => r.instruction_id));
const unreadCount = instructions.filter(i => !readIds.has(i.$id)).length;
```

---

## Rollback Plan

### Remove Collections
```
1. Delete instruction_reads collection
2. Delete instructions collection
3. Remove from constants.ts:
   - APPWRITE_CONFIG.COLLECTIONS.INSTRUCTIONS
   - APPWRITE_CONFIG.COLLECTIONS.INSTRUCTION_READS
4. Remove components:
   - CreateInstructionModal.tsx
5. Revert admin/page.tsx changes
6. Revert upt/page.tsx changes
```

---

## Security Considerations

### Permission Model

**Instructions Collection**:
- Read: Any authenticated user ✅
- Create: Admin only (document-level permissions)
- Update: Admin only (document-level permissions)
- Delete: Admin only (document-level permissions)

**Instruction Reads Collection**:
- Read: Any authenticated user ✅
- Create: Any authenticated user ✅ (users mark their own reads)
- Update: None ❌
- Delete: Admin only (cleanup)

### Validation

**Client-Side**:
- Sub-category required
- Target type required (ALL or SPECIFIC)
- If SPECIFIC: at least 1 UPT selected
- Nomor konten required
- Title min 5 characters
- At least 1 social media link filled

**Server-Side** (Appwrite):
- Required field enforcement via attribute settings
- String length limits via size constraints
- Array validation for target_upt

---

## Monitoring

### Metrics to Track
1. **Total Instructions Created**: Count of all instructions
2. **Published vs Draft Ratio**: Percentage of published instructions
3. **Read Rate**: Average % of UPTs who read each instruction
4. **Time to Read**: Average time between publish and first read
5. **Most Active Admin**: Admin who creates most instructions

### Queries for Analytics

**Total Published Instructions**:
```typescript
Query.equal('status', 'PUBLISHED')
```

**Instructions This Month**:
```typescript
Query.greaterThanEqual('$createdAt', firstDayOfMonth)
```

**Read Rate for Instruction**:
```typescript
// Total target UPTs
const targetCount = instruction.target_type === 'ALL' 
  ? 6  // Total UPTs
  : instruction.target_upt.length;

// Total reads
const reads = await databases.listDocuments(
  ...,
  [Query.equal('instruction_id', instructionId)]
);

const readRate = (reads.total / targetCount) * 100;
```

---

## Support

If you encounter issues:
1. Verify all 26 attributes in `instructions` collection
2. Verify all 4 attributes in `instruction_reads` collection
3. Check permissions (Any role has Read/Create)
4. Check indexes are created
5. Review browser console for errors
6. Check Appwrite logs in Console

---

**Last Updated**: November 2025  
**Related Files**:
- `src/types/index.ts` (Instruction interfaces)
- `src/lib/constants.ts` (Collection names, status enums)
- `src/components/CreateInstructionModal.tsx` (Admin form)
- `src/app/admin/page.tsx` (Admin dashboard)
- `src/app/upt/page.tsx` (UPT notifications - to be implemented)
