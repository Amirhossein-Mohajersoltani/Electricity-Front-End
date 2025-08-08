// src/types/filterInterfaces.ts - Filter interfaces for dynamic filtering system

// ===========================================
// CORE FILTER INTERFACES
// ===========================================

/**
 * Dynamic filter data structure used by DynamicFilterPanel
 */
export interface DynamicFilterData {
  id: string;
  name: string;
  color: string;
  
  // Date and period fields
  startDate: string;
  endDate: string;
  period?: 'weekly' | 'monthly' | 'yearly' | 'custom';
  costume_period?: string;

  // Fields for public companies (regions and feeders)
  regions: (string | number)[];
  feeders: string[];

  // Field for private companies
  companyNames: string[];
}

// ===========================================
// CHART DATA INTERFACES
// ===========================================

/**
 * Basic result structure for chart data points
 */
export interface BaseResult {
  result: unknown[];
  status?: string;
  company_id?: number[];
  fidder_code?: string | null;
  region_code?: number[];
}

/**
 * Daily peak analysis result structure
 */
export interface DailyPeakResult {
  date: string;
  amount: number;
}

export interface DailyPeakData extends BaseResult {
  result: DailyPeakResult[];
}

/**
 * Weekly peak analysis result structure
 */
export interface WeeklyPeakResult {
  num_week: number;
  max_week: number;
  start_date?: string;
  end_date?: string;
}

export interface WeeklyPeakData extends BaseResult {
  result: WeeklyPeakResult[];
}

/**
 * Daily profile analysis result structure
 */
export interface DailyProfileResult {
  hour: string;
  amount: number;
}

export interface DailyProfileData extends BaseResult {
  result: DailyProfileResult[];
  method?: 'max' | 'mean';
}

/**
 * Load continuity analysis result structure
 */
export interface LoadContinuityValueItem {
  date: string;
  hour: number;
  value: number;
}

export interface LoadContinuityResult {
  fidder: string | number;
  sort_value: LoadContinuityValueItem[] | number[];
  start_date?: string;
  end_date?: string;
}

export interface LoadContinuityData extends BaseResult {
  result: LoadContinuityResult[];
}

/**
 * Long term analysis result structure
 */
export interface LongTermResult {
  week: number;
  amount: number;
  'start date'?: string;
  'end date'?: string;
}

export interface LongTermData extends BaseResult {
  result: LongTermResult[];
}

// ===========================================
// UNIFIED FILTER DATA STRUCTURE
// ===========================================

/**
 * Complete filter data structure containing all analysis types
 * This matches the API response structure for both public and private companies
 */
export interface FilterDataStructure {
  daily_peak: DailyPeakData;
  weekly_peak: WeeklyPeakData;
  daily_profile_max: DailyProfileData;
  daily_profile_mean: DailyProfileData;
  load_continuity: LoadContinuityData;
  Load_continuity: LoadContinuityData; // Fallback for inconsistent naming
  long_term: LongTermData;
  
  // Additional fields that might be present
  company_id?: number[];
  fidder_code?: string | null;
  region_code?: number[];
}

/**
 * Multi-filter analysis data - maps filter ID to its data structure
 */
export interface MultiFilterAnalysisData {
  [filterId: string]: FilterDataStructure;
}

// ===========================================
// PRIVATE COMPANY SPECIFIC INTERFACES
// ===========================================

/**
 * Private company analysis request structure
 */
export interface PrivateCompanyAnalysisRequest {
  company_names: string[];
  start_date: string;
  end_date: string;
}

/**
 * Private company analysis response structure
 * The API returns data nested by company name
 */
export interface PrivateCompanyAnalysisResponse {
  [companyName: string]: FilterDataStructure;
}

// ===========================================
// CHART COMPONENT INTERFACES
// ===========================================

/**
 * Chart types supported by MultiFilterChart
 */
export type ChartType = 
  | 'daily_peak' 
  | 'weekly_peak' 
  | 'daily_profile_max' 
  | 'daily_profile_mean' 
  | 'load_continuity' 
  | 'long_term';

/**
 * Props for MultiFilterChart component
 */
export interface MultiFilterChartProps {
  multiData: MultiFilterAnalysisData;
  filters: DynamicFilterData[];
  chartType: ChartType;
  loading?: boolean;
  title?: string;
  parallelMode?: boolean;
  company?: string;
}

/**
 * Chart data point for rendering
 */
export interface ChartDataPoint {
  key: string;
  value: number;
  resultIndex?: number;
  originalData?: unknown;
  source?: string;
}

// ===========================================
// UTILITY INTERFACES
// ===========================================

/**
 * Filter validation result
 */
export interface FilterValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Filter export/import structure
 */
export interface FilterExportData {
  version: string;
  timestamp: string;
  filters: DynamicFilterData[];
  metadata?: {
    companyType: string;
    exportedBy?: string;
  };
}

// ===========================================
// LEGACY COMPATIBILITY INTERFACES
// ===========================================

/**
 * Legacy filter data structure for backward compatibility
 */
export interface LegacyFilterData {
  regions?: string[];
  feeders?: string[];
  startDate?: string;
  endDate?: string;
  dateRange?: string;
  customDays?: string;
}

// ===========================================
// API RESPONSE WRAPPERS
// ===========================================

/**
 * Wrapped API response for filter data
 */
export interface FilterApiResponse<T = FilterDataStructure> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

/**
 * Multi-filter API response structure
 */
export interface MultiFilterApiResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    [filterId: string]: FilterDataStructure;
  };
}

// ===========================================
// TYPE GUARDS AND UTILITIES
// ===========================================

/**
 * Type guard to check if data is a valid FilterDataStructure
 */
export const isFilterDataStructure = (data: unknown): data is FilterDataStructure => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'daily_peak' in data &&
    'weekly_peak' in data
  );
};

/**
 * Type guard to check if data is private company response
 */
export const isPrivateCompanyResponse = (data: unknown): data is PrivateCompanyAnalysisResponse => {
  if (typeof data !== 'object' || data === null) return false;
  
  const keys = Object.keys(data);
  return keys.length > 0 && keys.every(key => 
    typeof key === 'string' && 
    isFilterDataStructure((data as Record<string, unknown>)[key])
  );
};

/**
 * Utility type for extracting chart data from filter structure
 */
export type ChartDataExtractor<T extends ChartType> = 
  T extends 'daily_peak' ? DailyPeakData :
  T extends 'weekly_peak' ? WeeklyPeakData :
  T extends 'daily_profile_max' | 'daily_profile_mean' ? DailyProfileData :
  T extends 'load_continuity' ? LoadContinuityData :
  T extends 'long_term' ? LongTermData :
  never;

// ===========================================
// EXPORT ALL TYPES
// ===========================================

// export type {
//   // Core types
//   DynamicFilterData,
//   FilterDataStructure,
//   MultiFilterAnalysisData,
  
//   // Chart types
//   ChartType,
//   ChartDataPoint,
//   MultiFilterChartProps,
  
//   // Result types
//   DailyPeakResult,
//   WeeklyPeakResult,
//   DailyProfileResult,
//   LoadContinuityResult,
//   LongTermResult,
  
//   // Data types
//   DailyPeakData,
//   WeeklyPeakData,
//   DailyProfileData,
//   LoadContinuityData,
//   LongTermData,
  
//   // Private company types
//   PrivateCompanyAnalysisRequest,
//   PrivateCompanyAnalysisResponse,
  
//   // API types
//   FilterApiResponse,
//   MultiFilterApiResponse,
  
//   // Utility types
//   FilterValidationResult,
//   FilterExportData,
//   LegacyFilterData
// };