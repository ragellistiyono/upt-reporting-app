#!/usr/bin/env node

/**
 * Seed Data Script: Semester 1 2026
 * 
 * Creates submission documents for all 6 UPTs to simulate half-filled reports.
 * Also verifies/creates target documents if they don't exist.
 * 
 * Per UPT:
 *   - Publikasi Siaran Pers:          15 submissions (target 30)
 *   - Produksi Konten Media Sosial:   18 submissions (target 36)
 *   - Media Massa:                     3 submissions (target 6)
 *   - Media Sosial:                    5 submissions, total skor 2500 (target 5000)
 *   - Konten Video In-Change:          3 submissions (target 6)
 *   Total: 44 docs/UPT × 6 UPT = 264 documents
 * 
 * Prerequisites:
 *   - APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY in .env.local
 *   - node-appwrite and dotenv installed
 * 
 * Usage:
 *   node scripts/seed-semester1-2026.js
 */

require('dotenv').config({ path: '.env.local' });

const sdk = require('node-appwrite');

// ============================================================================
// Configuration
// ============================================================================

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';

const DATABASE_ID = 'db_kinerja_upt';
const COLLECTION_SUBMISSIONS = 'submissions';
const COLLECTION_TARGETS = 'targets';

const UPT_NAMES = [
  'UPT Malang',
  'UPT Probolinggo',
  'UPT Surabaya',
  'UPT Madiun',
  'UPT Bali',
  'UPT Gresik'
];

// Target configuration: { indicator_type (as stored in targets), target_value per UPT }
const TARGET_CONFIG = [
  { indicator_type: 'PUBLIKASI SIARAN PERS', target_value: 30 },
  { indicator_type: 'PRODUKSI KONTEN MEDIA SOSIAL UNIT', target_value: 36 },
  { indicator_type: 'SKORING MEDIA MASSA', target_value: 6 },
  { indicator_type: 'SKORING MEDIA SOSIAL', target_value: 5000 },
  { indicator_type: 'KONTEN VIDEO IN-CHANGE', target_value: 6 },
];

const YEAR = 2026;
const SEMESTER = 1;

// ============================================================================
// Initialize Appwrite
// ============================================================================

if (!APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
  console.error('❌ Missing APPWRITE_PROJECT_ID or APPWRITE_API_KEY in .env.local');
  process.exit(1);
}

const client = new sdk.Client();
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const users = new sdk.Users(client);

// ============================================================================
// Helpers
// ============================================================================

/**
 * Generate a random date between Jan 1 and Jun 30, 2026.
 * Avoids days 17-18 of each month (blocked in the app).
 */
function randomDateSemester1() {
  const start = new Date(2026, 0, 1); // Jan 1
  const end = new Date(2026, 5, 30);  // Jun 30
  let date;
  do {
    const ms = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    date = new Date(ms);
  } while (date.getDate() === 17 || date.getDate() === 18);
  // Set a random hour between 8-17 for realism
  date.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
  return date;
}

/**
 * Generate sorted random dates for a given count
 */
function generateSortedDates(count) {
  const dates = [];
  for (let i = 0; i < count; i++) {
    dates.push(randomDateSemester1());
  }
  return dates.sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Dummy media names for Media Massa
 */
const MEDIA_NAMES = [
  'Kompas', 'Detik.com', 'Tribunnews', 'Tempo', 'CNN Indonesia',
  'CNBC Indonesia', 'Republika', 'Bisnis.com', 'Antara News', 'Liputan6',
  'Kumparan', 'IDN Times', 'Suara.com', 'Okezone', 'Sindonews',
  'Media Indonesia', 'Jawa Pos', 'Radar Malang', 'Surya'
];

/**
 * Delay helper to avoid rate limiting
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper for Appwrite API calls
 */
async function withRetry(fn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const waitMs = attempt * 1000;
      console.log(`     ⏳ Retry ${attempt}/${maxRetries} after ${waitMs}ms...`);
      await delay(waitMs);
    }
  }
}

// ============================================================================
// Step 1: Verify / Create Targets
// ============================================================================

async function ensureTargets() {
  console.log('\n📊 Step 1: Verifying targets for Semester 1 2026...\n');

  let created = 0;
  let existing = 0;

  for (const cfg of TARGET_CONFIG) {
    for (const uptName of UPT_NAMES) {
      // Check if target already exists
      const result = await withRetry(() => databases.listDocuments(DATABASE_ID, COLLECTION_TARGETS, [
        sdk.Query.equal('upt_name', uptName),
        sdk.Query.equal('indicator_type', cfg.indicator_type),
        sdk.Query.equal('year', YEAR),
        sdk.Query.equal('semester', SEMESTER),
        sdk.Query.limit(1)
      ]));

      if (result.total > 0) {
        // Update if value is different
        const doc = result.documents[0];
        if (doc.target_value !== cfg.target_value) {
          await withRetry(() => databases.updateDocument(DATABASE_ID, COLLECTION_TARGETS, doc.$id, {
            target_value: cfg.target_value
          }));
          console.log(`  ✏️  Updated: ${uptName} | ${cfg.indicator_type} → ${cfg.target_value}`);
        } else {
          existing++;
        }
      } else {
        // Create new target
        await withRetry(() => databases.createDocument(DATABASE_ID, COLLECTION_TARGETS, sdk.ID.unique(), {
          upt_name: uptName,
          indicator_type: cfg.indicator_type,
          target_value: cfg.target_value,
          year: YEAR,
          semester: SEMESTER,
          month: 0 // semester-based
        }));
        created++;
        console.log(`  ✅ Created: ${uptName} | ${cfg.indicator_type} = ${cfg.target_value}`);
      }
      await delay(100);
    }
  }

  console.log(`\n  Summary: ${created} created, ${existing} already existed`);
  console.log(`  Total target docs: ${TARGET_CONFIG.length * UPT_NAMES.length}`);
}

// ============================================================================
// Step 2: Get UPT User IDs
// ============================================================================

async function getUptUserMap() {
  console.log('\n👤 Step 2: Fetching UPT user accounts...\n');

  const result = await users.list();
  const userMap = {}; // { 'UPT Malang': 'userId', ... }

  for (const user of result.users) {
    if (user.labels && user.labels.includes('uptuser') && user.prefs && user.prefs.upt_name) {
      const uptName = user.prefs.upt_name;
      userMap[uptName] = user.$id;
      console.log(`  📌 ${uptName} → ${user.email} (${user.$id})`);
    }
  }

  // Verify all UPTs have users
  const missing = UPT_NAMES.filter(u => !userMap[u]);
  if (missing.length > 0) {
    console.error(`\n❌ Missing user accounts for: ${missing.join(', ')}`);
    console.error('   Run: node scripts/create-users.js to create missing users');
    process.exit(1);
  }

  console.log(`\n  ✅ All 6 UPT users found`);
  return userMap;
}

// ============================================================================
// Step 3: Seed Submissions
// ============================================================================

async function seedSubmissions(userMap) {
  console.log('\n📝 Step 3: Seeding submission documents...\n');

  let totalCreated = 0;

  async function createSubmission(data) {
    await withRetry(() => databases.createDocument(DATABASE_ID, COLLECTION_SUBMISSIONS, sdk.ID.unique(), data));
    await delay(100);
  }

  /** Common null fields for all non-influencer submissions */
  const NULL_INFLUENCER_FIELDS = {
    nomor_konten: null,
    link_instagram_1: null, username_instagram_1: null,
    link_instagram_2: null, username_instagram_2: null,
    link_instagram_3: null, username_instagram_3: null,
    link_ig_reels_1: null, username_ig_reels_1: null,
    link_ig_reels_2: null, username_ig_reels_2: null,
    link_ig_reels_3: null, username_ig_reels_3: null,
    link_twitter_1: null, username_twitter_1: null,
    link_twitter_2: null, username_twitter_2: null,
    link_twitter_3: null, username_twitter_3: null,
    link_facebook: null, username_facebook: null,
    link_threads_1: null, username_threads_1: null,
    link_threads_2: null, username_threads_2: null,
    link_threads_3: null, username_threads_3: null,
    link_youtube_1: null, username_youtube_1: null,
    link_youtube_2: null, username_youtube_2: null,
    link_youtube_3: null, username_youtube_3: null,
    link_yt_video_1: null, username_yt_video_1: null,
    link_yt_video_2: null, username_yt_video_2: null,
    link_yt_video_3: null, username_yt_video_3: null,
    link_tiktok: null, username_tiktok: null,
  };

  for (const uptName of UPT_NAMES) {
    const userId = userMap[uptName];
    console.log(`\n  🏢 ${uptName} (user: ${userId})`);

    // --- 1. Publikasi Siaran Pers: 15 submissions ---
    const siaranPresDates = generateSortedDates(15);
    for (let i = 0; i < 15; i++) {
      await createSubmission({
        indicator_type: 'PUBLIKASI SIARAN PERS',
        sub_category: null,
        submitted_by_upt: uptName,
        submission_date: siaranPresDates[i].toISOString(),
        submitted_by_user: userId,
        title: `Siaran Pers ${uptName} #${i + 1} - Kegiatan PLN Semester 1 2026`,
        narasi: `Narasi siaran pers ke-${i + 1} dari ${uptName}. Melaporkan kegiatan dan perkembangan terkini PLN di wilayah kerja ${uptName} pada semester 1 tahun 2026. Siaran pers ini disusun untuk memberikan informasi kepada publik mengenai program-program ketenagalistrikan.`,
        documentation_link: `https://docs.google.com/document/d/example-siaran-pers-${uptName.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
        link_media: null, link_publikasi: null, nama_media: null,
        skor_media_massa: null, skor_media_sosial: null, file_id: null,
        ...NULL_INFLUENCER_FIELDS,
      });
    }
    totalCreated += 15;
    console.log(`     ✅ Siaran Pers: 15 docs`);

    // --- 2. Produksi Konten Media Sosial Unit: 18 submissions ---
    const kontenMedsosDates = generateSortedDates(18);
    for (let i = 0; i < 18; i++) {
      await createSubmission({
        indicator_type: 'PRODUKSI KONTEN MEDIA SOSIAL UNIT',
        sub_category: null,
        submitted_by_upt: uptName,
        submission_date: kontenMedsosDates[i].toISOString(),
        submitted_by_user: userId,
        title: `Konten Media Sosial ${uptName} #${i + 1} - Edisi Semester 1 2026`,
        narasi: `Konten media sosial ke-${i + 1} dari ${uptName}. Konten ini diproduksi untuk meningkatkan engagement dan awareness publik terhadap program-program PLN di wilayah ${uptName}. Mencakup infografis, foto kegiatan, dan konten edukatif ketenagalistrikan.`,
        documentation_link: `https://drive.google.com/file/d/example-konten-medsos-${uptName.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
        link_media: null, link_publikasi: null, nama_media: null,
        skor_media_massa: null, skor_media_sosial: null, file_id: null,
        ...NULL_INFLUENCER_FIELDS,
      });
    }
    totalCreated += 18;
    console.log(`     ✅ Konten Media Sosial: 18 docs`);

    // --- 3. Media Massa: 3 submissions ---
    const mediaMassaDates = generateSortedDates(3);
    for (let i = 0; i < 3; i++) {
      const mediaName = MEDIA_NAMES[Math.floor(Math.random() * MEDIA_NAMES.length)];
      await createSubmission({
        indicator_type: 'SKORING MEDIA MASSA DAN MEDIA SOSIAL',
        sub_category: 'MEDIA MASSA',
        submitted_by_upt: uptName,
        submission_date: mediaMassaDates[i].toISOString(),
        submitted_by_user: userId,
        title: `Pemberitaan PLN ${uptName} di ${mediaName} #${i + 1}`,
        narasi: null, documentation_link: null, link_media: null,
        link_publikasi: `https://www.${mediaName.toLowerCase().replace(/\s+/g, '')}.com/pln-${uptName.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
        nama_media: mediaName,
        skor_media_massa: null, skor_media_sosial: null, file_id: null,
        ...NULL_INFLUENCER_FIELDS,
      });
    }
    totalCreated += 3;
    console.log(`     ✅ Media Massa: 3 docs`);

    // --- 4. Media Sosial: 5 submissions, total skor = 2500 (5 × 500) ---
    const mediaSosialDates = generateSortedDates(5);
    for (let i = 0; i < 5; i++) {
      await createSubmission({
        indicator_type: 'SKORING MEDIA MASSA DAN MEDIA SOSIAL',
        sub_category: 'MEDIA SOSIAL',
        submitted_by_upt: uptName,
        submission_date: mediaSosialDates[i].toISOString(),
        submitted_by_user: userId,
        title: null, narasi: null, documentation_link: null, link_media: null,
        link_publikasi: null, nama_media: null,
        skor_media_massa: null,
        skor_media_sosial: 500, // 5 submissions × 500 = 2500 total per UPT
        file_id: null,
        ...NULL_INFLUENCER_FIELDS,
      });
    }
    totalCreated += 5;
    console.log(`     ✅ Media Sosial: 5 docs (total skor = 2500)`);

    // --- 5. Konten Video In-Change: 3 submissions ---
    const videoInChangeDates = generateSortedDates(3);
    for (let i = 0; i < 3; i++) {
      await createSubmission({
        indicator_type: 'KONTEN VIDEO IN-CHANGE',
        sub_category: null,
        submitted_by_upt: uptName,
        submission_date: videoInChangeDates[i].toISOString(),
        submitted_by_user: userId,
        title: `Video In-Change ${uptName} #${i + 1} - Program Kelistrikan 2026`,
        narasi: null, documentation_link: null,
        link_media: `https://www.youtube.com/watch?v=example-video-${uptName.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
        link_publikasi: null, nama_media: null,
        skor_media_massa: null, skor_media_sosial: null, file_id: null,
        ...NULL_INFLUENCER_FIELDS,
      });
    }
    totalCreated += 3;
    console.log(`     ✅ Video In-Change: 3 docs`);

    console.log(`     📊 ${uptName} subtotal: 44 docs`);
  }

  return totalCreated;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('🚀 Seed Data: Semester 1 2026');
  console.log('═'.repeat(60));
  console.log(`  Endpoint: ${APPWRITE_ENDPOINT}`);
  console.log(`  Project:  ${APPWRITE_PROJECT_ID}`);
  console.log(`  Database: ${DATABASE_ID}`);
  console.log(`  Year: ${YEAR}, Semester: ${SEMESTER}`);
  console.log('═'.repeat(60));

  try {
    // Step 1: Ensure targets exist
    await ensureTargets();

    // Step 2: Get UPT user IDs
    const userMap = await getUptUserMap();

    // Step 3: Seed submissions
    const totalCreated = await seedSubmissions(userMap);

    console.log('\n' + '═'.repeat(60));
    console.log(`✅ Seeding complete!`);
    console.log(`   Total submissions created: ${totalCreated}`);
    console.log(`   Target documents verified: ${TARGET_CONFIG.length * UPT_NAMES.length}`);
    console.log('═'.repeat(60));

    console.log('\n📋 Expected dashboard results per UPT:');
    console.log('   Siaran Pers:        15 / 30  (50%)');
    console.log('   Konten Medsos:      18 / 36  (50%)');
    console.log('   Media Massa:         3 / 6   (50%)');
    console.log('   Media Sosial:     2500 / 5000 (50%) [SUM skor]');
    console.log('   Video In-Change:     3 / 6   (50%)');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message || error);
    if (error.response) {
      console.error('   Response:', JSON.stringify(error.response, null, 2));
    }
    process.exit(1);
  }
}

main();
