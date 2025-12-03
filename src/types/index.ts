/**
 * TypeScript Type Definitions for UPT Reporting System
 */

// ============================================================================
// User Types
// ============================================================================

export type UserRole = 'admin' | 'uptuser';

export interface UserPreferences {
  upt_name?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface AppwriteUser {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  email: string;
  name: string;
  emailVerification: boolean;
  labels: string[];
  prefs: UserPreferences;
}

// ============================================================================
// Submission/Indicator Types
// ============================================================================

export const INDICATOR_TYPES = [
  'PUBLIKASI SIARAN PERS',
  'PRODUKSI KONTEN',
  'INFLUENCER DAN SMR',
  'KONTEN IN-CHANGE',
  'KONTEN WAG',
  'SKORING MEDIA MASSA DAN MEDIA SOSIAL'
] as const;

export type IndicatorType = typeof INDICATOR_TYPES[number];

export const SUB_CATEGORIES = [
  'INFLUENCER',
  'SMR'
] as const;

export type SubCategory = typeof SUB_CATEGORIES[number];

export const SKORING_MEDIA_SUB_CATEGORIES = [
  'MEDIA MASSA',
  'MEDIA SOSIAL'
] as const;

export type SkoringMediaSubCategory = typeof SKORING_MEDIA_SUB_CATEGORIES[number];

export const UPT_NAMES = [
  'UPT Malang',
  'UPT Probolinggo',
  'UPT Surabaya',
  'UPT Madiun',
  'UPT Bali',
  'UPT Gresik'
] as const;

export type UPTName = typeof UPT_NAMES[number];

// ============================================================================
// Database Document Types
// ============================================================================

/**
 * Submission document structure
 * Matches the Appwrite collection schema
 */
export interface Submission {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  indicator_type: IndicatorType;
  sub_category?: SubCategory | SkoringMediaSubCategory | null;
  submitted_by_upt: UPTName | string;
  submission_date: string; // ISO datetime string
  title?: string;
  narasi?: string;
  documentation_link?: string;
  link_media?: string | null; // For KONTEN IN-CHANGE and KONTEN WAG
  // Skoring Media fields
  skor_media_massa?: number | null;
  skor_media_sosial?: number | null;
  // Influencer/SMR common fields
  nomor_konten?: string | null;
  // Influencer fields (Instagram - 2 fields)
  link_instagram_1?: string | null;
  username_instagram_1?: string | null;
  link_instagram_2?: string | null;
  username_instagram_2?: string | null;
  // Influencer fields (Twitter/X - 2 fields)
  link_twitter_1?: string | null;
  username_twitter_1?: string | null;
  link_twitter_2?: string | null;
  username_twitter_2?: string | null;
  // Influencer fields (YouTube - 2 fields)
  link_youtube_1?: string | null;
  username_youtube_1?: string | null;
  link_youtube_2?: string | null;
  username_youtube_2?: string | null;
  // Influencer fields (TikTok - 1 field)
  link_tiktok?: string | null;
  username_tiktok?: string | null;
  // SMR fields (Facebook - 1 field)
  link_facebook?: string | null;
  username_facebook?: string | null;
  submitted_by_user: string; // Appwrite User ID
}

// ============================================================================
// Instruction Types (Admin -> UPT Instructions)
// ============================================================================

export const INSTRUCTION_STATUS = ['DRAFT', 'PUBLISHED'] as const;
export type InstructionStatus = typeof INSTRUCTION_STATUS[number];

/**
 * Instruction document structure
 * Admin creates instructions for UPT to follow
 * New simplified format: Google Drive link + captions for Instagram & Twitter
 */
export interface Instruction {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  status: InstructionStatus;
  indicator_type: 'INFLUENCER DAN SMR'; // Only for INFLUENCER/SMR
  sub_category: 'INFLUENCER' | 'SMR';
  target_type: 'ALL' | 'SPECIFIC'; // Broadcast or specific UPT
  target_upt?: string[]; // Array of UPT names (if SPECIFIC)
  created_by_user: string; // Admin User ID
  created_by_name: string; // Admin name for display
  published_at?: string | null; // ISO datetime when published
  // Simplified instruction content (4 fields only)
  title: string; // Judul Instruksi
  content_link: string; // Link Google Drive
  caption_instagram: string; // Caption untuk Instagram
  caption_twitter: string; // Caption untuk Twitter/X
}

/**
 * Form data for creating instruction
 * Simplified format with only 4 content fields
 */
export interface InstructionFormData {
  sub_category: 'INFLUENCER' | 'SMR' | '';
  target_type: 'ALL' | 'SPECIFIC';
  target_upt: string[];
  title: string; // Judul Instruksi
  content_link: string; // Link Google Drive
  caption_instagram: string; // Caption untuk Instagram
  caption_twitter: string; // Caption untuk Twitter/X
}

/**
 * Tracking which UPT users have read which instructions
 */
export interface InstructionReadStatus {
  $id: string;
  $createdAt: string;
  instruction_id: string;
  user_id: string;
  upt_name: string;
  read_at: string; // ISO datetime
}

// ============================================================================
// Target Types (Admin Performance Targets)
// ============================================================================

/**
 * Target document structure
 * Admin sets performance targets for each UPT per indicator
 */
export interface Target {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  upt_name: string; // UPT name (from UPT_NAMES)
  indicator_type: IndicatorType; // Indicator type
  target_value: number; // Target number (e.g., 48 submissions)
  year: number; // Year (e.g., 2025)
  semester: number; // Semester (1 or 2)
  month: number; // Month (0 = semester-based, 1-12 = specific month)
}

/**
 * Form data for creating/updating targets
 */
export interface TargetFormData {
  indicator_type: IndicatorType | '';
  year: number;
  semester: number;
  month: number;
  targets: {
    upt_name: string;
    target_value: number;
  }[];
}

/**
 * Form data for creating a new submission
 * (before being sent to Appwrite)
 */
export interface SubmissionFormData {
  indicator_type: IndicatorType;
  sub_category?: SubCategory | SkoringMediaSubCategory | '';
  submission_date: Date | string;
  title?: string;
  narasi?: string;
  documentation_link?: string;
  // Skoring Media fields
  skor_media_massa?: number | '';
  skor_media_sosial?: number | '';
  // Influencer/SMR common fields
  nomor_konten?: string;
  // Influencer/SMR social media fields
  link_instagram_1?: string;
  username_instagram_1?: string;
  link_instagram_2?: string;
  username_instagram_2?: string;
  link_twitter_1?: string;
  username_twitter_1?: string;
  link_twitter_2?: string;
  username_twitter_2?: string;
  link_youtube_1?: string;
  username_youtube_1?: string;
  link_youtube_2?: string;
  username_youtube_2?: string;
  link_tiktok?: string;
  username_tiktok?: string;
  link_facebook?: string;
  username_facebook?: string;
}

/**
 * Payload for creating a submission document
 * (what gets sent to Appwrite createDocument)
 */
export interface CreateSubmissionPayload {
  indicator_type: IndicatorType;
  sub_category?: SubCategory | SkoringMediaSubCategory | null;
  submitted_by_upt: string;
  submission_date: string; // ISO string
  title?: string;
  narasi?: string;
  documentation_link?: string;
  // New fields for Skoring Media
  skor_media_massa?: number | null;
  skor_media_sosial?: number | null;
  submitted_by_user: string;
}

// ============================================================================
// Filter & Query Types
// ============================================================================

export interface SubmissionFilters {
  upt?: UPTName | string;
  indicator_type?: IndicatorType;
  date_from?: string; // ISO date string
  date_to?: string; // ISO date string
  search?: string; // Search in title or narasi
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Response Types
// ============================================================================

export interface AppwriteListResponse<T> {
  total: number;
  documents: T[];
}

// Alias for submissions response (for convenience)
export type SubmissionsListResponse = AppwriteListResponse<Submission>;

// ============================================================================
// Auth Context Types
// ============================================================================

export interface AuthContextType {
  user: AppwriteUser | null;
  role: UserRole | null;
  uptName: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ============================================================================
// Form Validation Types
// ============================================================================

export interface FormErrors {
  indicator_type?: string;
  sub_category?: string;
  submission_date?: string;
  title?: string;
  narasi?: string;
  documentation_link?: string;
  skor_media_massa?: string;
  skor_media_sosial?: string;
  nomor_konten?: string;
  link_instagram_1?: string;
  username_instagram_1?: string;
  link_instagram_2?: string;
  username_instagram_2?: string;
  link_twitter_1?: string;
  username_twitter_1?: string;
  link_twitter_2?: string;
  username_twitter_2?: string;
  link_youtube_1?: string;
  username_youtube_1?: string;
  link_youtube_2?: string;
  username_youtube_2?: string;
  link_tiktok?: string;
  username_tiktok?: string;
  link_facebook?: string;
  username_facebook?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiError {
  code: number;
  message: string;
  type?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface DashboardProps {
  role: UserRole;
  uptName?: string;
}

export interface SubmissionFormProps {
  onSuccess?: (submission: Submission) => void;
  onCancel?: () => void;
}

export interface SubmissionTableProps {
  submissions: Submission[];
  isLoading?: boolean;
  onEdit?: (submission: Submission) => void;
  onDelete?: (submissionId: string) => void;
  showActions?: boolean;
}

export interface FilterPanelProps {
  filters: SubmissionFilters;
  onFilterChange: (filters: SubmissionFilters) => void;
  onReset: () => void;
}

// ============================================================================
// Utility Types
// ============================================================================

export type OmitAppwriteFields<T> = Omit<T, '$id' | '$createdAt' | '$updatedAt' | '$permissions'>;
