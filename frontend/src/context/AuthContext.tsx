import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiService from '../services/api';

// --- Type Definitions ---
// ✅ **IMPROVEMENT**: companyType دیگر نمی‌تواند null باشد
interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  companyType: 'public' | 'private'; // null حذف شد
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// --- Logged-out State Constant ---
// ✅ **IMPROVEMENT**: یک مقدار پیش‌فرض برای companyType در نظر گرفته شده است
const loggedOutState: AuthState = {
  isAuthenticated: false,
  userEmail: null,
  companyType: 'public', // مقدار پیش‌فرض 'public' است
  loading: false,
};

// --- Context Definition ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Custom Hook ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- Auth Provider Component ---
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    ...loggedOutState,
    loading: true,
  });

  const checkAuth = async () => {
    try {
      const response = await apiService.checkAuth();

      if (response.status === 'success' && response.data?.authenticated) {
        // ✅ **IMPROVEMENT**: منطق جدید برای جلوگیری از مقدار null
        // اگر نوع شرکت 'private' باشد، همان را برمی‌گرداند؛ در غیر این صورت، پیش‌فرض 'public' خواهد بود
        const companyType: 'public' | 'private' =
          response.data.company === 'private' ? 'private' : 'public';

        console.log('[AUTH] Auth check successful:', {
          email: response.data.email,
          company: response.data.company,
          companyType: companyType
        });

        setAuthState({
          isAuthenticated: true,
          userEmail: response.data.email || null,
          companyType: companyType, // این مقدار همیشه 'public' یا 'private' خواهد بود
          loading: false,
        });
      } else {
        console.log('[AUTH] Auth check failed or user not authenticated');
        setAuthState(loggedOutState);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState(loggedOutState);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login({ email, password });

      if (response.status === 'success' && response.data) {
        // ✅ **IMPROVEMENT**: منطق جدید برای جلوگیری از مقدار null
        const companyType: 'public' | 'private' =
          response.data.company === 'private' ? 'private' : 'public';
        
        console.log('[AUTH] Login successful:', {
          email: response.data.email,
          company: response.data.company,
          companyType: companyType
        });

        setAuthState({
          isAuthenticated: true,
          userEmail: response.data.email,
          companyType: companyType, // این مقدار همیشه 'public' یا 'private' خواهد بود
          loading: false,
        });
        return true;
      } else {
        console.error('Login failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      setAuthState(loggedOutState);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};