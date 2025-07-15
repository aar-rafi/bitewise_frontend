// API base URL - this should be configured based on your backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// API endpoint paths
const API_ENDPOINTS = {
    REGISTER: "/api/v1/auth/register",
    LOGIN: "/api/v1/auth/login",
    VERIFY_EMAIL: "/api/v1/auth/verify-email",
    VERIFY_LOGIN: "/api/v1/auth/verify-login",
    REFRESH_TOKEN: "/api/v1/auth/refresh",
    LOGOUT: "/api/v1/auth/logout",
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

export interface DirectLoginResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    user_id: string;
    message: string;
    otp_required: boolean;
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
        if (response.status === 204) {
            // For 204 No Content, return undefined (void)
            return undefined as T;
        } else if (contentType && contentType.indexOf("application/json") !== -1) {
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

    login: async (data: LoginRequest): Promise<LoginResponse | DirectLoginResponse> => {
        const response = await apiCall<LoginResponse | DirectLoginResponse>(API_ENDPOINTS.LOGIN, {
            method: "POST",
            body: JSON.stringify(data),
        });

        // If it's a direct login response (contains access_token), store the tokens
        if ('access_token' in response) {
            tokenStorage.setTokens(
                response.access_token,
                response.refresh_token,
                response.expires_in
            );
        }

        return response;
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

    logout: async () => {
        try {
            // Call backend to invalidate refresh tokens
            await apiCall<{ message: string }>(API_ENDPOINTS.LOGOUT, {
                method: "POST",
            });
        } catch (error) {
            // Even if backend call fails, we should still clear local tokens
            console.error("Error during logout API call:", error);
        } finally {
            // Always clear local tokens regardless of backend response
            tokenStorage.clearTokens();
        }
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

// Extended Dish interface matching DishResponse from backend
export interface DishResponse {
    id: number;
    name: string;
    description?: string;
    cuisine?: string;
    cooking_steps?: string[];
    prep_time_minutes?: number;
    cook_time_minutes?: number;
    image_urls?: string[];
    servings?: number;
    created_by_user_id?: number;
    created_at: string;
    updated_at: string;
    // Nutritional information
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fats_g?: number;
    sat_fats_g?: number;
    unsat_fats_g?: number;
    trans_fats_g?: number;
    fiber_g?: number;
    sugar_g?: number;
    calcium_mg?: number;
    iron_mg?: number;
    potassium_mg?: number;
    sodium_mg?: number;
    zinc_mg?: number;
    magnesium_mg?: number;
    vit_a_mcg?: number;
    vit_b1_mg?: number;
    vit_b2_mg?: number;
    vit_b3_mg?: number;
    vit_b5_mg?: number;
    vit_b6_mg?: number;
    vit_b9_mcg?: number;
    vit_b12_mcg?: number;
    vit_c_mg?: number;
    vit_d_mcg?: number;
    vit_e_mg?: number;
    vit_k_mcg?: number;
}

export interface DishListItem {
    id: number;
    name: string;
    description?: string;
    cuisine?: string;
    prep_time_minutes?: number;
    cook_time_minutes?: number;
    servings?: number;
    image_urls?: string[];
    created_by_user_id?: number;
    created_at: string;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fats_g?: number;
}

export interface DishListResponse {
    dishes: DishListItem[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface DishUpdateRequest {
    name?: string;
    description?: string;
    cuisine?: string;
    cooking_steps?: string[];
    prep_time_minutes?: number;
    cook_time_minutes?: number;
    image_urls?: string[];
    servings?: number;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fats_g?: number;
    sat_fats_g?: number;
    unsat_fats_g?: number;
    trans_fats_g?: number;
    fiber_g?: number;
    sugar_g?: number;
    calcium_mg?: number;
    iron_mg?: number;
    potassium_mg?: number;
    sodium_mg?: number;
    zinc_mg?: number;
    magnesium_mg?: number;
    vit_a_mcg?: number;
    vit_b1_mg?: number;
    vit_b2_mg?: number;
    vit_b3_mg?: number;
    vit_b5_mg?: number;
    vit_b6_mg?: number;
    vit_b9_mcg?: number;
    vit_b12_mcg?: number;
    vit_c_mg?: number;
    vit_d_mcg?: number;
    vit_e_mg?: number;
    vit_k_mcg?: number;
}

export interface DishCreateRequest {
    name: string;
    description?: string;
    cuisine?: string;
    cooking_steps?: string[];
    prep_time_minutes?: number;
    cook_time_minutes?: number;
    image_urls?: string[];
    servings?: number;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fats_g?: number;
    sat_fats_g?: number;
    unsat_fats_g?: number;
    trans_fats_g?: number;
    fiber_g?: number;
    sugar_g?: number;
    calcium_mg?: number;
    iron_mg?: number;
    potassium_mg?: number;
    sodium_mg?: number;
    zinc_mg?: number;
    magnesium_mg?: number;
    vit_a_mcg?: number;
    vit_b1_mg?: number;
    vit_b2_mg?: number;
    vit_b3_mg?: number;
    vit_b5_mg?: number;
    vit_b6_mg?: number;
    vit_b9_mcg?: number;
    vit_b12_mcg?: number;
    vit_c_mg?: number;
    vit_d_mcg?: number;
    vit_e_mg?: number;
    vit_k_mcg?: number;
}

export interface DishFilterParams {
    search?: string;
    cuisine?: string;
    has_image?: boolean;
    min_prep_time?: number;
    max_prep_time?: number;
    min_cook_time?: number;
    max_cook_time?: number;
    min_servings?: number;
    max_servings?: number;
    min_calories?: number;
    max_calories?: number;
    min_protein?: number;
    max_protein?: number;
    min_carbs?: number;
    max_carbs?: number;
    min_fats?: number;
    max_fats?: number;
    min_sugar?: number;
    max_sugar?: number;
}

export interface IntakeFilterParams {
    // Intake-specific filters
    min_intake_time?: string; // ISO format datetime string
    max_intake_time?: string; // ISO format datetime string
    min_portion_size?: number;
    max_portion_size?: number;
    min_water_ml?: number;
    max_water_ml?: number;
    // Dish-based filters
    dish_search?: string;
    cuisine?: string;
    has_image?: boolean;
    min_prep_time?: number;
    max_prep_time?: number;
    min_cook_time?: number;
    max_cook_time?: number;
    min_servings?: number;
    max_servings?: number;
    min_calories?: number;
    max_calories?: number;
    min_protein?: number;
    max_protein?: number;
    min_carbs?: number;
    max_carbs?: number;
    min_fats?: number;
    max_fats?: number;
    min_sugar?: number;
    max_sugar?: number;
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

    getAll: async (page = 1, page_size = 20): Promise<TodayIntakesResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: page_size.toString()
        });
        
        return apiCall<TodayIntakesResponse>(`/api/v1/intakes?${params.toString()}`, {
            method: "GET",
        });
    },

    filter: async (filters: IntakeFilterParams, page = 1, page_size = 20): Promise<TodayIntakesResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: page_size.toString()
        });
        
        // Add all filter parameters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });
        
        return apiCall<TodayIntakesResponse>(`/api/v1/intakes/filter?${params.toString()}`, {
            method: "GET",
        });
    },

    getById: async (intakeId: number): Promise<Intake> => {
        return apiCall<Intake>(`/api/v1/intakes/${intakeId}`, {
            method: "GET",
        });
    },

    update: async (intakeId: number, data: Partial<CreateIntakeRequest>): Promise<Intake> => {
        return apiCall<Intake>(`/api/v1/intakes/${intakeId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    delete: async (intakeId: number): Promise<void> => {
        await apiCall<void>(`/api/v1/intakes/${intakeId}`, {
            method: "DELETE",
        });
    },

    searchDishes: async (search: string, page = 1, page_size = 10): Promise<DishListResponse> => {
        const params = new URLSearchParams({
            search: search,
            page: page.toString(),
            page_size: page_size.toString()
        });
        
        return apiCall<DishListResponse>(`/api/v1/dishes?${params.toString()}`, {
            method: "GET",
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

export interface ProfilePictureUploadResponse {
    success: boolean;
    profile_image_url: string;
    filename: string;
    size: number;
    metadata: Record<string, unknown>;
    message: string;
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
    getMessageCount: async (): Promise<number> => {
        return apiCall<number>("/api/v1/profile/message-count", { method: "GET" });
    },
    deleteMessages: async (): Promise<number> => {
        return apiCall<number>("/api/v1/profile/delete-messages", {method: "GET"});
    },
    uploadProfilePicture: async (file: File): Promise<ProfilePictureUploadResponse> => {
        const formData = new FormData();
        formData.append("image", file);
        
        const response = await fetch(`${API_BASE_URL}/api/v1/profile/me/profile-picture`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${tokenStorage.getAccessToken()}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Upload failed" }));
            throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    },
};

export const dishesApi = {
    search: async (search?: string, page = 1, page_size = 20): Promise<DishListResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: page_size.toString()
        });
        if (search) {
            params.append('search', search);
        }
        
        return apiCall<DishListResponse>(`/api/v1/dishes?${params.toString()}`, {
            method: "GET",
        });
    },

    filter: async (filters: DishFilterParams, page = 1, page_size = 20): Promise<DishListResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: page_size.toString()
        });
        
        // Add all filter parameters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });
        
        return apiCall<DishListResponse>(`/api/v1/dishes/filter?${params.toString()}`, {
            method: "GET",
        });
    },

    create: async (data: DishCreateRequest): Promise<DishResponse> => {
        return apiCall<DishResponse>(`/api/v1/dishes`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    getById: async (dishId: number): Promise<DishResponse> => {
        return apiCall<DishResponse>(`/api/v1/dishes/${dishId}`, {
            method: "GET",
        });
    },

    update: async (dishId: number, data: DishUpdateRequest): Promise<DishResponse> => {
        return apiCall<DishResponse>(`/api/v1/dishes/${dishId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    delete: async (dishId: number): Promise<void> => {
        await apiCall<void>(`/api/v1/dishes/${dishId}`, {
            method: "DELETE",
        });
    },
};

// Types for Messages API
export interface Message {
    id: number;
    conversation_id: number;
    user_id: number;
    content: string;
    is_user_message: boolean;
    llm_model_id: number | null;
    input_tokens: number | null;
    output_tokens: number | null;
    parent_message_id: number | null;
    message_type: string;
    attachments?: Record<string, unknown>;
    reactions?: Record<string, unknown>;
    status: string;
    created_at: string;
    updated_at: string;
    extra_data?: Record<string, unknown>;
}

export interface MessageListResponse {
    messages: Message[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface MessageCreateRequest {
    content: string;
    message_type?: string;
    attachments?: Record<string, unknown>;
    extra_data?: Record<string, unknown>;
    parent_message_id?: number;
}

export interface MessageUpdateRequest {
    content?: string;
    status?: string;
    reactions?: Record<string, unknown>;
    extra_data?: Record<string, unknown>;
}

export interface MessageFilterParams {
    search?: string; // Search in content
    conversation_id?: number; // Filter by conversation ID
    is_user_message?: boolean;
    message_type?: string;
    status?: string;
    min_created_at?: string;
    max_created_at?: string;
    has_attachments?: boolean;
    min_tokens?: number;
    max_tokens?: number;
}

// Types for Conversations API
export interface Conversation {
    id: number;
    user_id: number;
    title?: string;
    status: string;
    created_at: string;
    updated_at: string;
    extra_data?: Record<string, unknown>;
    last_message_preview?: string;
    last_message_time?: string;
    unread_count?: number;
}

export interface ConversationListResponse {
    conversations: Conversation[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface ConversationCreateRequest {
    title?: string;
    extra_data?: Record<string, unknown>;
}

export interface ConversationUpdateRequest {
    title?: string;
    status?: string;
    extra_data?: Record<string, unknown>;
}

export interface ConversationFilterParams {
    search?: string; // Search in title
    status?: string;
    min_created_at?: string;
    max_created_at?: string;
    min_message_count?: number;
    max_message_count?: number;
}

// Types for Users API (Admin level)
export interface UserItem {
    id: number;
    email: string;
    username: string;
    full_name?: string;
    is_active: boolean;
    is_verified: boolean;
    is_superuser: boolean;
    oauth_provider?: string;
    created_at: string;
    updated_at: string;
    last_login_at?: string;
    // Profile fields
    first_name?: string;
    last_name?: string;
    gender?: string;
    height_cm?: string;
    weight_kg?: string;
    date_of_birth?: string;
    location_city?: string;
    location_country?: string;
    dietary_restrictions?: string[];
    allergies?: string[];
    medical_conditions?: string[];
    fitness_goals?: string[];
    taste_preferences?: string[];
    cuisine_interests?: string[];
    cooking_skill_level?: string;
}

export interface UserListResponse {
    users: UserItem[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface UserFilterParams {
    search?: string; // Search in email, username, full_name
    is_active?: boolean;
    is_verified?: boolean;
    is_superuser?: boolean;
    oauth_provider?: string;
    min_created_at?: string;
    max_created_at?: string;
    min_last_login?: string;
    max_last_login?: string;
    gender?: string;
    location_city?: string;
    location_country?: string;
    dietary_restrictions?: string;
    allergies?: string;
    medical_conditions?: string;
    fitness_goals?: string;
    cooking_skill_level?: string;
    min_height?: number;
    max_height?: number;
    min_weight?: number;
    max_weight?: number;
}

// Messages API
export const messagesApi = {
    getAll: async (page = 1, page_size = 50): Promise<MessageListResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: page_size.toString()
        });
        
        return apiCall<MessageListResponse>(`/api/v1/chat/messages?${params.toString()}`, {
            method: "GET",
        });
    },

    filterAll: async (filters: MessageFilterParams, page = 1, page_size = 50): Promise<MessageListResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: page_size.toString()
        });
        
        // Add all filter parameters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });
        
        return apiCall<MessageListResponse>(`/api/v1/chat/messages/filter?${params.toString()}`, {
            method: "GET",
        });
    },

    getByConversation: async (conversationId: number, page = 1, page_size = 50): Promise<MessageListResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: page_size.toString()
        });
        
        return apiCall<MessageListResponse>(`/api/v1/chat/conversations/${conversationId}/messages?${params.toString()}`, {
            method: "GET",
        });
    },

    filter: async (conversationId: number, filters: MessageFilterParams, page = 1, page_size = 50): Promise<MessageListResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: page_size.toString()
        });
        
        // Add all filter parameters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });
        
        return apiCall<MessageListResponse>(`/api/v1/chat/conversations/${conversationId}/messages?${params.toString()}`, {
            method: "GET",
        });
    },

    create: async (conversationId: number, data: MessageCreateRequest): Promise<Message> => {
        return apiCall<Message>(`/api/v1/chat/conversations/${conversationId}/messages`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    getById: async (messageId: number): Promise<Message> => {
        return apiCall<Message>(`/api/v1/chat/messages/${messageId}`, {
            method: "GET",
        });
    },

    update: async (messageId: number, data: MessageUpdateRequest): Promise<Message> => {
        return apiCall<Message>(`/api/v1/chat/messages/${messageId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    delete: async (messageId: number): Promise<void> => {
        await apiCall<void>(`/api/v1/chat/messages/${messageId}`, {
            method: "DELETE",
        });
    },
};

// Conversations API
export const conversationsApi = {
    getAll: async (page = 1, page_size = 20): Promise<ConversationListResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: page_size.toString()
        });
        
        return apiCall<ConversationListResponse>(`/api/v1/chat/conversations?${params.toString()}`, {
            method: "GET",
        });
    },

    filter: async (filters: ConversationFilterParams, page = 1, page_size = 20): Promise<ConversationListResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: page_size.toString()
        });
        
        // Add all filter parameters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });
        
        return apiCall<ConversationListResponse>(`/api/v1/chat/conversations?${params.toString()}`, {
            method: "GET",
        });
    },

    create: async (data: ConversationCreateRequest): Promise<Conversation> => {
        return apiCall<Conversation>(`/api/v1/chat/conversations`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    getById: async (conversationId: number): Promise<Conversation> => {
        return apiCall<Conversation>(`/api/v1/chat/conversations/${conversationId}`, {
            method: "GET",
        });
    },

    update: async (conversationId: number, data: ConversationUpdateRequest): Promise<Conversation> => {
        return apiCall<Conversation>(`/api/v1/chat/conversations/${conversationId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    delete: async (conversationId: number): Promise<void> => {
        await apiCall<void>(`/api/v1/chat/conversations/${conversationId}`, {
            method: "DELETE",
        });
    },
};

// Users API (Admin level - using profile endpoints)
export const usersApi = {
    getAll: async (page = 1, page_size = 20): Promise<UserListResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: page_size.toString()
        });
        
        return apiCall<UserListResponse>(`/api/v1/profile/all?${params.toString()}`, {
            method: "GET",
        });
    },

    filter: async (filters: UserFilterParams, page = 1, page_size = 20): Promise<UserListResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: page_size.toString()
        });
        
        // Add all filter parameters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });
        
        return apiCall<UserListResponse>(`/api/v1/profile/filter?${params.toString()}`, {
            method: "GET",
        });
    },

    getById: async (userId: number): Promise<UserItem> => {
        return apiCall<UserItem>(`/api/v1/profile/${userId}`, {
            method: "GET",
        });
    },

    update: async (userId: number, data: Partial<UpdateUserProfileRequest>): Promise<UserItem> => {
        return apiCall<UserItem>(`/api/v1/profile/${userId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    delete: async (userId: number): Promise<void> => {
        await apiCall<void>(`/api/v1/profile/${userId}`, {
            method: "DELETE",
        });
    },
};



// Test API types
export interface TestItem {
    id: number;
    name: string;
    created_at: string;
    updated_at?: string;
}

export interface TestResponse {
    id: number;
    name: string;
    created_at: string;
    updated_at?: string;
}

export interface TestListResponse {
    tests: TestItem[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface TestCreateRequest {
    name: string;
}

export interface TestUpdateRequest {
    name?: string;
}

export interface TestFilterParams {
    search?: string;
}

// Tests API
export const testsApi = {
    getAll: async (page = 1, page_size = 20): Promise<TestListResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: page_size.toString()
        });
        
        return apiCall<TestListResponse>(`/api/v1/tests?${params.toString()}`, {
            method: "GET",
        });
    },

    filter: async (filters: TestFilterParams, page = 1, page_size = 20): Promise<TestListResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: page_size.toString()
        });
        
        // Add filter parameters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });
        
        return apiCall<TestListResponse>(`/api/v1/tests?${params.toString()}`, {
            method: "GET",
        });
    },

    create: async (data: TestCreateRequest): Promise<TestResponse> => {
        return apiCall<TestResponse>(`/api/v1/tests`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    update: async (testId: number, data: TestUpdateRequest): Promise<TestResponse> => {
        return apiCall<TestResponse>(`/api/v1/tests/${testId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    delete: async (testId: number): Promise<void> => {
        await apiCall<void>(`/api/v1/tests/${testId}`, {
            method: "DELETE",
        });
    },
};



export default {
    authApi,
    intakesApi,
    profileApi,
    dishesApi,
    messagesApi,
    conversationsApi,
    usersApi,
    testsApi
};