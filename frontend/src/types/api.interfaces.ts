// src/types/api.interfaces.ts - COMPLETE TYPE DEFINITIONS FOR ELECTRICITY COMPANY PROJECT

// ===========================================
// CORE API INTERFACES
// ===========================================

/**
 * Standard API response wrapper for all backend calls
 */
export interface ApiResponse<T = unknown> {
    status: 'success' | 'error';
    message: string;
    data?: T;
  }
  
  /**
   * Generic response wrapper for flexible API endpoints
   */
  export interface GenericApiResponse<T> {
    status?: string;
    message?: string;
    data?: T;
  }
  
  /**
   * Extended Navigator interface for connection property
   */
  export interface NavigatorWithConnection extends Navigator {
    connection?: {
      effectiveType?: string;
    };
  }
  
  /**
   * Type for logging data across the application
   */
  export type LogData = Record<string, unknown> | string | number | boolean | null | undefined;
  
  // ===========================================
  // AUTHENTICATION INTERFACES
  // ===========================================
  
  /**
   * Login request payload
   */
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  /**
   * Authentication response data
   */
  export interface AuthResponse {
    authenticated: boolean;
    email: string;
    company: string;
  }
  
  /**
   * Authentication check response data
   */
  export interface AuthCheckResponse {
    authenticated: boolean;
    email?: string;
    company?: string;
  }
  
  /**
   * Dashboard response data
   */
  export interface DashboardResponse {
    email: string;
  }
  
  // ===========================================
  // FILTER AND REQUEST INTERFACES
  // ===========================================
  
  /**
   * Base filter request for analysis endpoints
   */
  export interface FilterRequest {
    fidder_code: string;
    start_date: string;
    end_date: string;
    region_code: string;
  }
  
  /**
   * Extended filter request with arrays for multiple selections
   */
  export interface FilterRequestArray {
    fidder_code: string[];
    region_code: string[];
    start_date: string;
    end_date: string;
  }
  
  /**
   * Feeder/Region request for data retrieval
   */
  export interface FeederRegionRequest {
    region_code?: string | string[];
    fidder_code?: string;
  }
  
  /**
   * Consumption distribution specific request
   */
  export interface ConsumptionDistributionRequest {
    fidder_code: string[];
    region_code: string[];
    start_date: string;
    end_date: string;
  }
  
  /**
   * Energy comparison request with year support
   */
  export interface EnergyComparisonRequest {
    year: string[];
    region_code: string[];
    fidder_code: string[];
  }
  
  /**
   * Consumption limitation analysis request
   */
  export interface ConsumptionLimitationRequest {
    fidder_code: string[];
    region_code: string[];
    no_limitation_start_date: string;
    no_limitation_end_date: string;
    limitation_start_date: string;
    limitation_end_date: string;
  }
  
  // ===========================================
  // FEEDER AND REGION INTERFACES
  // ===========================================
  
  /**
   * Feeder and region response data
   */
  export interface FeederRegionResponse {
    region_code?: string;
    fidders?: string[];
    fidder_code?: string;
    regions?: string[];
    region_codes?: string[];
    region_fidder_map?: Record<string, string[]>;
    total_fidders?: number;
  }
  
  // ===========================================
  // ANALYSIS RESPONSE INTERFACES
  // ===========================================
  
  /**
   * Daily peak analysis response
   */
  export interface DailyPeakResponse {
    dates: string[];
    peak_values: number[];
    peak_times: string[];
    average_peak: number;
  }
  
  /**
   * Weekly peak analysis response
   */
  export interface WeeklyPeakResponse {
    weeks: string[];
    peak_values: number[];
    comparison_data: {
      current_week: number;
      previous_week: number;
      change_percentage: number;
    };
  }
  
  /**
   * Load continuity analysis response
   */
  export interface LoadContinuityResponse {
    continuity_percentage: number;
    outage_events: OutageEvent[];
    reliability_metrics: ReliabilityMetrics;
  }
  
  /**
   * Outage event details
   */
  export interface OutageEvent {
    date: string;
    duration: number;
    cause: string;
  }
  
  /**
   * Reliability metrics for load continuity
   */
  export interface ReliabilityMetrics {
    saifi: number; // System Average Interruption Frequency Index
    saidi: number; // System Average Interruption Duration Index
    caidi: number; // Customer Average Interruption Duration Index
  }
  
  /**
   * Consumption distribution analysis response
   */
  export interface ConsumptionDistributionResponse {
    tariff_distribution: TariffDistribution;
    total_consumption: number;
    region_code: string;
  }
  
  /**
   * Tariff distribution breakdown
   */
  export interface TariffDistribution {
    residential: number;
    industrial: number;
    commercial: number;
    agricultural: number;
    lighting: number;
    administrative: number;
  }
  
  /**
   * Energy comparison analysis response
   */
  export interface EnergyComparisonResponse {
    feeder_comparison: FeederComparison[];
    time_comparison: TimeComparison;
  }
  
  /**
   * Individual feeder comparison data
   */
  export interface FeederComparison {
    feeder_code: string;
    consumption: number;
    efficiency: number;
  }
  
  /**
   * Time-based comparison data
   */
  export interface TimeComparison {
    current_period: number;
    previous_period: number;
    change_percentage: number;
  }
  
  // ===========================================
  // DAILY PROFILE INTERFACES
  // ===========================================
  
  /**
   * Daily profile data structure
   */
  export interface DailyProfileData {
    result: DailyProfileHour[];
  }
  
  /**
   * Hourly data point for daily profiles
   */
  export interface DailyProfileHour {
    hour: string;
    amount: number;
  }
  
  // ===========================================
  // COMPREHENSIVE ANALYSIS INTERFACES
  // ===========================================
  
  /**
   * Complete feeder analysis response combining all analysis types
   */
  export interface FeederAnalysisResponse {
    daily_peak: DailyPeakData;
    daily_profil_max: DailyProfileData;
    daily_profil_mean: DailyProfileData;
    Load_continuity: LoadContinuityData;
    long_term: LongTermData;
    weekly_peak: WeeklyPeakData;
  }
  
  /**
   * Daily peak data structure for feeder analysis
   */
  export interface DailyPeakData {
    result: DailyPeakEntry[];
  }
  
  /**
   * Individual daily peak entry
   */
  export interface DailyPeakEntry {
    date: string;
    amount: number;
  }
  
  /**
   * Load continuity data structure
   */
  export interface LoadContinuityData {
    result: LoadContinuityEntry[];
  }
  
  /**
   * Individual load continuity entry
   */
  export interface LoadContinuityEntry {
    fidder: string;
    sort_value: number[];
  }
  
  /**
   * Long-term analysis data structure
   */
  export interface LongTermData {
    result: LongTermYearData[];
  }
  
  /**
   * Long-term data for a specific year
   */
  export interface LongTermYearData {
    [year: string]: LongTermWeekEntry[];
  }
  
  /**
   * Weekly entry for long-term analysis
   */
  export interface LongTermWeekEntry {
    week: number;
    amount: number;
  }
  
  /**
   * Weekly peak data structure
   */
  export interface WeeklyPeakData {
    result: WeeklyPeakEntry[];
  }
  
  /**
   * Individual weekly peak entry
   */
  export interface WeeklyPeakEntry {
    num_week: number;
    max_week: number;
  }
  
  // ===========================================
  // FILE UPLOAD INTERFACES
  // ===========================================
  
  /**
   * CSV upload response data
   */
  export interface UploadResponse {
    added: number;
    updated: number;
    skipped: number;
  }
  
  /**
   * File upload progress tracking
   */
  export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
  }
  
  // ===========================================
  // CHART DATA INTERFACES
  // ===========================================
  
  /**
   * Chart data point for time-series charts
   */
  export interface ChartDataPoint {
    x: string | number;
    y: number;
    label?: string;
  }
  
  /**
   * Chart series for multi-series charts
   */
  export interface ChartSeries {
    name: string;
    data: ChartDataPoint[];
    color?: string;
  }
  
  /**
   * Chart configuration options
   */
  export interface ChartOptions {
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    showLegend?: boolean;
    showGrid?: boolean;
    responsive?: boolean;
  }
  
  // ===========================================
  // ERROR INTERFACES
  // ===========================================
  
  /**
   * Structured error response
   */
  export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp?: string;
  }
  
  /**
   * Network error details
   */
  export interface NetworkError {
    type: 'CORS' | 'TIMEOUT' | 'CONNECTION' | 'UNKNOWN';
    url: string;
    status?: number;
    message: string;
  }
  
  // ===========================================
  // UTILITY INTERFACES
  // ===========================================
  
  /**
   * Date range for filtering
   */
  export interface DateRange {
    start_date: string;
    end_date: string;
  }
  
  /**
   * Shamsi (Persian) date utilities
   */
  export interface ShamsiDate {
    year: number;
    month: number;
    day: number;
    formatted: string;
  }
  
  /**
   * Pagination parameters
   */
  export interface PaginationParams {
    page: number;
    limit: number;
    total?: number;
  }
  
  /**
   * Sorting parameters
   */
  export interface SortParams {
    field: string;
    order: 'asc' | 'desc';
  }
  
  // ===========================================
  // CONFIGURATION INTERFACES
  // ===========================================
  
  /**
   * API configuration
   */
  export interface ApiConfig {
    baseUrl: string;
    timeout: number;
    retries: number;
    debug: boolean;
  }
  
  /**
   * Environment configuration
   */
  export interface EnvConfig {
    NODE_ENV: 'development' | 'production' | 'test';
    API_BASE_URL: string;
    DEBUG_MODE: boolean;
  }
  
  // ===========================================
  // SESSION AND STORAGE INTERFACES
  // ===========================================
  
  /**
   * Session information
   */
  export interface SessionInfo {
    sessionId?: string;
    userId?: string;
    email?: string;
    company?: string;
    loginTime?: string;
    lastActivity?: string;
  }
  
  /**
   * Storage data structure
   */
  export interface StorageData {
    localStorage: Record<string, string | null>;
    sessionStorage: Record<string, string | null>;
  }
  
  // ===========================================
  // COMPONENT PROP INTERFACES
  // ===========================================
  
  /**
   * Props for chart components
   */
  export interface ChartComponentProps {
    data: ChartSeries[] | ChartDataPoint[];
    options?: ChartOptions;
    loading?: boolean;
    error?: string | null;
    height?: number;
    width?: number;
  }
  
  /**
   * Props for filter components
   */
  export interface FilterComponentProps {
    onFilterChange: (filters: FilterRequest) => void;
    initialFilters?: Partial<FilterRequest>;
    availableRegions?: string[];
    availableFeeders?: string[];
    loading?: boolean;
  }
  
  // ===========================================
  // EXPORT ALL INTERFACES
  // ===========================================
  
  // Re-export commonly used types for convenience
  export type {
    ApiResponse as DefaultApiResponse,
    FilterRequest as DefaultFilterRequest,
    FeederAnalysisResponse as DefaultFeederAnalysisResponse,
  };