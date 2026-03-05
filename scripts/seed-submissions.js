#!/usr/bin/env node

/**
 * Seed Submissions Script for UPT Reporting System
 * 
 * Creates dummy submission documents for each UPT across 3 indicators
 * in Semester 1, 2026 to simulate filled progress against targets.
 * 
 * Usage:
 *   node scripts/seed-submissions.js          # Execute seeding
 *   node scripts/seed-submissions.js --dry-run # Preview only, no writes
 */

require('dotenv').config();

const sdk = require('node-appwrite');

// Configuration
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';

const DATABASE_ID = 'db_kinerja_upt';
const SUBMISSIONS_COLLECTION_ID = 'submissions';

const DRY_RUN = process.argv.includes('--dry-run');

// UPT Names
const UPT_NAMES = [
  'UPT Malang',
  'UPT Probolinggo',
  'UPT Surabaya',
  'UPT Madiun',
  'UPT Bali',
  'UPT Gresik'
];

// Seed configuration: indicator -> how many submissions to create per UPT
// IMPORTANT: Only include fields that actually exist in the Appwrite collection schema.
// Missing optional fields will default to null automatically.
const SEED_CONFIG = [
  {
    indicator_type: 'PUBLIKASI SIARAN PERS',
    count: 15,
    generateData: (index, uptName) => ({
      title: `Siaran Pers ${uptName} #${index + 1}`,
      narasi: `Narasi siaran pers ke-${index + 1} dari ${uptName} untuk Semester 1 2026. Berita ini memuat informasi penting terkait kegiatan dan program kerja unit.`,
      documentation_link: `https://drive.google.com/seed-data/siaran-pers-${index + 1}`,
    })
  },
  {
    indicator_type: 'PRODUKSI KONTEN MEDIA SOSIAL UNIT',
    count: 15,
    generateData: (index, uptName) => ({
      title: `Konten Media Sosial ${uptName} #${index + 1}`,
      narasi: `Konten media sosial ke-${index + 1} dari ${uptName} semester 1 2026. Konten ini dipublikasikan melalui platform resmi unit.`,
      documentation_link: `https://drive.google.com/seed-data/konten-medsos-${index + 1}`,
    })
  },
  {
    indicator_type: 'KONTEN VIDEO IN-CHANGE',
    count: 3,
    generateData: (index, uptName) => ({
      title: `Video In-Change ${uptName} #${index + 1}`,
      link_media: `https://youtube.com/seed-data/in-change-${index + 1}`,
    })
  }
];

// Initialize Appwrite Client
const client = new sdk.Client();
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const users = new sdk.Users(client);

/**
 * Generate a date distributed across Semester 1, 2026 (Jan 1 - Jun 30)
 */
function randomDateSemester1_2026(index, totalCount) {
  const start = new Date('2026-01-01T00:00:00.000Z');
  const end = new Date('2026-06-30T23:59:59.000Z');
  const range = end.getTime() - start.getTime();
  const step = range / totalCount;
  const date = new Date(start.getTime() + step * index + Math.random() * step * 0.8);
  return date.toISOString();
}

/**
 * Fetch UPT user IDs from Appwrite
 */
async function fetchUPTUserMap() {
  console.log('🔍 Fetching UPT users from Appwrite...\n');
  
  const result = await users.list();
  const userMap = {};

  for (const user of result.users) {
    if (user.labels.includes('uptuser') && user.prefs?.upt_name) {
      userMap[user.prefs.upt_name] = user.$id;
      console.log(`  ✓ ${user.prefs.upt_name} → User ID: ${user.$id} (${user.email})`);
    }
  }

  console.log('');
  return userMap;
}

/**
 * Main seeding function
 */
async function seedSubmissions() {
  console.log('🌱 UPT Reporting System - Seed Submissions\n');
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN (no writes)' : '🚀 LIVE (will create documents)'}\n`);

  // Validate configuration
  if (!APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
    console.error('❌ Missing APPWRITE_PROJECT_ID or APPWRITE_API_KEY in .env');
    process.exit(1);
  }

  // Fetch user IDs
  const userMap = await fetchUPTUserMap();

  // Verify all UPTs have users
  const missingUPTs = UPT_NAMES.filter(name => !userMap[name]);
  if (missingUPTs.length > 0) {
    console.error(`❌ Missing user accounts for: ${missingUPTs.join(', ')}`);
    console.error('   Run: node scripts/create-users.js to create them first');
    process.exit(1);
  }

  // Calculate totals
  const totalPerUPT = SEED_CONFIG.reduce((sum, config) => sum + config.count, 0);
  const totalDocuments = totalPerUPT * UPT_NAMES.length;

  console.log('📊 Seed Plan:');
  console.log('─'.repeat(60));
  for (const config of SEED_CONFIG) {
    console.log(`  ${config.indicator_type}: ${config.count} per UPT × ${UPT_NAMES.length} UPTs = ${config.count * UPT_NAMES.length}`);
  }
  console.log('─'.repeat(60));
  console.log(`  TOTAL: ${totalDocuments} documents to create\n`);

  if (DRY_RUN) {
    console.log('✅ Dry run complete. Run without --dry-run to execute.\n');
    return;
  }

  // Create submissions
  let created = 0;
  let failed = 0;

  for (const uptName of UPT_NAMES) {
    const userId = userMap[uptName];
    console.log(`\n📁 ${uptName} (User: ${userId})`);

    for (const config of SEED_CONFIG) {
      process.stdout.write(`  ${config.indicator_type}: `);

      for (let i = 0; i < config.count; i++) {
        const extraData = config.generateData(i, uptName);
        const submissionDate = randomDateSemester1_2026(i, config.count);

        // Only include core required fields + indicator-specific fields
        const documentData = {
          indicator_type: config.indicator_type,
          submitted_by_upt: uptName,
          submitted_by_user: userId,
          submission_date: submissionDate,
          ...extraData
        };

        try {
          await databases.createDocument(
            DATABASE_ID,
            SUBMISSIONS_COLLECTION_ID,
            sdk.ID.unique(),
            documentData
          );
          created++;
          process.stdout.write('✓');
        } catch (error) {
          failed++;
          process.stdout.write('✗');
          console.error(`\n    Error: ${error.message}`);
        }

        // Rate limit: 200ms between creates
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      console.log(` (${config.count})`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`✅ Seeding complete!`);
  console.log(`   Created: ${created} | Failed: ${failed} | Total: ${totalDocuments}`);
  console.log('═'.repeat(60) + '\n');
}

// Run
seedSubmissions().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
