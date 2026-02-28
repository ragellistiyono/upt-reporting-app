import { Client, Account, Databases, Storage, ID, Permission, Role } from 'appwrite';

// Initialize Appwrite Client
export const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export utilities
export { ID, Permission, Role };

// Database and Collection IDs (from your PRD)
export const DATABASE_ID = 'db_kinerja_upt';
export const SUBMISSIONS_COLLECTION_ID = 'submissions';
