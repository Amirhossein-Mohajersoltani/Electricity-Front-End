// API Configuration for Energy Analysis Backend
const BASE_URL = 'http://178.236.33.157:8000';
// Dynamic API base URL that works for both local and server environments
const getApiBaseUrl = () => {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    return 'http://127.0.0.1:5000/api';
  }
  
  // For production, use the same host as the frontend
  const currentHost = window.location.hostname;
  const currentProtocol = window.location.protocol;
  
  // If running on server, use the server's IP/domain
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://127.0.0.1:5000/api';
  }
  
  // For production server deployment
  return `${currentProtocol}//${currentHost}:5000/api`;
};

const AUTH_BASE_URL = getApiBaseUrl(); // Backend authentication API - match backend URL exactly

// Types for API responses based on the backend documentation
export interface DailyPeakResponse {
  region_code: number[];
  fidder_code: number[];
  status: string;
  result: Array<{
    date: string;
    amount: number;
  }>;
}

export interface DailyProfileResponse {
  region_code: number[];
  fidder_code: number[];
  status: string;
  method: 'max' | 'mean';
  result: Array<{
    hour: string;
    amount: number;
  }>;
}

export interface WeeklyPeakResponse {
  region_code: number[];
  fidder_code: number[];
  status: string;
  result: Array<{
    start_date: string;
    end_date: string;
    max_week: number;
    num_week: number;
  }>;
}

export interface LongTermResponse {
  region_code: number[];
  fidder_code: number[];
  status: string;
  result: Array<{
    [year: string]: Array<{
      'start date': string;
      'end date': string;
      week: number;
      amount: number;
    }>;
  }>;
}

export interface LoadContinuityResponse {
  region_code: number[];
  fidder_code: number[];
  status: string;
  result: Array<{
    fidder: number;
    start_date: string;
    end_date: string;
    sort_value: number[];
  }>;
}

export interface EnergyComparisonResponse {
  region_code: number[];
  fidder_code: number[];
  status: string;
  result: Array<{
    num_fidder: number;
    year: number;
    energetic: number;
  }>;
}

export interface ConsumptionDistributionResponse {
  region_code: number[];
  fidder_code: number[];
  status: string;
  result: Array<{
    domestic: number;
    industrial: number;
    agriculture: number;
    commercial: number;
    lighting: number;
    administrative: number;
  }>;
}

// Additional types for the UI pages
export interface LoadDistributionData {
  totalLoad: number;
  activeNodes: number;
  efficiency: number;
  distribution: Array<{
    zone: string;
    load: number;
    percentage: number;
  }>;
}

export interface FidderAnalysisData {
  totalFidders: number;
  activeFidders: number;
  averageLoad: number;
  analysis: Array<{
    fidder: string;
    load: number;
    status: string;
    efficiency: number;
  }>;
}

export interface EnergyComparisonData {
  totalEnergy: number;
  growthRate: number;
  efficiency: {
    current: number;
    previous: number;
    trend: 'up' | 'down';
  };
  consumption: {
    current: number;
    previous: number;
    trend: 'up' | 'down';
  };
  savings: {
    amount: number;
    percentage: number;
    trend: 'up' | 'down';
  };
  comparison: Array<{
    period: string;
    consumption: number;
    cost: number;
  }>;
  history?: Array<{
    source1: string;
    source2: string;
    period: string;
    efficiency: number;
    date: string;
    consumption1: number;
    consumption2: number;
    cost1: number;
    cost2: number;
  }>;
}

// API Request Parameters
export interface DateRangeParams {
  start_date: string; // Shamsi date format
  end_date: string;   // Shamsi date format
  region_code: number[];
  fidder_code: number[];
}

export interface YearlyParams {
  year: number[];
  region_code: number[];
  fidder_code: number[];
}

export interface DailyProfileParams extends DateRangeParams {
  method: 'max' | 'mean';
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    authenticated: boolean;
    email?: string;
    company?: string;
  };
}

// API Service class
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    params: any
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error(`API error: ${data.status}`);
    }

    return data;
  }

  // ===================
  // BACKEND API ENDPOINTS
  // ===================
  // TODO: These methods call the actual backend when it's available
  // For now, they use mock data for development

  // 1. Daily Peak (پیک روزانه)
  async getDailyPeak(params: DateRangeParams): Promise<DailyPeakResponse> {
    return this.makeRequest<DailyPeakResponse>('/daily-peak', params);
  }

  // 2. Daily Profile (پروفیل روزانه)
  async getDailyProfile(params: DailyProfileParams): Promise<DailyProfileResponse> {
    return this.makeRequest<DailyProfileResponse>('/daily-profile', params);
  }

  // 3. Weekly Peak (پیک هفتگی)
  async getWeeklyPeak(params: DateRangeParams): Promise<WeeklyPeakResponse> {
    return this.makeRequest<WeeklyPeakResponse>('/weekly-peak', params);
  }

  // 4. Long Term (بلند مدت)
  async getLongTerm(params: YearlyParams): Promise<LongTermResponse> {
    return this.makeRequest<LongTermResponse>('/long-term', params);
  }

  // 5. Load Continuity (تداوم بار)
  async getLoadContinuity(params: DateRangeParams): Promise<LoadContinuityResponse> {
    return this.makeRequest<LoadContinuityResponse>('/load-continuity', params);
  }

  // 6. Energy Comparison (مقایسه انرژی)
  async getEnergyComparison(params: YearlyParams): Promise<EnergyComparisonResponse> {
    return this.makeRequest<EnergyComparisonResponse>('/compare-energetic', params);
  }

  // 7. Consumption Distribution (سهم تعرفه ها)
  async getConsumptionDistribution(params: DateRangeParams): Promise<ConsumptionDistributionResponse> {
    return this.makeRequest<ConsumptionDistributionResponse>('/consumption-distribution', params);
  }

  // ===================
  // FRONTEND-SPECIFIC MOCK METHODS
  // ===================
  // TODO: Replace these with proper backend integration when available

  // Note: Mock methods removed - all API calls now go directly to backend
  // If backend is unavailable, proper errors will be thrown instead of returning mock data

     // Authentication methods using environment-configured URLs
     async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login for:', credentials.email);
      console.log('🔐 Using AUTH_BASE_URL:', AUTH_BASE_URL);
      console.log('🔐 Full login URL:', `${AUTH_BASE_URL}/login`);
     
     const response = await fetch(`${AUTH_BASE_URL}/login`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       credentials: 'include', // Important for session cookies
       body: JSON.stringify(credentials),
     });

     if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
     }

     const data = await response.json();
     console.log('🔐 Login response:', data);
     
     return {
       status: data.status === 'success' ? 'success' : 'error',
       message: data.message || 'Login attempt completed',
       data: {
         authenticated: data.data?.authenticated || false,
         email: data.data?.email || (data.data?.authenticated ? credentials.email : undefined),
         company: data.data?.company || 'public'
       }
     };
        } catch (error) {
      console.error('🔐 Login error:', error);
      console.error('🔐 Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      return {
        status: 'error',
        message: 'خطا در اتصال به سرور',
        data: {
          authenticated: false
        }
      };
    }
 }

  async checkAuth(): Promise<AuthResponse> {
    try {
      console.log('🔐 Checking authentication status');
      console.log('🔐 Using AUTH_BASE_URL:', AUTH_BASE_URL);
      
      const response = await fetch(`${AUTH_BASE_URL}/check-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for session cookies
      });

      if (!response.ok) {
        // For auth check, 401 is expected when not authenticated
        if (response.status === 401) {
          const data = await response.json();
          return {
            status: 'error',
            message: data.message || 'Not authenticated',
            data: {
              authenticated: false
            }
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔐 Auth check response:', data);
      
      return {
        status: data.status === 'success' ? 'success' : 'error',
        message: data.message || 'Auth check completed',
        data: {
          authenticated: data.data?.authenticated || false,
          email: data.data?.email,
          company: data.data?.company || 'public'
        }
      };
    } catch (error) {
      console.error('🔐 Auth check error:', error);
      return {
        status: 'error',
        message: 'خطا در بررسی احراز هویت',
        data: {
          authenticated: false
        }
      };
    }
  }

  async logout(): Promise<AuthResponse> {
    try {
      console.log('🔐 Logging out');
      console.log('🔐 Using AUTH_BASE_URL:', AUTH_BASE_URL);
      
      const response = await fetch(`${AUTH_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for session cookies
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔐 Logout response:', data);
      
      return {
        status: 'success',
        message: 'خروج موفقیت‌آمیز',
        data: {
          authenticated: false
        }
      };
    } catch (error) {
      console.error('🔐 Logout error:', error);
      return {
        status: 'success', // Always consider logout successful locally
        message: 'خروج انجام شد',
        data: {
          authenticated: false
        }
      };
    }
  }
}

export const apiService = new ApiService();

// API Endpoints configuration
export const API_ENDPOINTS = {
  CSRF_TOKEN: '/api/csrf-token',
  LOGIN: '/api/login',
  LOGOUT: '/api/logout',
  CHECK_AUTH: '/api/check-auth',
  DAILY_PEAK: '/api/daily-peak',
  DAILY_PROFILE: '/api/daily-profile',
  WEEKLY_PEAK: '/api/weekly-peak',
  LONG_TERM: '/api/long-term',
  LOAD_CONTINUITY: '/api/load-continuity',
  ENERGY_COMPARISON: '/api/energy-comparison',
  CONSUMPTION_DISTRIBUTION: '/api/consumption-distribution',
};

// Generic API request function
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };

  return fetch(url, { ...defaultOptions, ...options });
};

// Configuration loader function
export const loadApiConfig = async (): Promise<void> => {
  // TODO: Replace with actual API configuration loading when backend is ready
  console.log('⚙️  Mock: Loading API configuration');
  
  // Simulate configuration loading
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Mock configuration loaded successfully
  return Promise.resolve();
};

// Utility functions for date conversion (Shamsi dates)
export const dateUtils = {
  // TODO: Implement proper Shamsi date conversion when backend is ready
  // Convert Gregorian to Shamsi (placeholder - you'll need a proper conversion library)
  toShamsi: (date: Date): string => {
    // This is a placeholder - implement proper Shamsi date conversion
    return '1402/01/01';
  },
  
  // Convert Shamsi to Gregorian (placeholder)
  fromShamsi: (shamsiDate: string): Date => {
    // This is a placeholder - implement proper Shamsi date conversion
    return new Date();
  },
  
  // Get current Shamsi date
  getCurrentShamsi: (): string => {
    return '1402/01/01'; // Placeholder
  }
};

// Default parameters for API calls
export const defaultParams = {
  region_code: [10],
  fidder_code: [20, 30],
  start_date: '1401/01/01',
  end_date: '1401/01/31',
  year: [1401, 1402]
}; 