#!/usr/bin/env node

/**
 * User Creation Script for UPT Reporting System
 * 
 * This script helps create Admin and UPT users programmatically.
 * 
 * Prerequisites:
 * Set environment variables in .env.local:
 *   - APPWRITE_ENDPOINT
 *   - APPWRITE_PROJECT_ID
 *   - APPWRITE_API_KEY (with users.read and users.write permissions)
 * 
 * Usage:
 *   node scripts/create-users.js
 */

// Load environment variables from .env
require('dotenv').config();

const sdk = require('node-appwrite');
const readline = require('readline');

// Configuration
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';

// UPT Names
const UPT_NAMES = [
    'UPT Malang',
    'UPT Probolinggo',
    'UPT Surabaya',
    'UPT Madiun',
    'UPT Bali',
    'UPT Gresik'
];

// Initialize Appwrite Client
const client = new sdk.Client();
client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const users = new sdk.Users(client);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

/**
 * Create Admin User
 */
async function createAdminUser() {
    console.log('\n📋 Creating Admin User...\n');

    const email = await question('Admin Email (e.g., admin@pln.com): ');
    const password = await question('Admin Password: ');
    const name = await question('Admin Name (optional, press Enter to skip): ') || 'Admin User';

    try {
        const user = await users.create(
            sdk.ID.unique(),
            email,
            undefined, // phone
            password,
            name
        );

        console.log(`✓ User created: ${user.email} (ID: ${user.$id})`);

        // Add admin label
        await users.updateLabels(user.$id, ['admin']);
        console.log('✓ Label "admin" added');

        console.log(`\n✅ Admin user created successfully!\n`);
        return user;
    } catch (error) {
        console.error('❌ Failed to create admin user:', error.message);
        throw error;
    }
}

/**
 * Create UPT User
 */
async function createUPTUser(uptName) {
    console.log(`\n📋 Creating UPT User for: ${uptName}\n`);

    const defaultEmail = `${uptName.toLowerCase().replace(/\s+/g, '.')}@pln.com`;
    const email = await question(`Email (default: ${defaultEmail}): `) || defaultEmail;
    const password = await question('Password: ');
    const name = await question(`Name (default: ${uptName} User): `) || `${uptName} User`;

    try {
        const user = await users.create(
            sdk.ID.unique(),
            email,
            undefined, // phone
            password,
            name
        );

        console.log(`✓ User created: ${user.email} (ID: ${user.$id})`);

        // Add uptuser label
        await users.updateLabels(user.$id, ['uptuser']);
        console.log('✓ Label "uptuser" added');

        // Set UPT name in preferences
        await users.updatePrefs(user.$id, {
            upt_name: uptName
        });
        console.log(`✓ Preference "upt_name" set to: ${uptName}`);

        console.log(`\n✅ UPT user created successfully!\n`);
        return user;
    } catch (error) {
        console.error(`❌ Failed to create UPT user for ${uptName}:`, error.message);
        throw error;
    }
}

/**
 * Create all UPT users
 */
async function createAllUPTUsers() {
    console.log('\n🔄 Creating users for all UPTs...\n');
    
    const basePassword = await question('Set a base password for all UPT users: ');
    
    for (const uptName of UPT_NAMES) {
        console.log(`\n--- ${uptName} ---`);
        const defaultEmail = `${uptName.toLowerCase().replace(/\s+/g, '.')}@pln.com`;
        
        try {
            const user = await users.create(
                sdk.ID.unique(),
                defaultEmail,
                undefined,
                basePassword,
                `${uptName} User`
            );

            console.log(`✓ User created: ${user.email}`);

            await users.updateLabels(user.$id, ['uptuser']);
            await users.updatePrefs(user.$id, { upt_name: uptName });
            
            console.log(`✓ Configured for ${uptName}`);
            
        } catch (error) {
            console.error(`✗ Failed: ${error.message}`);
        }
    }
    
    console.log('\n✅ Batch user creation completed!\n');
}

/**
 * Main menu
 */
async function main() {
    console.log('🚀 UPT Reporting System - User Creation Tool\n');

    // Validate configuration
    if (!APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
        console.error('❌ Error: Missing required environment variables.');
        console.error('Please set APPWRITE_PROJECT_ID and APPWRITE_API_KEY\n');
        rl.close();
        process.exit(1);
    }

    console.log('What would you like to do?\n');
    console.log('1. Create Admin User');
    console.log('2. Create Single UPT User');
    console.log('3. Create All UPT Users (batch)');
    console.log('4. Exit\n');

    const choice = await question('Enter choice (1-4): ');

    try {
        switch (choice.trim()) {
            case '1':
                await createAdminUser();
                break;
            case '2':
                console.log('\nAvailable UPTs:');
                UPT_NAMES.forEach((name, index) => {
                    console.log(`${index + 1}. ${name}`);
                });
                const uptChoice = await question('\nSelect UPT (1-6) or enter custom name: ');
                const uptIndex = parseInt(uptChoice) - 1;
                const uptName = (uptIndex >= 0 && uptIndex < UPT_NAMES.length) 
                    ? UPT_NAMES[uptIndex] 
                    : uptChoice;
                await createUPTUser(uptName);
                break;
            case '3':
                await createAllUPTUsers();
                break;
            case '4':
                console.log('Goodbye!');
                break;
            default:
                console.log('Invalid choice');
        }
    } catch (error) {
        console.error('\n❌ An error occurred:', error.message);
    } finally {
        rl.close();
    }
}

// Run the script
main();
