// src/services/api.ts - UNIFIED API SERVICE FOR ELECTRICITY COMPANY PROJECT (REFACTORED VERSION)

// ===========================================
// IMPORTS - TYPE DEFINITIONS
// ===========================================
import type {
    // Core API Types
    ApiResponse,
    GenericApiResponse,
    LogData,
    NavigatorWithConnection,
    
    // Authentication Types
    LoginRequest,
    AuthResponse,
    AuthCheckResponse,
    DashboardResponse,
    
    // Request Types
    FilterRequest,
    FeederRegionRequest,
    ConsumptionDistributionRequest,
    EnergyComparisonRequest,
    ConsumptionLimitationRequest,
    
    // Response Types
    FeederRegionResponse,
    DailyPeakResponse,
    WeeklyPeakResponse,
    LoadContinuityResponse,
    ConsumptionDistributionResponse,
    EnergyComparisonResponse,
    FeederAnalysisResponse,
    
    // Upload Types
    UploadResponse,
    
    // Utility Types
    DateRange,
    SessionInfo,
    StorageData
} from '../types/api.interfaces'
  
  // =====
  // CHART API CONNECTIONS SUMMARY
  // ==========================================
  // 
  // 📊 CHART COMPONENTS AND THEIR DATA SOURCES:
  //
  // 1. DailyPeakChart.tsx → Backend: '/api/fidder-analysis' → Analysis: '/daily-peak'
  //  Response: { daily_peak: { result: [{ date: string, amount: number }] } }
  //
  // 2. WeeklyPeakChart.tsx → Backend: '/api/fidder-analysis' → Analysis: '/weekly-peak'
  //  Response: { weekly_peak: { result: [{ num_week: number, max_week: number }] } }
  //
  // 3. DailyProfileChart.tsx → Backend: '/api/fidder-analysis' → Analysis: '/daily-profile'
  //  Response: { daily_profil_max: { result: [...] }, daily_profil_mean: { result: [...] } }
  //
  // 4. DailyProfileMaxChart.tsx → Backend: '/api/fidder-analysis' → Analysis: '/daily-profile' (method='max')
  //  Response: { daily_profil_max: { result: [{ hour: string, amount: number }] } }
  //
  // 5. DailyProfileMeanChart.tsx → Backend: '/api/fidder-analysis' → Analysis: '/daily-profile' (method='mean')
  //  Response: { daily_profil_mean: { result: [{ hour: string, amount: number }] } }
  //
  // 6. LongTermChart.tsx → Backend: '/api/fidder-analysis' → Analysis: '/long-term'
  //  Response: { long_term: { result: [{ "1401": [{ week: number, amount: number }] }] } }
  //
  // 7. LoadContinuityChart.tsx → Backend: '/api/fidder-analysis' → Analysis: '/Load-continuity'
  //  Response: { tozi_bar: { result: [{ fidder: string, sort_value: number[] }] } }
  ///*
  // 8. TariffShareChart.tsx → Backend: '/api/consumption-distribution' → Analysis: '/consumption-distribution'
//  Response: { consumption_distribution: { result: [{ domestic: number, industrial: number, ... }] } }×!
  //
  // 9. EnergyComparisonChart.tsx → Backend: '/api/compare-energetic' → Analysis: '/compare-energetic'
  //  Response: { compare_energetic: { result: [{ num_fidder: string, year: number, energetic: number }] } }
  //
  // 10. FeederAnalysisChart.tsx → Backend: '/api/fidder-analysis' (Combined data from multiple endpoints)
  //   Response: Combined data from all analysis endpoints
  
  // ===========================================
  // CONFIGURATION
  // ===========================================
  const DEBUG_MODE = true; // Set to false in production
  
  // ===========================================
  // DEBUGGING AND LOGGING UTILITIES
  // ===========================================
  function logApiCall(type: 'REQUEST' | 'RESPONSE' | 'ERROR', endpoint: string, data?: LogData): void {
    if (!DEBUG_MODE) return;
    
    const timestamp = new Date().toISOString();
    const prefix = `[API-${type}] ${timestamp}`;
    
    switch (type) {
      case 'REQUEST':
        console.log(`${prefix} -> ${endpoint}`);
        if (data) console.log(`${prefix} Data:`, data);
        break;
      case 'RESPONSE':
        console.log(`${prefix} <- ${endpoint}`);
        if (data) console.log(`${prefix} Response:`, data);
        break;
      case 'ERROR':
        console.error(`${prefix} ERROR ${endpoint}`);
        if (data) console.error(`${prefix} Error Details:`, data);
        break;
    }
  }
  
  function logSessionInfo(context: string): void {
    if (!DEBUG_MODE) return;
    
    const storageData: StorageData = {
      localStorage: Object.keys(localStorage).reduce((acc, key) => {
        acc[key] = localStorage.getItem(key);
        return acc;
      }, {} as Record<string, string | null>),
      sessionStorage: Object.keys(sessionStorage).reduce((acc, key) => {
        acc[key] = sessionStorage.getItem(key);
        return acc;
      }, {} as Record<string, string | null>)
    };
  
    console.log(`[SESSION-DEBUG] ${context}:`);
    console.log('- Document cookies:', document.cookie);
    console.log('- Storage:', storageData);
  }
  
  function logNetworkInfo(context: string): void {
    if (!DEBUG_MODE) return;
    
    console.log(`[NETWORK-DEBUG] ${context}:`);
    console.log('- Online status:', navigator.onLine);
    console.log('- Connection type:', (navigator as NavigatorWithConnection).connection?.effectiveType || 'unknown');
    console.log('- User agent:', navigator.userAgent);
    console.log('- Current URL:', window.location.href);
    console.log('- Origin:', window.location.origin);
  }
  
  function logEnvironmentInfo(): void {
    if (!DEBUG_MODE) return;
    
    console.log('[ENV-DEBUG] Environment Information:');
    console.log('- NODE_ENV:', import.meta.env.MODE);
    console.log('- Backend URL:', BACKEND_API_BASE_URL);
    console.log('- Browser info:', {
      cookieEnabled: navigator.cookieEnabled,
      language: navigator.language,
      platform: navigator.platform,
      vendor: navigator.vendor
    });
  }
  
  // ===========================================
  // API BASE URLS
  // ===========================================
  function getApiBaseUrl(): string {
    if (import.meta.env.DEV) {
      return 'http://127.0.0.1:5000/api';
    }
    
    const currentHost = window.location.hostname;
    const currentProtocol = window.location.protocol;
    
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      return 'http://127.0.0.1:5000/api';
    }
    
    return `${currentProtocol}//${currentHost}:5000/api`;
  }
  
  const BACKEND_API_BASE_URL = getApiBaseUrl();
  
  // ===========================================
  // API CALL HELPER FUNCTIONS (OPTIMIZED)
  // ===========================================
  async function backendApiCall<T>(
    endpoint: string, 
    data?: Record<string, unknown> | LoginRequest | FilterRequest | FeederRegionRequest | ConsumptionDistributionRequest | EnergyComparisonRequest | ConsumptionLimitationRequest
  ): Promise<ApiResponse<T>> {
    const fullUrl = `${BACKEND_API_BASE_URL}${endpoint}`;
    
    logApiCall('REQUEST', endpoint, data as LogData);
    logSessionInfo(`Before API call to ${endpoint}`);
    
    try {
      const requestOptions: RequestInit = {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // 💡 **بهینه‌سازی کلیدی**: حذف هدر 'Cache-Control': 'no-cache'
          // این کار به مرورگر اجازه می‌دهد پاسخ‌ها را کش کند و در درخواست‌های تکراری، سرعت را به شدت بالا ببرد.
        },
        body: data ? JSON.stringify(data) : undefined,
      };
  
      const response = await fetch(fullUrl, requestOptions);
      
      if (!response.ok) {
        if (response.status === 0 || response.type === 'opaque') {
          throw new Error(`CORS Error: Cannot connect to backend at ${fullUrl}`);
        }
        // Read error text but don't store in unused variable
        const errorDetails = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorDetails}`);
      }
  
      const result = await response.json();
      logApiCall('RESPONSE', endpoint, result);
      logSessionInfo(`After API call to ${endpoint}`);
      
      return result;
    } catch (error) {
      logApiCall('ERROR', endpoint, error as LogData);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error(`[API-ERROR] Network/CORS Error - Check if backend is running on ${BACKEND_API_BASE_URL}`);
      }
      console.error(`[API-ERROR] Full error details:`, {
        endpoint,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        url: fullUrl,
        origin: window.location.origin
      });
      throw error;
    }
  }
  
  // ===========================================
  // API SERVICE CLASS
  // ===========================================
  class ApiService {
    // ===========================================
    // AUTHENTICATION METHODS
    // ===========================================
    
    /**
     * User login with credentials
     */
    async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
      logEnvironmentInfo();
      logNetworkInfo('Before login');
      logSessionInfo('Before login');
      return backendApiCall<AuthResponse>('/login', credentials);
    }
  
    /**
     * User logout
     */
    async logout(): Promise<ApiResponse> {
      try {
        await backendApiCall('/logout');
        return { status: 'success', message: 'Logout successful' };
      } catch (error) {
        logApiCall('ERROR', '/logout', error as LogData);
        return { status: 'error', message: 'خطا در خروج از سیستم' };
      }
    }
  
    /**
     * Check authentication status
     * 💡 راهنمای بهینه‌سازی: برای جلوگیری از درخواست‌های مکرر، نتیجه این تابع را در یک State سراسری (مثل React Context) ذخیره کنید.
     */
    async checkAuth(): Promise<ApiResponse<AuthCheckResponse>> {
      console.log('[AUTH] Checking authentication status');
      logSessionInfo('Before auth check');
      try {
        const result = await backendApiCall<AuthCheckResponse>('/check-auth');
        logSessionInfo('After auth check');
        return result;
      } catch (error) {
        console.error('[AUTH] Auth check failed:', error);
        return {
          status: 'error',
          message: 'بررسی احراز هویت ناموفق بود',
          data: { authenticated: false }
        };
      }
    }
  
    /**
     * Get dashboard data
     */
    async getDashboard(): Promise<ApiResponse<DashboardResponse>> {
      return backendApiCall('/dashboard');
    }
  
    /**
     * Test session validity
     */
    async testSession(): Promise<ApiResponse> {
      return backendApiCall('/test-session');
    }
  
    // ===========================================
    // FEEDER/REGION DATA METHODS
    // ===========================================
    
    /**
     * Get feeder and region data
     */
    async getFidderRegion(request?: FeederRegionRequest): Promise<ApiResponse<FeederRegionResponse>> {
      return backendApiCall('/get-fidder-region', request || {});
    }
  
    /**
     * Get feeders by region codes
     */
    async getFiddersByRegions(regionCodes: string[]): Promise<ApiResponse<FeederRegionResponse>> {
      return this.getFidderRegion({ region_code: regionCodes });
    }
  
    /**
     * Get regions and feeders data
     */
    async getRegionsAndFeeders(request?: FeederRegionRequest): Promise<ApiResponse<FeederRegionResponse>> {
      return backendApiCall<FeederRegionResponse>('/get-fidder-region', request || {});
    }
  
    // ===========================================
    // ANALYSIS ENDPOINTS
    // ===========================================
    
    /**
     * Get comprehensive feeder analysis
     */
    async getFeederAnalysis(params: FilterRequest): Promise<ApiResponse<FeederAnalysisResponse>> {
      console.log('[ANALYSIS] Requesting feeder analysis:', params);
      return backendApiCall<FeederAnalysisResponse>('/fidder-analysis', params);
    }
  
    /**
     * Get energy comparison data
     */
    async getEnergyComparison(params: FilterRequest): Promise<ApiResponse<{ energy_comparison: EnergyComparisonResponse }>> {
      const fidder_code = params.fidder_code ? [params.fidder_code] : [];
      const region_code = params.region_code ? [params.region_code] : [];
      const startYear = params.start_date ? params.start_date.split('-')[0] : '1401';
      const endYear = params.end_date ? params.end_date.split('-')[0] : startYear;
      const years = startYear === endYear ? [startYear] : [startYear, endYear];
      
      const result = await this.getEnergyComparisonByYears(years, region_code, fidder_code);
      
      // Transform the response to match expected structure
      return {
        status: result.status,
        message: result.message,
        data: result.data?.data ? { energy_comparison: result.data.data } : undefined
      } as ApiResponse<{ energy_comparison: EnergyComparisonResponse }>;
    }
  
    /**
     * Get consumption distribution data
     */
    async getConsumptionDistribution(params: FilterRequest): Promise<ApiResponse<{ consumption_distribution: ConsumptionDistributionResponse }>> {
      const fidder_code = params.fidder_code ? [params.fidder_code] : [];
      const region_code = params.region_code ? [params.region_code] : [];
      
      const result = await this.getConsumptionDistributionByArrays(fidder_code, region_code, params.start_date, params.end_date);
      
      // Transform the response to match expected structure
      return {
        status: result.status,
        message: result.message,
        data: result.data?.data ? { consumption_distribution: result.data.data } : undefined
      } as ApiResponse<{ consumption_distribution: ConsumptionDistributionResponse }>;
    }
  
    // ===========================================
    // DIRECT ANALYSIS API CALLS
    // ===========================================
    
    /**
     * Get daily peak data directly
     */
    async getDailyPeakDirect(request: FilterRequest): Promise<ApiResponse<DailyPeakResponse>> {
      return backendApiCall<DailyPeakResponse>('/daily-peak', request);
    }
  
    /**
     * Get weekly peak data directly
     */
    async getWeeklyPeakDirect(request: FilterRequest): Promise<ApiResponse<WeeklyPeakResponse>> {
      return backendApiCall<WeeklyPeakResponse>('/weekly-peak', request);
    }
  
    /**
     * Get load continuity data directly
     */
    async getLoadContinuityDirect(request: FilterRequest): Promise<ApiResponse<LoadContinuityResponse>> {
      return backendApiCall<LoadContinuityResponse>('/Load-continuity', request);
    }
  
    /**
     * Get consumption distribution data directly
     */
    async getConsumptionDistributionDirect(request: FilterRequest): Promise<ApiResponse<ConsumptionDistributionResponse>> {
      return backendApiCall<ConsumptionDistributionResponse>('/consumption-distribution', request);
    }
  
    /**
     * Get consumption distribution by arrays
     */
    async getConsumptionDistributionByArrays(
      fidder_code: string[], 
      region_code: string[], 
      start_date: string, 
      end_date: string
    ): Promise<ApiResponse<GenericApiResponse<ConsumptionDistributionResponse>>> {
      const request: ConsumptionDistributionRequest = { fidder_code, region_code, start_date, end_date };
      return backendApiCall<GenericApiResponse<ConsumptionDistributionResponse>>('/consumption-distribution', request);
    }
  
    /**
     * Get energy comparison by years
     */
    async getEnergyComparisonByYears(
      years: string[], 
      region_code: string[], 
      fidder_code: string[]
    ): Promise<ApiResponse<GenericApiResponse<EnergyComparisonResponse>>> {
      const request: EnergyComparisonRequest = { year: years, region_code, fidder_code };
      return backendApiCall<GenericApiResponse<EnergyComparisonResponse>>('/compare-energetic', request);
    }
  
    /**
     * Get feeder analysis by arrays
     */
    async getFeederAnalysisByArrays(
      fidder_code: string[], 
      region_code: string[], 
      start_date: string, 
      end_date: string
    ): Promise<ApiResponse<GenericApiResponse<FeederAnalysisResponse>>> {
      const request: ConsumptionDistributionRequest = { fidder_code, region_code, start_date, end_date };
      return backendApiCall<GenericApiResponse<FeederAnalysisResponse>>('/fidder-analysis', request);
    }
  
    /**
     * Get consumption limitation analysis
     */
    async getConsumptionLimitation(params: ConsumptionLimitationRequest): Promise<ApiResponse<GenericApiResponse<Record<string, unknown>>>> {
      return backendApiCall<GenericApiResponse<Record<string, unknown>>>('/consumption-limitation', params);
    }
  
    /**
     * Get energy comparison data directly
     */
    async getCompareEnergeticDirect(request: FilterRequest): Promise<ApiResponse<EnergyComparisonResponse>> {
      return backendApiCall<EnergyComparisonResponse>('/compare-energetic', request);
    }
  
    // ===========================================
    // UTILITY METHODS
    // ===========================================
    
    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
      try {
        const response = await this.checkAuth();
        return response.status === 'success' && response.data?.authenticated === true;
      } catch (error) {
        console.error('Auth check failed:', error);
        return false;
      }
    }
  
    /**
     * Format Shamsi date string
     */
    formatShamsiDate(shamsiDate: string): string {
      const parts = shamsiDate.split('/');
      if (parts.length === 3) {
        return `${parts[0].padStart(4, '0')}/${parts[1].padStart(2, '0')}/${parts[2].padStart(2, '0')}`;
      }
      return shamsiDate;
    }
  
    /**
     * Get current Shamsi date
     */
    getCurrentShamsiDate(): string {
      const now = new Date();
      const shamsiYear = now.getFullYear() - 621; // Simplified conversion
      const shamsiMonth = (now.getMonth() + 1).toString().padStart(2, '0');
      const shamsiDay = now.getDate().toString().padStart(2, '0');
      return `${shamsiYear}/${shamsiMonth}/${shamsiDay}`;
    }
  
    /**
     * Validate Shamsi date format
     */
    isValidShamsiDate(date: string): boolean {
      const shamsiRegex = /^\d{4}\/\d{2}\/\d{2}$/;
      return shamsiRegex.test(date);
    }
  
    /**
     * Convert date range to Shamsi format
     */
    createDateRange(startDate: string, endDate: string): DateRange {
      return {
        start_date: this.formatShamsiDate(startDate),
        end_date: this.formatShamsiDate(endDate)
      };
    }
  
    /**
     * Upload CSV file
     */
    async uploadCsv(file: File): Promise<ApiResponse<UploadResponse>> {
      try {
        const formData = new FormData();
        formData.append('file', file);
  
        const response = await fetch(`${BACKEND_API_BASE_URL}/import-power-consumption`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
  
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
  
        const data = await response.json() as GenericApiResponse<UploadResponse>;
        return {
          status: (data.status === 'success' || data.status === 'error') ? data.status : 'success',
          message: data.message || 'فایل با موفقیت آپلود شد',
          data: data.data
        };
  
      } catch (error) {
        console.error('CSV upload failed:', error);
        if (error instanceof Error) {
          return { status: 'error', message: `خطا در آپلود فایل: ${error.message}` };
        }
        return { status: 'error', message: 'خطای غیرمنتظره در آپلود فایل' };
      }
    }
  
    /**
     * Get session information for debugging
     */
    getSessionInfo(): SessionInfo {
      return {
        sessionId: document.cookie.match(/sessionId=([^;]+)/)?.[1],
        userId: localStorage.getItem('userId') || undefined,
        email: localStorage.getItem('userEmail') || undefined,
        company: localStorage.getItem('userCompany') || undefined,
        loginTime: localStorage.getItem('loginTime') || undefined,
        lastActivity: new Date().toISOString()
      };
    }
  }
  
  // ===========================================
  // CREATE API SERVICE INSTANCE
  // ===========================================
  const api = new ApiService();
  
  // ===========================================
  // LEGACY EXPORTS FOR BACKWARD COMPATIBILITY
  // ===========================================
  export const backendApiService = {
    login: api.login.bind(api),
    logout: api.logout.bind(api),
    checkAuth: api.checkAuth.bind(api),
    getFidderRegion: api.getFidderRegion.bind(api),
    getFeederAnalysis: api.getFeederAnalysis.bind(api),
    getEnergyComparison: api.getEnergyComparison.bind(api),
    getConsumptionDistribution: api.getConsumptionDistribution.bind(api),
  };
  
  export const electricityApiService = {
    getDailyPeak: api.getDailyPeakDirect.bind(api),
    getWeeklyPeak: api.getWeeklyPeakDirect.bind(api),
    getLoadContinuity: api.getLoadContinuityDirect.bind(api),
    getConsumptionDistribution: api.getConsumptionDistributionDirect.bind(api),
    getCompareEnergetic: api.getCompareEnergeticDirect.bind(api),
  };
  
  export const dateUtils = {
    formatShamsiDate: api.formatShamsiDate.bind(api),
    getCurrentShamsiDate: api.getCurrentShamsiDate.bind(api),
    isValidShamsiDate: api.isValidShamsiDate.bind(api),
    createDateRange: api.createDateRange.bind(api),
  };
  
  // ===========================================
  // MAIN EXPORTS
  // ===========================================
  export const apiService = api;
  export default api;
  
  // ===========================================
  // RE-EXPORT TYPES FOR CONVENIENCE
  // ===========================================
  export type {
    ApiResponse,
    FilterRequest,
    LoginRequest,
    FeederRegionResponse,
    DailyPeakResponse,
    WeeklyPeakResponse,
    LoadContinuityResponse,
    ConsumptionDistributionResponse,
    EnergyComparisonResponse,
    FeederAnalysisResponse,
    ConsumptionDistributionRequest,
    EnergyComparisonRequest,
    ConsumptionLimitationRequest,
    UploadResponse,
    GenericApiResponse,
    AuthResponse,
    AuthCheckResponse,
    SessionInfo,
    DateRange
  };