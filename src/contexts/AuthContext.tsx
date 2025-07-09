import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStorage, authApi } from '@/lib/api';
import { jwtUtils } from '@/lib/auth';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, tokens: { access_token: string; refresh_token: string; expires_in: number }) => void;
  logout: () => Promise<void>;
  checkAuthStatus: () => boolean;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuthStatus = (): boolean => {
    const token = tokenStorage.getAccessToken();
    return !!token && !jwtUtils.isExpired(token);
  };

  const login = (userData: User, tokens: { access_token: string; refresh_token: string; expires_in: number }) => {
    // Store tokens
    tokenStorage.setTokens(tokens.access_token, tokens.refresh_token, tokens.expires_in);
    
    // Set user data
    setUser(userData);
    
    // Store user data in localStorage for persistence
    localStorage.setItem('user_data', JSON.stringify(userData));
    
    toast.success('Login successful!');
  };

  const logout = async () => {
    try {
      // Call backend logout to invalidate refresh tokens
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local cleanup even if backend call fails
    }
    
    // Clear user data
    setUser(null);
    localStorage.removeItem('user_data');
    
    // Show logout message
    toast.success('Logged out successfully');
    
    // Redirect to login page
    navigate('/', { replace: true });
  };

  // Check if user is authenticated on app load
  useEffect(() => {
    const initAuth = () => {
      const token = tokenStorage.getAccessToken();
      
      if (token && !jwtUtils.isExpired(token)) {
        // Try to get user data from localStorage first
        const storedUserData = localStorage.getItem('user_data');
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            setUser(userData);
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            // If stored data is invalid, get user ID from token
            const userId = jwtUtils.getUserId(token);
            if (userId) {
              setUser({
                id: userId,
                email: 'user@example.com', // Placeholder - could be fetched from API
                username: 'user', // Placeholder - could be fetched from API
              });
            }
          }
        } else {
          // If no stored data, get user ID from token
          const userId = jwtUtils.getUserId(token);
          if (userId) {
            setUser({
              id: userId,
              email: 'user@example.com', // Placeholder - could be fetched from API
              username: 'user', // Placeholder - could be fetched from API
            });
          }
        }
      } else {
        // Clear invalid/expired tokens
        tokenStorage.clearTokens();
        localStorage.removeItem('user_data');
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 