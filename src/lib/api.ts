// API base URL - this should be configured based on your backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// API endpoint paths
const API_ENDPOINTS = {
    REGISTER: "/api/v1/auth/register",
    LOGIN: "/api/v1/auth/login",
    VERIFY_EMAIL: "/api/v1/auth/verify-email",
    VERIFY_LOGIN: "/api/v1/auth/verify-login",
    REFRESH_TOKEN: "/api/v1/auth/refresh",
    GOOGLE_LOGIN: "/api/v1/auth/google/login",

} as const;

// Types for API requests and responses
export interface RegisterRequest {
    email: string;
    password: string;
    username: string;
    full_name: string;
}

export interface RegisterResponse {
    user_id: string;
    email: string;
    message: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    login_request_id: string;
    expires_in: number;
}

export interface VerifyLoginRequest {
    login_request_id: string;
    otp: string;
}

export interface VerifyLoginResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    user_id: string;
}

export interface RefreshTokenRequest {
    refresh_token: string;
}

export interface RefreshTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

export interface VerifyEmailRequest {
    email: string;
    otp: string;
}

export interface VerifyEmailResponse {
    message: string;
    access_token: string;
    token_type: string;
    expires_in: number;
}

export interface GoogleAuthRequest {
    redirect_uri?: string;
}

export interface GoogleAuthInitResponse {
    authorization_url: string;
    state: string;
}



export interface GoogleAuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    user_id: string;
    email: string;
    username: string;
    provider: string;
    first_login: boolean;
    profile_complete: boolean;
    is_new_user: boolean;
}

export interface ValidationError {
    detail: Array<{
        loc: (string | number)[];
        msg: string;
        type: string;
    }>;
}

export interface ApiError {
    message: string;
    status: number;
    details?: ValidationError;
}

// Token storage keys
export const TOKEN_STORAGE_KEYS = {
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
    TOKEN_EXPIRY: "token_expiry",
} as const;

// Generic API call function
async function apiCall<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false // Add a flag to prevent infinite retry loops
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const accessToken = tokenStorage.getAccessToken();

    const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (accessToken) {
        defaultHeaders["Authorization"] = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (response.status === 401 && !isRetry) {
                // Specific check for "Could not validate credentials" or general 401
                const detailMessage = errorData.detail;
                if (typeof detailMessage === 'string' && detailMessage === "Could not validate credentials" || response.statusText === "Unauthorized") {
                    try {
                        const refreshToken = tokenStorage.getRefreshToken();
                        if (refreshToken) {
                            const refreshResponse = await authApi.refreshToken(refreshToken);
                            // authApi.refreshToken already updates storage, so we just retry
                            // Retry the original request with the new token
                            // Make sure to update headers for the retry
                            const newConfig = { ...config };
                            if (newConfig.headers) {
                                (newConfig.headers as Record<string, string>)["Authorization"] = `Bearer ${refreshResponse.access_token}`;
                            } else {
                                newConfig.headers = { "Authorization": `Bearer ${refreshResponse.access_token}` };
                            }
                            // Pass isRetry = true to prevent infinite loops
                            return await apiCall<T>(endpoint, newConfig, true);
                        } else {
                            // No refresh token, clear tokens and navigate to login or throw error
                            authApi.logout();
                            // Optionally, redirect to login page here
                            // window.location.href = '/login'; 
                            throw {
                                message: "Session expired. Please log in again.",
                                status: 401,
                            } as ApiError;
                        }
                    } catch (refreshError) {
                        // Refresh failed, clear tokens and throw an error
                        authApi.logout();
                        // Optionally, redirect to login page here
                        // window.location.href = '/login'; 
                        const typedRefreshError = refreshError as ApiError;
                        throw {
                            message: typedRefreshError.message || "Failed to refresh session. Please log in again.",
                            status: typedRefreshError.status || 401,
                        } as ApiError;
                    }
                }
            }


            const apiError: ApiError = {
                message: errorData.detail?.[0]?.msg || (typeof errorData.detail === 'string' ? errorData.detail : `HTTP ${response.status}: ${response.statusText}`),
                status: response.status,
                details: response.status === 422 ? errorData : undefined,
            };

            throw apiError;
        }

        // Handle cases where response might be empty (e.g., 204 No Content)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json();
        } else {
            // For non-JSON responses or empty responses, return a success indicator or the response object itself
            // This part might need adjustment based on what your API returns for non-JSON success cases
            return { success: true, status: response.status, statusText: response.statusText } as T;
        }

    } catch (error) {
        if (error instanceof Error && 'status' in error) {
            // Re-throw API errors that were already processed or are from the refresh logic
            throw error;
        }
        if (error instanceof SyntaxError) {
            // Handle JSON parsing errors specifically if needed, e.g. when expecting JSON but got HTML
            throw {
                message: "Invalid response from server. Please try again later.",
                status: 0, // Or some other status code to indicate a client-side parsing issue
            } as ApiError;
        }


        // Handle network errors or other unexpected errors
        throw {
            message: "Network error. Please check your connection and try again.",
            status: 0,
        } as ApiError;
    }
}

// Token management functions
export const tokenStorage = {
    setTokens: (
        accessToken: string,
        refreshToken: string,
        expiresIn: number
    ) => {
        localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        const expiryTime = Date.now() + expiresIn * 1000;
        localStorage.setItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
    },

    clearTokens: () => {
        localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);
    },

    getAccessToken: () => localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN),
    getRefreshToken: () => localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN),

    isTokenExpired: () => {
        const expiry = localStorage.getItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);
        if (!expiry) return true;
        return Date.now() > parseInt(expiry, 10);
    },
};

// Authentication API functions
export const authApi = {
    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        return apiCall<RegisterResponse>(API_ENDPOINTS.REGISTER, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    login: async (data: LoginRequest): Promise<LoginResponse> => {
        return apiCall<LoginResponse>(API_ENDPOINTS.LOGIN, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    verifyLogin: async (data: VerifyLoginRequest): Promise<VerifyLoginResponse> => {
        const response = await apiCall<VerifyLoginResponse>(API_ENDPOINTS.VERIFY_LOGIN, {
            method: "POST",
            body: JSON.stringify(data),
        });

        // Store tokens on successful verification
        tokenStorage.setTokens(
            response.access_token,
            response.refresh_token,
            response.expires_in
        );

        return response;
    },

    verifyEmail: async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
        return apiCall<VerifyEmailResponse>(API_ENDPOINTS.VERIFY_EMAIL, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
        const response = await apiCall<RefreshTokenResponse>(
            API_ENDPOINTS.REFRESH_TOKEN,
            {
                method: "POST",
                body: JSON.stringify({ refresh_token: refreshToken }),
            },
            true // Mark as retry so it doesn't get into a loop with itself
        );

        // Update the access token and expiry
        localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
        const expiryTime = Date.now() + response.expires_in * 1000;
        localStorage.setItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());

        return response;
    },

    logout: () => {
        tokenStorage.clearTokens();
    },

    initiateGoogleAuth: async (redirectUri?: string): Promise<GoogleAuthInitResponse> => {
        const params = new URLSearchParams();
        if (redirectUri) {
            params.append('redirect_uri', redirectUri);
        }
        
        const queryString = params.toString();
        const endpoint = `${API_ENDPOINTS.GOOGLE_LOGIN}${queryString ? `?${queryString}` : ''}`;
        
        // Make API call to get authorization URL
        const response = await apiCall<GoogleAuthInitResponse>(endpoint, {
            method: "GET",
        });
        
        // Redirect to Google OAuth URL
        window.location.href = response.authorization_url;
        
        return response;
    },


};

export interface NutritionalSummary {
    total_calories: string;
    total_protein_g: string;
    total_carbs_g: string;
    total_fats_g: string;
    total_fiber_g: string;
    total_sugar_g: string;
    total_water_ml: number;
}

export interface Dish {
    id: number;
    name: string;
    description: string;
    cuisine: string;
    image_urls: string[];
    servings: number;
    calories: string;
    protein_g: string;
    carbs_g: string;
    fats_g: string;
    fiber_g: string;
    sugar_g: string;
}

export interface Intake {
    id: number;
    dish_id: number;
    user_id: number;
    intake_time: string;
    portion_size: string;
    water_ml: number;
    created_at: string;
    dish: Dish;
}

export interface CreateIntakeRequest {
    dish_id: number;
    intake_time: string;
    portion_size: number;
    water_ml: number;
}

export interface TodayIntakesResponse {
    intakes: Intake[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
    nutritional_summary: NutritionalSummary;
}

export const intakesApi = {
    getToday: async (): Promise<TodayIntakesResponse> => {
        return apiCall<TodayIntakesResponse>("/api/v1/intakes/today", {
            method: "GET",
            // Authorization header is now automatically added by apiCall
            // headers: {
            //     Authorization: `Bearer ${tokenStorage.getAccessToken()}`,
            // },
        });
    },

    create: async (data: CreateIntakeRequest): Promise<Intake> => {
        return apiCall<Intake>("/api/v1/intakes/", {
            method: "POST",
            // Authorization header is now automatically added by apiCall
            // headers: {
            //     Authorization: `Bearer ${tokenStorage.getAccessToken()}`,
            // },
            body: JSON.stringify(data),
        });
    },
};

// Profile API types
export interface UserProfile {
    first_name: string;
    last_name: string;
    gender: string;
    height_cm: string;
    weight_kg: string;
    date_of_birth: string;
    location_city: string;
    location_country: string;
    latitude: number | null;
    longitude: number | null;
    profile_image_url: string | null;
    bio: string | null;
    dietary_restrictions: string[] | null;
    allergies: string[] | null;
    medical_conditions: string[];
    fitness_goals: string[];
    taste_preferences: string[];
    cuisine_interests: string[];
    cooking_skill_level: string;
    email_notifications_enabled: boolean;
    push_notifications_enabled: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface UpdateUserProfileRequest {
    first_name?: string;
    last_name?: string;
    gender?: string;
    height_cm?: string;
    weight_kg?: string;
    date_of_birth?: string;
    location_city?: string;
    location_country?: string;
    latitude?: number | null;
    longitude?: number | null;
    profile_image_url?: string | null;
    bio?: string | null;
    dietary_restrictions?: string[] | null;
    allergies?: string[] | null;
    medical_conditions?: string[];
    fitness_goals?: string[];
    taste_preferences?: string[];
    cuisine_interests?: string[];
    cooking_skill_level?: string;
    email_notifications_enabled?: boolean;
    push_notifications_enabled?: boolean;
}

export const profileApi = {
    getMe: async (): Promise<UserProfile> => {
        return apiCall<UserProfile>("/api/v1/profile/me", { method: "GET" });
    },
    updateMe: async (data: UpdateUserProfileRequest): Promise<UserProfile> => {
        return apiCall<UserProfile>("/api/v1/profile/me", {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },
};

export default {
    authApi,
    intakesApi,
    profileApi,
};