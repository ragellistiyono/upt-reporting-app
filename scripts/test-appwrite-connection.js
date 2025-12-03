#!/usr/bin/env node

/**
 * Test Appwrite Connection
 * 
 * Script untuk test koneksi ke Appwrite dan validasi setup
 * Run: node scripts/test-appwrite-connection.js
 */

const { Client, Account } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_APPWRITE_ENDPOINT',
  'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
  'NEXT_PUBLIC_APPWRITE_DATABASE_ID',
  'NEXT_PUBLIC_APPWRITE_SUBMISSIONS_COLLECTION_ID'
];

async function testConnection() {
  console.log('🔍 Testing Appwrite Connection...\n');

  // Check environment variables
  console.log('📋 Checking Environment Variables:');
  let hasAllVars = true;
  
  REQUIRED_ENV_VARS.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value}`);
    } else {
      console.log(`❌ ${varName}: NOT SET`);
      hasAllVars = false;
    }
  });

  if (!hasAllVars) {
    console.error('\n❌ Missing required environment variables!');
    console.log('💡 Create .env.local file with required variables.');
    process.exit(1);
  }

  console.log('\n🔌 Testing Connection to Appwrite...');

  try {
    // Initialize client
    const client = new Client();
    client
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

    const account = new Account(client);

    // Try to get account info (will fail if not authenticated, but that's OK)
    try {
      const user = await account.get();
      console.log('✅ Successfully connected to Appwrite!');
      console.log(`👤 Logged in as: ${user.email}`);
    } catch (err) {
      if (err.code === 401) {
        console.log('✅ Successfully connected to Appwrite!');
        console.log('ℹ️  No active session (this is normal for this test)');
      } else {
        throw err;
      }
    }

    console.log('\n📊 Configuration Summary:');
    console.log(`   Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
    console.log(`   Project ID: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
    console.log(`   Database ID: ${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}`);
    console.log(`   Collection ID: ${process.env.NEXT_PUBLIC_APPWRITE_SUBMISSIONS_COLLECTION_ID}`);

    console.log('\n✨ All checks passed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Make sure these same variables are set in Vercel');
    console.log('   2. Add your Vercel domain to Appwrite Console → Settings → Platforms');
    console.log('   3. Deploy to Vercel and test login');

  } catch (error) {
    console.error('\n❌ Connection test failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Possible issues:');
      console.log('   - Check your internet connection');
      console.log('   - Verify NEXT_PUBLIC_APPWRITE_ENDPOINT is correct');
    } else if (error.code === 401) {
      console.log('\n💡 Possible issues:');
      console.log('   - Check NEXT_PUBLIC_APPWRITE_PROJECT_ID is correct');
      console.log('   - Verify project exists in Appwrite Console');
    }
    
    process.exit(1);
  }
}

testConnection();
