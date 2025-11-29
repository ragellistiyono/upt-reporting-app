# Appwrite Setup: Influencer & SMR Social Media Fields

## Overview
This document provides step-by-step instructions to add new attributes to the `submissions` collection in Appwrite Console for tracking **INFLUENCER** and **SMR** social media accounts.

## Prerequisites
- Access to Appwrite Console (https://cloud.appwrite.io)
- Project: **upt-reporting-app**
- Database: **main**
- Collection: **submissions**

---

## Attributes to Add

### 1. NOMOR KONTEN (Content Number)
- **Attribute Name**: `nomor_konten`
- **Type**: String
- **Size**: 255
- **Required**: ❌ NO
- **Array**: ❌ NO
- **Default**: (leave empty)

### 2. INSTAGRAM FIELDS (2 pairs for Influencer, 1 pair for SMR)

#### Instagram Account 1
- **Attribute Name**: `link_instagram_1`
- **Type**: String
- **Size**: 500
- **Required**: ❌ NO
- **Array**: ❌ NO

- **Attribute Name**: `username_instagram_1`
- **Type**: String
- **Size**: 255
- **Required**: ❌ NO
- **Array**: ❌ NO

#### Instagram Account 2 (Influencer only)
- **Attribute Name**: `link_instagram_2`
- **Type**: String
- **Size**: 500
- **Required**: ❌ NO
- **Array**: ❌ NO

- **Attribute Name**: `username_instagram_2`
- **Type**: String
- **Size**: 255
- **Required**: ❌ NO
- **Array**: ❌ NO

### 3. TWITTER/X FIELDS (2 pairs for Influencer, 1 pair for SMR)

#### Twitter Account 1
- **Attribute Name**: `link_twitter_1`
- **Type**: String
- **Size**: 500
- **Required**: ❌ NO
- **Array**: ❌ NO

- **Attribute Name**: `username_twitter_1`
- **Type**: String
- **Size**: 255
- **Required**: ❌ NO
- **Array**: ❌ NO

#### Twitter Account 2 (Influencer only)
- **Attribute Name**: `link_twitter_2`
- **Type**: String
- **Size**: 500
- **Required**: ❌ NO
- **Array**: ❌ NO

- **Attribute Name**: `username_twitter_2`
- **Type**: String
- **Size**: 255
- **Required**: ❌ NO
- **Array**: ❌ NO

### 4. YOUTUBE FIELDS (2 pairs - Influencer only)

#### YouTube Channel 1
- **Attribute Name**: `link_youtube_1`
- **Type**: String
- **Size**: 500
- **Required**: ❌ NO
- **Array**: ❌ NO

- **Attribute Name**: `username_youtube_1`
- **Type**: String
- **Size**: 255
- **Required**: ❌ NO
- **Array**: ❌ NO

#### YouTube Channel 2
- **Attribute Name**: `link_youtube_2`
- **Type**: String
- **Size**: 500
- **Required**: ❌ NO
- **Array**: ❌ NO

- **Attribute Name**: `username_youtube_2`
- **Type**: String
- **Size**: 255
- **Required**: ❌ NO
- **Array**: ❌ NO

### 5. TIKTOK FIELDS (1 pair - Influencer only)

- **Attribute Name**: `link_tiktok`
- **Type**: String
- **Size**: 500
- **Required**: ❌ NO
- **Array**: ❌ NO

- **Attribute Name**: `username_tiktok`
- **Type**: String
- **Size**: 255
- **Required**: ❌ NO
- **Array**: ❌ NO

### 6. FACEBOOK FIELDS (1 pair - SMR only)

- **Attribute Name**: `link_facebook`
- **Type**: String
- **Size**: 500
- **Required**: ❌ NO
- **Array**: ❌ NO

- **Attribute Name**: `username_facebook`
- **Type**: String
- **Size**: 255
- **Required**: ❌ NO
- **Array**: ❌ NO

---

## Step-by-Step Instructions

### Step 1: Navigate to Collection
1. Login to Appwrite Console: https://cloud.appwrite.io
2. Select your project: **upt-reporting-app**
3. Click **Databases** → **main**
4. Click **Collections** → **submissions**

### Step 2: Add Attributes (One by One)
For each attribute listed above:

1. Click **"+ Create Attribute"** button
2. Select **"String"** as the type
3. Fill in the details:
   - **Attribute ID**: (copy from attribute name above)
   - **Size**: (use size from above - 255 or 500)
   - **Required**: Uncheck (set to NO)
   - **Array**: Uncheck (set to NO)
   - **Default**: Leave empty
4. Click **"Create"**
5. Wait for the attribute to be created (status: Available ✅)
6. Repeat for the next attribute

### Step 3: Verify All Attributes
After adding all 23 attributes, verify they appear in the collection:

**Total New Attributes**: 23
- ✅ nomor_konten (1)
- ✅ Instagram fields (4: link/username × 2 accounts)
- ✅ Twitter fields (4: link/username × 2 accounts)
- ✅ YouTube fields (4: link/username × 2 channels)
- ✅ TikTok fields (2: link/username × 1 account)
- ✅ Facebook fields (2: link/username × 1 account)

---

## Field Usage by Submission Type

### INFLUENCER Submissions
**Uses**: 21 fields
- nomor_konten ✅
- title ✅ (using existing field)
- Instagram (2 accounts): 4 fields ✅
- Twitter (2 accounts): 4 fields ✅
- YouTube (2 channels): 4 fields ✅
- TikTok (1 account): 2 fields ✅
- Facebook: **NULL** (not used)

**Sets to NULL**: link_facebook, username_facebook

### SMR Submissions
**Uses**: 9 fields
- nomor_konten ✅
- title ✅ (using existing field)
- Instagram (1 account): 2 fields ✅ (uses link_instagram_1, username_instagram_1)
- Facebook (1 account): 2 fields ✅
- Twitter (1 account): 2 fields ✅ (uses link_twitter_1, username_twitter_1)

**Sets to NULL**: 
- link_instagram_2, username_instagram_2
- link_twitter_2, username_twitter_2
- link_youtube_1, username_youtube_1
- link_youtube_2, username_youtube_2
- link_tiktok, username_tiktok

### Other Indicator Types
**Sets to NULL**: All 23 new fields (use standard fields instead)

---

## Validation Rules (Client-Side)

### For Both INFLUENCER and SMR:
1. **nomor_konten** must not be empty
2. **title** must have minimum 10 characters
3. **At least 1 social media link** must be filled:
   - For INFLUENCER: Any of 7 platforms (IG1, IG2, Twitter1, Twitter2, YT1, YT2, TikTok)
   - For SMR: Any of 3 platforms (IG1, Facebook, Twitter1)

---

## Testing Checklist

### Test Case 1: INFLUENCER with Instagram Only
```
Indicator Type: INFLUENCER DAN SMR
Sub Category: INFLUENCER
Nomor Konten: INF-001
Title: Test Influencer Content
Link Instagram 1: https://www.instagram.com/test_account/
Username Instagram 1: @test_account
(All other fields: empty)
```
**Expected**: ✅ Submission successful

### Test Case 2: INFLUENCER with Multiple Platforms
```
Indicator Type: INFLUENCER DAN SMR
Sub Category: INFLUENCER
Nomor Konten: INF-002
Title: Multi-Platform Influencer Test
Link Instagram 1: https://www.instagram.com/account1/
Username Instagram 1: @account1
Link Twitter 1: https://twitter.com/account1
Username Twitter 1: @account1
Link YouTube 1: https://www.youtube.com/@channel1
Username YouTube 1: @channel1
```
**Expected**: ✅ Submission successful

### Test Case 3: SMR with All 3 Platforms
```
Indicator Type: INFLUENCER DAN SMR
Sub Category: SMR
Nomor Konten: SMR-001
Title: Test SMR Content
Link Instagram 1: https://www.instagram.com/smr_account/
Username Instagram 1: @smr_account
Link Facebook: https://www.facebook.com/smr_page
Username Facebook: smr_page
Link Twitter 1: https://twitter.com/smr_account
Username Twitter 1: @smr_account
```
**Expected**: ✅ Submission successful

### Test Case 4: Validation - Missing Nomor Konten
```
Indicator Type: INFLUENCER DAN SMR
Sub Category: INFLUENCER
Nomor Konten: (empty)
Title: Test Content
Link Instagram 1: https://www.instagram.com/test/
```
**Expected**: ❌ Error: "Please enter Nomor Konten"

### Test Case 5: Validation - No Social Media Links
```
Indicator Type: INFLUENCER DAN SMR
Sub Category: INFLUENCER
Nomor Konten: INF-003
Title: Test Content Without Links
(All link fields: empty)
```
**Expected**: ❌ Error: "Please enter at least one social media link"

### Test Case 6: Data Integrity - SMR Nullification
Submit SMR entry with Instagram only, then verify in Appwrite:
```
✅ nomor_konten: "SMR-002"
✅ title: "Test SMR"
✅ link_instagram_1: "https://..."
✅ username_instagram_1: "@test"
❌ link_instagram_2: NULL
❌ link_twitter_2: NULL
❌ link_youtube_1: NULL
❌ link_youtube_2: NULL
❌ link_tiktok: NULL
❌ username_tiktok: NULL
```

---

## Rollback Plan

If you need to remove these attributes:

1. Go to Appwrite Console → Databases → main → submissions
2. For each attribute in the list above:
   - Click the **3-dot menu** next to the attribute
   - Select **"Delete Attribute"**
   - Confirm deletion
3. Attributes will be removed (existing data preserved)

**⚠️ WARNING**: Deleting attributes will remove all data stored in those fields!

---

## Support

If you encounter issues:
1. Check attribute names match exactly (case-sensitive)
2. Verify size limits (255 for usernames, 500 for links)
3. Ensure "Required" is set to NO for all new attributes
4. Check browser console for detailed error messages

---

**Last Updated**: 2025
**Related Files**: 
- `src/types/index.ts` (TypeScript interfaces)
- `src/app/upt/submit-report/page.tsx` (Form implementation)
