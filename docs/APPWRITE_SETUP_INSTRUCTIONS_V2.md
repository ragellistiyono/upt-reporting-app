# APPWRITE SETUP INSTRUCTIONS - Instruksi Report (Updated)

## 🔄 PERUBAHAN FLOW BARU

Flow instruksi telah diubah dari **template pengisian form** menjadi **instruksi download & upload konten**.

### Flow Lama (Deprecated):
- ❌ Admin mengisi 24 field social media sebagai contoh
- ❌ UPT copy template ke form submission

### Flow Baru (Current):
- ✅ Admin upload konten ke Google Drive
- ✅ Admin buat instruksi dengan 4 field: title, content_link, caption_instagram, caption_twitter
- ✅ UPT download konten dari Google Drive
- ✅ UPT upload ke semua platform dengan caption yang disediakan
- ✅ UPT tetap isi form submission seperti biasa

---

## 📋 PART 1: UPDATE `instructions` COLLECTION SCHEMA

### Hapus Attributes Lama (24 fields):
Hapus semua attribute berikut dari collection `instructions`:

1. `nomor_konten` (String)
2. `link_instagram_1` (String, optional)
3. `username_instagram_1` (String, optional)
4. `link_instagram_2` (String, optional)
5. `username_instagram_2` (String, optional)
6. `link_twitter_1` (String, optional)
7. `username_twitter_1` (String, optional)
8. `link_twitter_2` (String, optional)
9. `username_twitter_2` (String, optional)
10. `link_youtube_1` (String, optional)
11. `username_youtube_1` (String, optional)
12. `link_youtube_2` (String, optional)
13. `username_youtube_2` (String, optional)
14. `link_tiktok` (String, optional)
15. `username_tiktok` (String, optional)
16. `link_facebook` (String, optional)
17. `username_facebook` (String, optional)

### Tambah Attributes Baru (3 fields):

**Attribute 1: `content_link`**
- **Type**: String
- **Size**: 2000
- **Required**: Yes
- **Default**: (none)
- **Array**: No
- **Description**: Link Google Drive yang berisi konten untuk diupload UPT

**Attribute 2: `caption_instagram`**
- **Type**: String
- **Size**: 5000
- **Required**: Yes
- **Default**: (none)
- **Array**: No
- **Description**: Caption yang akan digunakan UPT untuk upload Instagram

**Attribute 3: `caption_twitter`**
- **Type**: String
- **Size**: 5000
- **Required**: Yes
- **Default**: (none)
- **Array**: No
- **Description**: Caption yang akan digunakan UPT untuk upload Twitter/X

### Attributes Yang Tetap (Tidak Berubah):

1. `status` (Enum: ['DRAFT', 'PUBLISHED'])
2. `indicator_type` (String) - Always 'INFLUENCER DAN SMR'
3. `sub_category` (Enum: ['INFLUENCER', 'SMR'])
4. `target_type` (Enum: ['ALL', 'SPECIFIC'])
5. `target_upt` (String[], optional) - Array of UPT names
6. `created_by_user` (String) - Admin User ID
7. `created_by_name` (String) - Admin name
8. `published_at` (DateTime, optional) - ISO datetime when published
9. `title` (String) - Judul Instruksi

---

## 📋 PART 2: `instruction_reads` COLLECTION (Tidak Berubah)

Collection ini tetap sama, tidak ada perubahan.

**Attributes:**
1. `instruction_id` (String, required)
2. `user_id` (String, required)
3. `upt_name` (String, required)
4. `read_at` (DateTime, required)

---

## 🔐 PART 3: PERMISSIONS (Tidak Berubah)

### `instructions` Collection:
- **Read**: Any authenticated user
- **Create**: Admin only
- **Update**: Admin only
- **Delete**: Admin only

### `instruction_reads` Collection:
- **Read**: User who created the document
- **Create**: Any authenticated UPT user
- **Update**: No one
- **Delete**: Admin only

---

## 🗂️ PART 4: INDEXES (Update)

### `instructions` Collection:

**Index 1: `status_published_at`**
- Attributes: [`status`, `published_at`]
- Type: Key
- Order: [`ASC`, `DESC`]
- Purpose: Query published instructions sorted by date

**Index 2: `target_type_status`**
- Attributes: [`target_type`, `status`]
- Type: Key
- Order: [`ASC`, `ASC`]
- Purpose: Filter by target type and status

**Index 3: `created_at`** (Optional)
- Attributes: [`$createdAt`]
- Type: Key
- Order: [`DESC`]
- Purpose: Sort by creation date

### `instruction_reads` Collection:

**Index 1: `user_instruction_unique`**
- Attributes: [`user_id`, `instruction_id`]
- Type: Unique
- Purpose: Prevent duplicate read records

---

## ✅ PART 5: TEST CASES

### Test Case 1: Admin Creates INFLUENCER Instruction
**Input:**
```json
{
  "status": "PUBLISHED",
  "indicator_type": "INFLUENCER DAN SMR",
  "sub_category": "INFLUENCER",
  "target_type": "ALL",
  "target_upt": null,
  "created_by_user": "admin_user_id_123",
  "created_by_name": "Admin Kominfo",
  "published_at": "2025-01-15T10:00:00.000Z",
  "title": "Konten Hari Kemerdekaan 2025",
  "content_link": "https://drive.google.com/drive/folders/abc123xyz",
  "caption_instagram": "Selamat Hari Kemerdekaan ke-80 Republik Indonesia! 🇮🇩\n\n#HUT80RI #MerdekaAtauMati #Indonesia",
  "caption_twitter": "Dirgahayu Republik Indonesia yang ke-80! Mari kita jaga persatuan dan kesatuan bangsa. 🇮🇩 #HUT80RI #NKRI"
}
```

**Expected Result:**
✅ Document created successfully
✅ All UPT users can see this instruction
✅ UPT can open Google Drive link
✅ UPT can copy captions to clipboard

---

### Test Case 2: Admin Creates SMR Instruction (Specific UPT)
**Input:**
```json
{
  "status": "PUBLISHED",
  "indicator_type": "INFLUENCER DAN SMR",
  "sub_category": "SMR",
  "target_type": "SPECIFIC",
  "target_upt": ["UPT Surabaya", "UPT Malang"],
  "created_by_user": "admin_user_id_123",
  "created_by_name": "Admin Kominfo",
  "published_at": "2025-01-15T14:00:00.000Z",
  "title": "Kampanye Digital Ekonomi Jawa Timur",
  "content_link": "https://drive.google.com/file/d/xyz789abc/view",
  "caption_instagram": "Mari dukung UMKM Jawa Timur! 🛍️\n\n#EkonomiDigital #UMKMJatim #BeliLokal",
  "caption_twitter": "Digitalisasi UMKM adalah kunci pertumbuhan ekonomi daerah. Yuk dukung produk lokal! 🛍️ #EkonomiDigital"
}
```

**Expected Result:**
✅ Document created successfully
✅ Only UPT Surabaya and UPT Malang can see this instruction
✅ Other UPTs cannot see it

---

### Test Case 3: UPT Marks Instruction as Read
**Input:**
```json
{
  "instruction_id": "instruction_doc_id_xyz",
  "user_id": "upt_user_id_456",
  "upt_name": "UPT Surabaya",
  "read_at": "2025-01-15T15:30:00.000Z"
}
```

**Expected Result:**
✅ Document created in `instruction_reads`
✅ Unique index prevents duplicate reads
✅ Unread counter decreases by 1

---

### Test Case 4: Validation - Missing Google Drive Link
**Input:**
```json
{
  "status": "PUBLISHED",
  "sub_category": "INFLUENCER",
  "title": "Test Instruction",
  "content_link": "",
  "caption_instagram": "Test caption",
  "caption_twitter": "Test caption"
}
```

**Expected Result:**
❌ Frontend validation fails: "Link Google Drive wajib diisi"

---

### Test Case 5: Validation - Invalid Google Drive URL
**Input:**
```json
{
  "status": "PUBLISHED",
  "sub_category": "SMR",
  "title": "Test Instruction",
  "content_link": "https://dropbox.com/files/test",
  "caption_instagram": "Test caption",
  "caption_twitter": "Test caption"
}
```

**Expected Result:**
❌ Frontend validation fails: "Link harus berupa URL Google Drive yang valid"

---

## 🔍 PART 6: QUERY EXAMPLES

### Query 1: Fetch All Published Instructions for Specific UPT
```typescript
const instructions = await databases.listDocuments(
  DATABASE_ID,
  'instructions',
  [
    Query.equal('status', 'PUBLISHED'),
    Query.orderDesc('published_at'),
    Query.limit(50)
  ]
);

// Client-side filter by target
const filtered = instructions.documents.filter((inst) => {
  if (inst.target_type === 'ALL') return true;
  if (inst.target_type === 'SPECIFIC' && inst.target_upt) {
    return inst.target_upt.includes(currentUptName);
  }
  return false;
});
```

### Query 2: Fetch Read Status for UPT User
```typescript
const reads = await databases.listDocuments(
  DATABASE_ID,
  'instruction_reads',
  [
    Query.equal('user_id', currentUserId),
    Query.limit(100)
  ]
);
```

### Query 3: Calculate Unread Instructions
```typescript
const readIds = new Set(reads.documents.map((r) => r.instruction_id));
const unread = instructions.documents.filter((inst) => !readIds.has(inst.$id));
```

---

## 📊 PART 7: DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Admin upload konten ke Google Drive                │
│  2. Admin buat instruksi:                               │
│     ├─ Judul Instruksi                                  │
│     ├─ Link Google Drive                                │
│     ├─ Caption Instagram                                │
│     └─ Caption Twitter/X                                │
│  3. Admin pilih target (ALL / SPECIFIC UPT)             │
│  4. Admin publish                                       │
│                                                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              APPWRITE instructions COLLECTION           │
├─────────────────────────────────────────────────────────┤
│  Document:                                              │
│  {                                                      │
│    "title": "Konten XYZ",                               │
│    "content_link": "https://drive.google.com/...",     │
│    "caption_instagram": "Caption IG...",                │
│    "caption_twitter": "Caption Twitter...",             │
│    "target_type": "ALL" | "SPECIFIC",                   │
│    "target_upt": ["UPT A", "UPT B"] | null,            │
│    "status": "PUBLISHED"                                │
│  }                                                      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                    UPT DASHBOARD                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. UPT melihat notifikasi (bell icon + banner)         │
│  2. UPT klik instruksi → modal terbuka                  │
│  3. UPT lihat instruksi:                                │
│     ├─ Download konten dari Google Drive                │
│     ├─ Upload ke semua platform (IG, Twitter, FB, dll)  │
│     ├─ Copy caption Instagram                           │
│     └─ Copy caption Twitter/X                           │
│  4. UPT mark as read                                    │
│  5. UPT isi form submission seperti biasa               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🛡️ PART 8: SECURITY CONSIDERATIONS

1. **Google Drive Link Validation**:
   - Frontend validates URL contains "drive.google.com"
   - UPT users harus punya akses ke Google Drive link

2. **Caption Sanitization**:
   - Caption disimpan as-is di database
   - UPT dapat copy caption langsung tanpa modifikasi
   - Panjang maksimal 5000 karakter untuk safety

3. **Read Tracking**:
   - Unique index mencegah duplicate read records
   - Read tracking tidak boleh diupdate setelah dibuat

---

## 📈 PART 9: MONITORING & METRICS

**Metrics to Track:**
1. Total instructions created per month
2. Published vs Draft ratio
3. Average time from creation to publish
4. Instruction read rate (% UPT yang read)
5. Google Drive link click rate
6. Caption copy rate (via frontend analytics)

**Dashboard Queries:**
```typescript
// Total instructions
const total = await databases.listDocuments(
  DATABASE_ID,
  'instructions',
  [Query.limit(1)]
);
console.log('Total:', total.total);

// Published this month
const thisMonth = await databases.listDocuments(
  DATABASE_ID,
  'instructions',
  [
    Query.equal('status', 'PUBLISHED'),
    Query.greaterThan('published_at', startOfMonth),
    Query.limit(100)
  ]
);
```

---

## 🚀 PART 10: MIGRATION STEPS

### Step 1: Backup Existing Data
```bash
# Export existing instructions collection
npx appwrite databases listDocuments \
  --databaseId=[YOUR_DATABASE_ID] \
  --collectionId=[YOUR_COLLECTION_ID] \
  > instructions_backup.json
```

### Step 2: Update Collection Schema
1. Login to Appwrite Console
2. Navigate to `instructions` collection
3. Delete old attributes (24 social media fields)
4. Add new attributes (content_link, caption_instagram, caption_twitter)
5. Save changes

### Step 3: Update Indexes
1. Delete old indexes if any conflict
2. Create new indexes as per Part 4

### Step 4: Test with Sample Data
1. Use Test Case 1 to create sample instruction
2. Verify UPT can see and open Google Drive link
3. Verify captions display correctly
4. Test mark as read functionality

### Step 5: Deploy Frontend Changes
1. Verify all TypeScript types updated
2. Test CreateInstructionModal with new fields
3. Test InstructionDetailModal displays instructions correctly
4. Test UPT notification flow

---

## ✅ CHECKLIST

- [ ] Backup existing `instructions` collection data
- [ ] Delete 17 old attributes from `instructions` collection
- [ ] Add 3 new attributes: `content_link`, `caption_instagram`, `caption_twitter`
- [ ] Update/create indexes as per Part 4
- [ ] Test permissions (Admin create, UPT read)
- [ ] Test unique index on `instruction_reads`
- [ ] Deploy frontend changes
- [ ] Test end-to-end flow (Admin create → UPT read → Mark as read)
- [ ] Monitor for errors in production
- [ ] Update team documentation

---

## 📞 SUPPORT

Jika ada error atau pertanyaan:
1. Check Appwrite Console logs
2. Verify collection schema matches documentation
3. Test permissions for each role
4. Check browser console for frontend errors
5. Contact: [Your Support Contact]

---

**Last Updated**: 2025-01-15  
**Version**: 2.0 (Simplified Instruction Flow)  
**Author**: Ragel Listiyono
