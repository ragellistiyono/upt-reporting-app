#!/usr/bin/env node

/**
 * List All Users in Appwrite
 * 
 * Prerequisites:
 * - APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY in .env.local
 * 
 * Usage:
 *   node scripts/list-users.js
 */

require('dotenv').config({ path: '.env.local' });
const sdk = require('node-appwrite');

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';

if (!APPWRITE_API_KEY) {
  console.error('❌ APPWRITE_API_KEY not found in .env.local');
  console.log('💡 This script needs API key with users.read permission');
  process.exit(1);
}

const client = new sdk.Client();
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const users = new sdk.Users(client);

async function listUsers() {
  console.log('🔍 Fetching users from Appwrite...\n');

  try {
    const result = await users.list();
    
    console.log(`📊 Total users: ${result.total}\n`);

    if (result.total === 0) {
      console.log('❌ No users found!');
      console.log('💡 Run: node scripts/create-users.js to create users\n');
      return;
    }

    result.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No Name'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.$id}`);
      console.log(`   Labels: ${user.labels.join(', ') || 'No labels'}`);
      console.log(`   Prefs: ${JSON.stringify(user.prefs)}`);
      console.log(`   Created: ${new Date(user.$createdAt).toLocaleString()}`);
      console.log('');
    });

    // Show test credentials
    console.log('🔑 Test Credentials:');
    console.log('─'.repeat(50));
    
    const adminUser = result.users.find(u => u.labels.includes('admin'));
    if (adminUser) {
      console.log('Admin:');
      console.log(`  Email: ${adminUser.email}`);
      console.log(`  Password: [the one you set during creation]`);
    }

    const uptUser = result.users.find(u => u.labels.includes('uptuser'));
    if (uptUser) {
      console.log('\nUPT User:');
      console.log(`  Email: ${uptUser.email}`);
      console.log(`  Password: [the one you set during creation]`);
      console.log(`  UPT: ${uptUser.prefs?.upt_name || 'Not set'}`);
    }

    console.log('─'.repeat(50));

  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
    
    if (error.code === 401) {
      console.log('\n💡 API Key is invalid or expired');
      console.log('   Get a new one from: Appwrite Console → Settings → API Keys');
    }
    
    process.exit(1);
  }
}

listUsers();
