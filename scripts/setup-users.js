#!/usr/bin/env node

/**
 * User Setup Script for UPT Reporting System
 * 
 * Creates all 7 users (6 UPT + 1 Admin) with predefined credentials.
 * Handles existing users by updating their password, labels, and preferences.
 * 
 * Prerequisites:
 *   - node-appwrite package installed: npm install node-appwrite
 *   - Environment variables in .env.local:
 *     APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
 *     APPWRITE_PROJECT_ID=<your-project-id>
 *     APPWRITE_API_KEY=<your-api-key> (needs users.read + users.write scopes)
 * 
 * Usage:
 *   node scripts/setup-users.js
 *   # or with env helper:
 *   bash scripts/run-with-env.sh node scripts/setup-users.js
 */

require('dotenv').config({ path: '.env.local' });

const sdk = require('node-appwrite');

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';

const EMAIL_DOMAIN = '@digitalcommtrack.com';

const USERS_TO_CREATE = [
  {
    username: 'uptbali',
    password: 'commuptbali123',
    name: 'UPT Bali',
    labels: ['uptuser'],
    prefs: { upt_name: 'UPT Bali' },
  },
  {
    username: 'uptprobolinggo',
    password: 'commuptpblg123',
    name: 'UPT Probolinggo',
    labels: ['uptuser'],
    prefs: { upt_name: 'UPT Probolinggo' },
  },
  {
    username: 'uptmalang',
    password: 'commuptmlg123',
    name: 'UPT Malang',
    labels: ['uptuser'],
    prefs: { upt_name: 'UPT Malang' },
  },
  {
    username: 'uptsurabaya',
    password: 'commuptsby123',
    name: 'UPT Surabaya',
    labels: ['uptuser'],
    prefs: { upt_name: 'UPT Surabaya' },
  },
  {
    username: 'uptgresik',
    password: 'commuptgrk123',
    name: 'UPT Gresik',
    labels: ['uptuser'],
    prefs: { upt_name: 'UPT Gresik' },
  },
  {
    username: 'uptmadiun',
    password: 'commuptmdn123',
    name: 'UPT Madiun',
    labels: ['uptuser'],
    prefs: { upt_name: 'UPT Madiun' },
  },
  {
    username: 'adminjbm',
    password: 'admincommjbm',
    name: 'Admin JBM',
    labels: ['admin'],
    prefs: {},
  },
];

const client = new sdk.Client();
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const usersService = new sdk.Users(client);

async function findUserByEmail(email) {
  try {
    const result = await usersService.list([sdk.Query.equal('email', email)]);
    return result.users.length > 0 ? result.users[0] : null;
  } catch {
    return null;
  }
}

async function setupUser(userConfig) {
  const email = userConfig.username + EMAIL_DOMAIN;
  console.log(`\n--- ${userConfig.name} (${userConfig.username}) ---`);

  let existing = await findUserByEmail(email);

  if (existing) {
    console.log(`  Found existing user: ${existing.$id}`);
    try {
      await usersService.updatePassword(existing.$id, userConfig.password);
      console.log('  Updated password');
    } catch (err) {
      console.log(`  Password update skipped: ${err.message}`);
    }

    try {
      await usersService.updateLabels(existing.$id, userConfig.labels);
      console.log(`  Updated labels: [${userConfig.labels.join(', ')}]`);
    } catch (err) {
      console.log(`  Labels update skipped: ${err.message}`);
    }

    if (Object.keys(userConfig.prefs).length > 0) {
      try {
        await usersService.updatePrefs(existing.$id, userConfig.prefs);
        console.log(`  Updated prefs: ${JSON.stringify(userConfig.prefs)}`);
      } catch (err) {
        console.log(`  Prefs update skipped: ${err.message}`);
      }
    }

    try {
      await usersService.updateName(existing.$id, userConfig.name);
      console.log(`  Updated name: ${userConfig.name}`);
    } catch (err) {
      console.log(`  Name update skipped: ${err.message}`);
    }

    try {
      await usersService.updateEmailVerification(existing.$id, true);
      console.log('  Email verified');
    } catch (err) {
      console.log(`  Verification skipped: ${err.message}`);
    }

    return existing;
  }

  try {
    const user = await usersService.create(
      sdk.ID.unique(),
      email,
      undefined,
      userConfig.password,
      userConfig.name
    );
    console.log(`  Created user: ${user.$id}`);

    await usersService.updateLabels(user.$id, userConfig.labels);
    console.log(`  Set labels: [${userConfig.labels.join(', ')}]`);

    if (Object.keys(userConfig.prefs).length > 0) {
      await usersService.updatePrefs(user.$id, userConfig.prefs);
      console.log(`  Set prefs: ${JSON.stringify(userConfig.prefs)}`);
    }

    await usersService.updateEmailVerification(user.$id, true);
    console.log('  Email verified');

    return user;
  } catch (err) {
    console.error(`  FAILED to create: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('=== UPT Reporting System - User Setup ===\n');

  if (!APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
    console.error('Missing required environment variables:');
    if (!APPWRITE_PROJECT_ID) console.error('  - APPWRITE_PROJECT_ID (or NEXT_PUBLIC_APPWRITE_PROJECT_ID)');
    if (!APPWRITE_API_KEY) console.error('  - APPWRITE_API_KEY');
    console.error('\nSet them in .env.local and try again.');
    process.exit(1);
  }

  console.log(`Endpoint: ${APPWRITE_ENDPOINT}`);
  console.log(`Project:  ${APPWRITE_PROJECT_ID}`);
  console.log(`Domain:   ${EMAIL_DOMAIN}`);
  console.log(`Users:    ${USERS_TO_CREATE.length}`);

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const userConfig of USERS_TO_CREATE) {
    const existing = await findUserByEmail(userConfig.username + EMAIL_DOMAIN);
    const result = await setupUser(userConfig);
    if (result) {
      if (existing) updated++;
      else created++;
    } else {
      failed++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Failed:  ${failed}`);
  console.log('\nLogin credentials:');
  for (const u of USERS_TO_CREATE) {
    console.log(`  ${u.username.padEnd(16)} / ${u.password}`);
  }
  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
