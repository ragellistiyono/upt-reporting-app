#!/usr/bin/env node

/**
 * Appwrite Database Setup Script for UPT Reporting System
 * 
 * This script configures the Appwrite database, collections, and attributes
 * programmatically using the Appwrite Node.js Server SDK.
 * 
 * Prerequisites:
 * 1. Create an Appwrite project at https://cloud.appwrite.io
 * 2. Generate an API Key with the following scopes:
 *    - databases.write
 *    - collections.write
 *    - attributes.write
 * 3. Set environment variables in .env.local:
 *    - APPWRITE_ENDPOINT
 *    - APPWRITE_PROJECT_ID
 *    - APPWRITE_API_KEY
 * 
 * Usage:
 *   node scripts/setup-appwrite.js
 */

// Load environment variables from .env
require('dotenv').config();

const sdk = require('node-appwrite');

// Configuration - Update these or set as environment variables
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';

// Database and Collection IDs (matching your PRD)
const DATABASE_ID = 'db_kinerja_upt';
const DATABASE_NAME = 'Kinerja UPT';
const SUBMISSIONS_COLLECTION_ID = 'submissions';
const SUBMISSIONS_COLLECTION_NAME = 'Indicator Submissions';

// Initialize Appwrite Client
const client = new sdk.Client();
client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

/**
 * Main setup function
 */
async function setupAppwrite() {
    console.log('🚀 Starting Appwrite Database Setup...\n');

    // Validate configuration
    if (!APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
        console.error('❌ Error: Missing required environment variables.');
        console.error('Please set APPWRITE_PROJECT_ID and APPWRITE_API_KEY\n');
        process.exit(1);
    }

    try {
        // Step 1: Create Database
        await createDatabase();

        // Step 2: Create Collection
        await createCollection();

        // Step 3: Create Attributes
        await createAttributes();

        console.log('\n✅ Appwrite setup completed successfully!');
        console.log('\n📋 Next Steps:');
        console.log('1. Configure Email/Password authentication in Appwrite Console');
        console.log('2. Add custom user attributes (role, upt_name) via Appwrite Console');
        console.log('   - Note: Custom auth attributes must be added via the Console UI');
        console.log('3. Configure collection permissions (see PERMISSIONS.md)');
        console.log('4. Create initial user accounts for Admin and UPT users\n');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
        process.exit(1);
    }
}

/**
 * Create the database
 */
async function createDatabase() {
    console.log('📁 Creating database...');
    try {
        const database = await databases.create(
            DATABASE_ID,
            DATABASE_NAME
        );
        console.log(`✓ Database created: ${database.name} (ID: ${database.$id})`);
    } catch (error) {
        if (error.code === 409) {
            console.log(`✓ Database already exists: ${DATABASE_ID}`);
        } else {
            throw error;
        }
    }
}

/**
 * Create the submissions collection
 */
async function createCollection() {
    console.log('\n📦 Creating collection...');
    try {
        const collection = await databases.createCollection(
            DATABASE_ID,
            SUBMISSIONS_COLLECTION_ID,
            SUBMISSIONS_COLLECTION_NAME,
            [
                // Collection-level permissions
                // Note: These will need to be configured in the Appwrite Console
                // or via a separate script with the Permission and Role classes
                sdk.Permission.read(sdk.Role.any()), // Temporary - will be updated
                sdk.Permission.create(sdk.Role.any()), // Temporary - will be updated
            ],
            true, // documentSecurity: true - Enable document-level permissions
            true  // enabled: true
        );
        console.log(`✓ Collection created: ${collection.name} (ID: ${collection.$id})`);
        console.log(`  Document Security: ${collection.documentSecurity ? 'Enabled' : 'Disabled'}`);
    } catch (error) {
        if (error.code === 409) {
            console.log(`✓ Collection already exists: ${SUBMISSIONS_COLLECTION_ID}`);
        } else {
            throw error;
        }
    }
}

/**
 * Create all required attributes for the submissions collection
 */
async function createAttributes() {
    console.log('\n🏷️  Creating attributes...');

    const attributes = [
        {
            type: 'string',
            key: 'indicator_type',
            size: 100,
            required: true,
            description: 'Type of indicator (PUBLIKASI SIARAN PERS, PRODUKSI KONTEN, etc.)'
        },
        {
            type: 'string',
            key: 'sub_category',
            size: 100,
            required: false,
            description: 'Sub-category (INFLUENCER or SMR) - only for INFLUENCER DAN SMR'
        },
        {
            type: 'string',
            key: 'submitted_by_upt',
            size: 100,
            required: true,
            description: 'Name of the UPT submitting (e.g., UPT Probolinggo)'
        },
        {
            type: 'datetime',
            key: 'submission_date',
            required: true,
            description: 'Date of submission'
        },
        {
            type: 'string',
            key: 'title',
            size: 255,
            required: true,
            description: 'Title of the submission'
        },
        {
            type: 'string',
            key: 'narasi',
            size: 5000,
            required: true,
            description: 'Narration/description text'
        },
        {
            type: 'string',
            key: 'documentation_link',
            size: 2000,
            required: true,
            description: 'URL link to documentation'
        },
        {
            type: 'string',
            key: 'submitted_by_user',
            size: 100,
            required: true,
            description: 'Appwrite User ID of the submitter (for relationships)'
        }
    ];

    for (const attr of attributes) {
        try {
            let result;
            
            if (attr.type === 'string') {
                result = await databases.createStringAttribute(
                    DATABASE_ID,
                    SUBMISSIONS_COLLECTION_ID,
                    attr.key,
                    attr.size,
                    attr.required,
                    attr.default || null,
                    false // array
                );
            } else if (attr.type === 'datetime') {
                await databases.createDatetimeAttribute(
                    DATABASE_ID,
                    SUBMISSIONS_COLLECTION_ID,
                    attr.key,
                    attr.required,
                    null, // default
                    false // array
                );
            }

            console.log(`  ✓ Created: ${attr.key} (${attr.type}) - ${attr.description}`);
            
            // Wait a bit between attribute creations to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            if (error.code === 409) {
                console.log(`  ✓ Already exists: ${attr.key}`);
            } else {
                console.error(`  ✗ Failed to create ${attr.key}:`, error.message);
            }
        }
    }
}

// Run the setup
setupAppwrite();
