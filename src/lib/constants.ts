/**
 * Application Constants
 * 
 * Centralized constants for the UPT Reporting System
 */

// ============================================================================
// Performance Indicator Types
// ============================================================================

export const INDICATOR_TYPES = [
  'PUBLIKASI SIARAN PERS',
  'PRODUKSI KONTEN',
  'INFLUENCER DAN SMR',
  'KONTEN IN-CHANGE',
  'KONTEN WAG',
  'SKORING MEDIA MASSA DAN MEDIA SOSIAL'
] as const;

export const INDICATOR_TYPE_LABELS: Record<string, string> = {
  'PUBLIKASI SIARAN PERS': 'Publikasi Siaran Pers',
  'PRODUKSI KONTEN': 'Produksi Konten',
  'INFLUENCER DAN SMR': 'Influencer dan SMR',
  'KONTEN IN-CHANGE': 'Konten In-Change',
  'KONTEN WAG': 'Konten WAG',
  'SKORING MEDIA MASSA DAN MEDIA SOSIAL': 'Skoring Media Massa dan Media Sosial'
};

// ============================================================================
// Sub-Categories (for INFLUENCER DAN SMR)
// ============================================================================

export const SUB_CATEGORIES = [
  'INFLUENCER',
  'SMR'
] as const;

export const SUB_CATEGORY_LABELS: Record<string, string> = {
  'INFLUENCER': 'Influencer',
  'SMR': 'SMR'
};

// ============================================================================
// Sub-Categories for Skoring Media
// ============================================================================

export const SKORING_MEDIA_SUB_CATEGORIES = [
  'MEDIA MASSA',
  'MEDIA SOSIAL'
] as const;

export const SKORING_MEDIA_SUB_CATEGORY_LABELS: Record<string, string> = {
  'MEDIA MASSA': 'Media Massa',
  'MEDIA SOSIAL': 'Media Sosial'
};

// ============================================================================
// UPT Names
// ============================================================================

export const UPT_NAMES = [
  'UPT Malang',
  'UPT Probolinggo',
  'UPT Surabaya',
  'UPT Madiun',
  'UPT Bali',
  'UPT Gresik'
] as const;

// ============================================================================
// User Roles
// ============================================================================

export const USER_ROLES = {
  ADMIN: 'admin',
  UPT_USER: 'uptuser'
} as const;

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  uptuser: 'UPT User'
};

// ============================================================================
// Appwrite Configuration
// ============================================================================

export const APPWRITE_CONFIG = {
  DATABASE_ID: 'db_kinerja_upt',
  COLLECTIONS: {
    SUBMISSIONS: 'submissions',
    INSTRUCTIONS: 'instructions',
    INSTRUCTION_READS: 'instruction_reads',
    TARGETS: 'targets'
  }
} as const;

// ============================================================================
// Instruction Status
// ============================================================================

export const INSTRUCTION_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED'
} as const;

export const INSTRUCTION_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published'
};

export const INSTRUCTION_TARGET_TYPE = {
  ALL: 'ALL',
  SPECIFIC: 'SPECIFIC'
} as const;

export const INSTRUCTION_TARGET_TYPE_LABELS: Record<string, string> = {
  ALL: 'Semua UPT',
  SPECIFIC: 'UPT Tertentu'
};

// ============================================================================
// Validation Rules
// ============================================================================

export const VALIDATION_RULES = {
  TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 255
  },
  NARASI: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 5000
  },
  DOCUMENTATION_LINK: {
    MAX_LENGTH: 2000,
    PATTERN: /^https?:\/\/.+/i
  }
} as const;

// ============================================================================
// UI Constants
// ============================================================================

export const ITEMS_PER_PAGE = 10;

export const DATE_FORMAT = {
  DISPLAY: 'dd MMM yyyy',
  ISO: 'yyyy-MM-dd',
  DATETIME: 'dd MMM yyyy HH:mm'
} as const;

// ============================================================================
// Messages
// ============================================================================

export const MESSAGES = {
  SUCCESS: {
    SUBMISSION_CREATED: 'Laporan berhasil dikirim!',
    SUBMISSION_UPDATED: 'Laporan berhasil diperbarui!',
    SUBMISSION_DELETED: 'Laporan berhasil dihapus!',
    LOGIN: 'Login berhasil!',
    LOGOUT: 'Logout berhasil!'
  },
  ERROR: {
    GENERIC: 'Terjadi kesalahan. Silakan coba lagi.',
    UNAUTHORIZED: 'Anda tidak memiliki akses ke halaman ini.',
    INVALID_CREDENTIALS: 'Email atau password salah.',
    NETWORK: 'Koneksi bermasalah. Periksa internet Anda.',
    REQUIRED_FIELD: 'Field ini wajib diisi.',
    INVALID_URL: 'URL tidak valid. Harus dimulai dengan http:// atau https://',
    PERMISSION_DENIED: 'Anda tidak memiliki izin untuk melakukan aksi ini.'
  },
  CONFIRM: {
    DELETE: 'Apakah Anda yakin ingin menghapus laporan ini?',
    LOGOUT: 'Apakah Anda yakin ingin logout?'
  }
} as const;

// ============================================================================
// Route Paths
// ============================================================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin',
  SUBMIT: '/submit',
  SUBMISSIONS: '/submissions'
} as const;

// ============================================================================
// Export Types
// ============================================================================

export type IndicatorType = typeof INDICATOR_TYPES[number];
export type SubCategory = typeof SUB_CATEGORIES[number];
export type UPTName = typeof UPT_NAMES[number];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
