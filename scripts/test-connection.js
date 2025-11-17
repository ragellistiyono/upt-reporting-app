#!/usr/bin/env node

/**
 * Test Appwrite Connection
 */

// Load environment variables from .env
require('dotenv').config();

const sdk = require('node-appwrite');

// Load from environment
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;

console.log('🔍 Testing Appwrite Connection...\n');
console.log('Environment Variables:');
console.log('  APPWRITE_ENDPOINT:', APPWRITE_ENDPOINT);
console.log('  APPWRITE_PROJECT_ID:', APPWRITE_PROJECT_ID);
console.log('  APPWRITE_API_KEY:', APPWRITE_API_KEY ? `${APPWRITE_API_KEY.substring(0, 20)}...` : 'NOT SET');
console.log('');

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
    console.error('❌ Missing environment variables!');
    console.error('Make sure to set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, and APPWRITE_API_KEY\n');
    process.exit(1);
}

const client = new sdk.Client();
client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

async function testConnection() {
    try {
        console.log('📡 Testing connection to Appwrite...');
        const result = await databases.list();
        console.log('✅ Connection successful!');
        console.log(`✅ Found ${result.total} database(s)\n`);
        
        if (result.total > 0) {
            console.log('Existing databases:');
            result.databases.forEach(db => {
                console.log(`  - ${db.name} (ID: ${db.$id})`);
            });
        }
        
        return true;
    } catch (error) {
        console.error('❌ Connection failed!');
        console.error('Error:', error.message);
        console.error('Error code:', error.code);
        console.error('Error type:', error.type);
        console.error('\n💡 Troubleshooting:');
        console.error('1. Verify Project ID is correct in Appwrite Console');
        console.error('2. Verify API Key has "databases.read" scope');
        console.error('3. Check if endpoint URL is correct for your region');
        console.error('4. Make sure the API key belongs to this project\n');
        return false;
    }
}

testConnection();
