import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiService from '../services/api';

interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  companyType: 'public' | 'private' | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userEmail: null,
    companyType: null,
    loading: true,
  });

  const checkAuth = async () => {
    try {
      const response = await apiService.checkAuth();
      
      if (response.status === 'success' && response.data?.authenticated) {
        // Get company type from backend response
        const companyType = response.data.company === 'private' ? 'private' : 'public';
        
        console.log('[AUTH] Auth check successful:', {
          email: response.data.email,
          company: response.data.company,
          companyType: companyType
        });
        
        setAuthState({
          isAuthenticated: true,
          userEmail: response.data.email || null,
          companyType: companyType,
          loading: false,
        });
      } else {
        console.log('[AUTH] Auth check failed or user not authenticated');
        setAuthState({
          isAuthenticated: false,
          userEmail: null,
          companyType: null,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        isAuthenticated: false,
        userEmail: null,
        companyType: null,
        loading: false,
      });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login({ email, password });
      
      if (response.status === 'success' && response.data) {
        // Get company type from backend response
        const companyType = response.data.company === 'private' ? 'private' : 'public';
        
        console.log('[AUTH] Login successful:', {
          email: response.data.email,
          company: response.data.company,
          companyType: companyType
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
      setAuthState({
        isAuthenticated: false,
        userEmail: null,
        companyType: null,
        loading: false,
      });
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}; 