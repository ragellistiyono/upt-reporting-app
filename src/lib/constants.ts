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
  'PRODUKSI KONTEN MEDIA SOSIAL UNIT',
  'SKORING MEDIA MASSA DAN MEDIA SOSIAL',
  'PENGELOLAAN INFLUENCER MEDIA SOSIAL UNIT',
  'KONTEN VIDEO IN-CHANGE',
  'PENGELOLAAN KOMUNIKASI INTERNAL'
] as const;

export const INDICATOR_TYPE_LABELS: Record<string, string> = {
  'PUBLIKASI SIARAN PERS': 'Publikasi Siaran Pers',
  'PRODUKSI KONTEN MEDIA SOSIAL UNIT': 'Produksi Konten Media Sosial Unit',
  'SKORING MEDIA MASSA DAN MEDIA SOSIAL': 'Skoring Media Massa dan Media Sosial',
  'PENGELOLAAN INFLUENCER MEDIA SOSIAL UNIT': 'Pengelolaan Influencer Media Sosial Unit',
  'KONTEN VIDEO IN-CHANGE': 'Konten Video In-Change',
  'PENGELOLAAN KOMUNIKASI INTERNAL': 'Pengelolaan Komunikasi Internal'
};

// ============================================================================
// Month Constants
// ============================================================================

export const MONTHS = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' }
] as const;

// ============================================================================
// Sub-Categories (for PENGELOLAAN INFLUENCER MEDIA SOSIAL UNIT)
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

// UPT_LIST alias for compatibility
export const UPT_LIST = UPT_NAMES;

// ============================================================================
// Indicator Categories (for dropdown selection)
// ============================================================================

export const INDICATOR_CATEGORIES = [
  { value: 'PUBLIKASI SIARAN PERS', label: 'Publikasi Siaran Pers' },
  { value: 'PRODUKSI KONTEN MEDIA SOSIAL UNIT', label: 'Produksi Konten Media Sosial Unit' },
  { value: 'SKORING MEDIA MASSA DAN MEDIA SOSIAL', label: 'Skoring Media Massa dan Media Sosial' },
  { value: 'PENGELOLAAN INFLUENCER MEDIA SOSIAL UNIT', label: 'Pengelolaan Influencer Media Sosial Unit' },
  { value: 'KONTEN VIDEO IN-CHANGE', label: 'Konten Video In-Change' },
  { value: 'PENGELOLAAN KOMUNIKASI INTERNAL', label: 'Pengelolaan Komunikasi Internal' }
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
    TARGETS: 'targets',
    PERFORMANCE_TARGETS: 'performance_targets'
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
    INVALID_CREDENTIALS: 'Username atau password salah.',
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
