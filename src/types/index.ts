/**
 * TypeScript Type Definitions for UPT Reporting System
 */

// ============================================================================
// User Types
// ============================================================================

export type UserRole = 'admin' | 'upt_user';

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
  'KONTEN WAG'
] as const;

export type IndicatorType = typeof INDICATOR_TYPES[number];

export const SUB_CATEGORIES = [
  'INFLUENCER',
  'SMR'
] as const;

export type SubCategory = typeof SUB_CATEGORIES[number];

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
  sub_category?: SubCategory | null;
  submitted_by_upt: UPTName | string;
  submission_date: string; // ISO datetime string
  title: string;
  narasi: string;
  documentation_link: string;
  submitted_by_user: string; // Appwrite User ID
}

/**
 * Form data for creating a new submission
 * (before being sent to Appwrite)
 */
export interface SubmissionFormData {
  indicator_type: IndicatorType;
  sub_category?: SubCategory | '';
  submission_date: Date | string;
  title: string;
  narasi: string;
  documentation_link: string;
}

/**
 * Payload for creating a submission document
 * (what gets sent to Appwrite createDocument)
 */
export interface CreateSubmissionPayload {
  indicator_type: IndicatorType;
  sub_category?: SubCategory | null;
  submitted_by_upt: string;
  submission_date: string; // ISO string
  title: string;
  narasi: string;
  documentation_link: string;
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
