import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiService from '../services/api';

// --- Type Definitions ---
interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  companyType: 'public' | 'private' | 'admin'; 
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password:string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// --- Logged-out State Constant ---
const loggedOutState: AuthState = {
  isAuthenticated: false,
  userEmail: null,
  companyType: 'public',
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
       
        const responseCompany = response.data.company;
        let companyType: 'public' | 'private' | 'admin' = 'public'; 

        if (responseCompany === 'private') {
          companyType = 'private';
        } else if (responseCompany === 'admin') {
          companyType = 'admin';
        }

        console.log('[AUTH] Auth check successful:', {
          email: response.data.email,
          company: response.data.company,
          resolvedCompanyType: companyType 
        });

        setAuthState({
          isAuthenticated: true,
          userEmail: response.data.email || null,
          companyType: companyType, 
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

  // ✅ **REFACTORED**: این تابع نیز برای مدیریت نوع 'admin' بازنویسی شد
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login({ email, password });

      if (response.status === 'success' && response.data) {
        // ✅ **IMPROVEMENT**: منطق جدید برای تشخیص صحیح نوع شرکت
        const responseCompany = response.data.company;
        let companyType: 'public' | 'private' | 'admin' = 'public'; 

        if (responseCompany === 'private') {
          companyType = 'private';
        } else if (responseCompany === 'admin') {
          companyType = 'admin';
        }
        
        console.log('[AUTH] Login successful:', {
          email: response.data.email,
          company: response.data.company,
          resolvedCompanyType: companyType 
        });

        setAuthState({
          isAuthenticated: true,
          userEmail: response.data.email,
          companyType: companyType, 
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