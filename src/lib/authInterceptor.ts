import { tokenStorage, authApi, type ApiError } from './api';
import { toast } from 'sonner';

interface AuthInterceptorOptions {
  onAuthFailure?: () => void;
}

class AuthInterceptor {
  private static instance: AuthInterceptor;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];
  private options: AuthInterceptorOptions = {};

  private constructor() {}

  static getInstance(): AuthInterceptor {
    if (!AuthInterceptor.instance) {
      AuthInterceptor.instance = new AuthInterceptor();
    }
    return AuthInterceptor.instance;
  }

  configure(options: AuthInterceptorOptions) {
    this.options = options;
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private async handleAuthFailure() {
    // Clear tokens and user data
    tokenStorage.clearTokens();
    localStorage.removeItem('user_data');
    
    // Show error message
    toast.error("Session expired", {
      description: "Please log in again to continue",
    });

    // Call custom auth failure handler if provided
    if (this.options.onAuthFailure) {
      this.options.onAuthFailure();
    } else {
      // Default behavior: redirect to login
      window.location.href = '/';
    }
  }

  async interceptApiCall<T>(
    apiCall: () => Promise<T>,
    isRetry: boolean = false
  ): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      const apiError = error as ApiError;
      
      // Only handle 401 errors and prevent infinite retry loops
      if (apiError.status === 401 && !isRetry) {
        // If already refreshing, queue this request
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(() => {
            // Retry the original request after refresh completes
            return this.interceptApiCall(apiCall, true);
          });
        }

        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) {
          await this.handleAuthFailure();
          throw apiError;
        }

        this.isRefreshing = true;

        try {
          // Attempt token refresh
          const refreshResponse = await authApi.refreshToken(refreshToken);
          
          // Update tokens in storage (keep existing refresh token)
          tokenStorage.setTokens(
            refreshResponse.access_token,
            refreshToken, // Keep the existing refresh token
            refreshResponse.expires_in
          );

          // Process queued requests
          this.processQueue(null, refreshResponse.access_token);
          
          // Retry the original request
          return await this.interceptApiCall(apiCall, true);
          
        } catch (refreshError) {
          // Refresh failed - handle auth failure
          this.processQueue(refreshError);
          await this.handleAuthFailure();
          throw apiError;
          
        } finally {
          this.isRefreshing = false;
        }
      }

      // Re-throw other errors
      throw error;
    }
  }

  // Helper method to wrap fetch calls with auth handling
  async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<T> {
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Add authorization header if we have a token
    const token = tokenStorage.getAccessToken();
    if (token) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const url = `${baseUrl}${endpoint}`;

    const response = await fetch(url, config);

    if (!response.ok) {
      // Safely parse error data - handle empty responses
      let errorData: any = {};
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const text = await response.text();
          if (text.trim()) {
            errorData = JSON.parse(text);
          }
        }
      } catch (parseError) {
        console.warn('Failed to parse error response as JSON:', parseError);
      }
      
      // Handle 401 specifically
      if (response.status === 401 && !isRetry) {
        const refreshToken = tokenStorage.getRefreshToken();
        if (refreshToken) {
          try {
            const refreshResponse = await authApi.refreshToken(refreshToken);
            
            // Update authorization header and retry
            (config.headers as Record<string, string>)['Authorization'] = `Bearer ${refreshResponse.access_token}`;
            
            const retryResponse = await fetch(url, config);
            if (!retryResponse.ok) {
              throw {
                message: `HTTP ${retryResponse.status}: ${retryResponse.statusText}`,
                status: retryResponse.status,
              } as ApiError;
            }

            const contentType = retryResponse.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
              return await retryResponse.json();
            }
            return { success: true, status: retryResponse.status } as T;
            
          } catch (refreshError) {
            await this.handleAuthFailure();
            throw {
              message: "Session expired. Please log in again.",
              status: 401,
            } as ApiError;
          }
        } else {
          await this.handleAuthFailure();
          throw {
            message: "Session expired. Please log in again.",
            status: 401,
          } as ApiError;
        }
      }

      const apiError: ApiError = {
        message: errorData.detail?.[0]?.msg || 
                (typeof errorData.detail === 'string' ? errorData.detail : 
                 `HTTP ${response.status}: ${response.statusText}`),
        status: response.status,
        details: response.status === 422 ? errorData : undefined,
      };

      throw apiError;
    }

    // Handle successful response
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await response.json();
    }
    return { success: true, status: response.status, statusText: response.statusText } as T;
  }
}

export const authInterceptor = AuthInterceptor.getInstance(); 