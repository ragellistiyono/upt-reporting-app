#!/usr/bin/env node

/**
 * Fix Collection Permissions
 * 
 * Ensures all collections in db_kinerja_upt allow any authenticated user
 * to read and write documents.
 */

require('dotenv').config({ path: '.env.local' });

const sdk = require('node-appwrite');

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';

const DATABASE_ID = 'db_kinerja_upt';
const COLLECTIONS = ['submissions', 'instructions', 'instruction_reads', 'targets', 'performance_targets'];

const client = new sdk.Client();
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const db = new sdk.Databases(client);

async function main() {
  console.log('=== Fix Collection Permissions ===\n');

  if (!APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
    console.error('Missing APPWRITE_PROJECT_ID or APPWRITE_API_KEY in .env.local');
    process.exit(1);
  }

  for (const collectionId of COLLECTIONS) {
    try {
      console.log(`\n--- Collection: ${collectionId} ---`);

      const collection = await db.getCollection(DATABASE_ID, collectionId);
      console.log(`  Current permissions: ${JSON.stringify(collection.$permissions)}`);
      console.log(`  Document security: ${collection.documentSecurity}`);

      const newPermissions = [
        sdk.Permission.read(sdk.Role.users()),
        sdk.Permission.create(sdk.Role.users()),
        sdk.Permission.update(sdk.Role.users()),
        sdk.Permission.delete(sdk.Role.users()),
      ];

      await db.updateCollection(
        DATABASE_ID,
        collectionId,
        collection.name,
        newPermissions,
        collection.documentSecurity,
        collection.enabled
      );

      const updated = await db.getCollection(DATABASE_ID, collectionId);
      console.log(`  Updated permissions: ${JSON.stringify(updated.$permissions)}`);
      console.log('  OK');
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
    }
  }

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
