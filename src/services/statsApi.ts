import { authApi } from '@/lib/api';

// Import the existing API infrastructure
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Time unit types for statistics API
export type TimeUnit = 'hour' | 'day' | 'week' | 'month' | 'year';

// API endpoint paths for statistics
const STATS_API_ENDPOINTS = {
    QUICK: "/api/v1/stats/quick",
    COMPREHENSIVE: "/api/v1/stats/comprehensive",
    CALORIES: "/api/v1/stats/calories",
    MACRONUTRIENTS: "/api/v1/stats/macronutrients",
    MICRONUTRIENTS: "/api/v1/stats/micronutrients",
    NUTRITION_OVERVIEW: "/api/v1/stats/nutrition-overview",
    CONSUMPTION_PATTERNS: "/api/v1/stats/consumption-patterns",
    PROGRESS: "/api/v1/stats/progress",
    COMPARISON: "/api/v1/stats/comparison",
    TRENDS: "/api/v1/stats/trends",
} as const;

// Time range parameters interface
export interface TimeRangeParams {
    unit: TimeUnit;
    num: number;
}

// Comparison parameters interface
export interface ComparisonParams {
    current_unit: TimeUnit;
    current_num: number;
    previous_unit: TimeUnit;
    previous_num: number;
}

// Statistics response interfaces
export interface QuickStatsResponse {
    today_calories: number;
    today_goal_percentage: number;
    weekly_avg_calories: number;
    top_cuisine_this_week: string;
    total_dishes_tried: number;
    current_streak_days: number;
    weight_change_this_month: number;
}

export interface CalorieDataPoint {
    timestamp: string;
    calories: number;
    goal_calories: number;
    deficit_surplus: number;
}

export interface CalorieStatsResponse {
    data_points: CalorieDataPoint[];
    avg_daily_calories: number;
    total_calories: number;
    peak_consumption_hour: number;
    days_above_goal: number;
    days_below_goal: number;
}

export interface MacronutrientBreakdown {
    carbs_percentage: number;
    protein_percentage: number;
    fats_percentage: number;
    carbs_grams: number;
    protein_grams: number;
    fats_grams: number;
    fiber_grams: number;
    sugar_grams: number;
    saturated_fats_grams: number;
    unsaturated_fats_grams: number;
}

export interface MacroDataPoint {
    date: string;
    carbs_g: number;
    protein_g: number;
    fats_g: number;
    fiber_g: number;
    sugar_g: number;
}

export interface MacronutrientStatsResponse {
    current_breakdown: MacronutrientBreakdown;
    data_points: MacroDataPoint[];
    avg_breakdown: MacronutrientBreakdown;
}

export interface MicronutrientValue {
    amount: number;
    unit: string;
    daily_value_percentage: number;
}

export interface MicronutrientStatsResponse {
    vitamins: Record<string, MicronutrientValue>;
    minerals: Record<string, MicronutrientValue>;
    deficiency_alerts: string[];
}

export interface TopDish {
    dish_id: number;
    dish_name: string;
    cuisine: string;
    consumption_count: number;
    last_consumed: string;
    avg_portion_size: number;
}

export interface CuisineDistribution {
    cuisine: string;
    consumption_count: number;
    percentage: number;
    calories_consumed: number;
}

export interface EatingPattern {
    hour: number;
    intake_count: number;
    avg_calories: number;
}

export interface ConsumptionPatternsResponse {
    top_dishes: TopDish[];
    cuisine_distribution: CuisineDistribution[];
    eating_patterns: EatingPattern[];
    dishes_tried_count: number;
    unique_cuisines_count: number;
    avg_meals_per_day: number;
    weekend_vs_weekday_ratio: number;
}

export interface HealthMetric {
    date: string;
    weight_kg: number;
    bmi: number;
    calories_consumed: number;
    goal_adherence_percentage: number;
}

export interface ProgressStatsResponse {
    health_metrics: HealthMetric[];
    weight_trend: string;
    avg_goal_adherence: number;
    dietary_restriction_compliance: number;
    best_nutrition_day: string;
    improvement_trend: string;
}

export interface NutritionOverviewResponse {
    calorie_stats: CalorieStatsResponse;
    macronutrient_stats: MacronutrientStatsResponse;
    micronutrient_stats: MicronutrientStatsResponse;
}

export interface ComprehensiveStatsResponse {
    time_range: {
        start_date: string;
        end_date: string;
        period: string;
    };
    nutrition_overview: NutritionOverviewResponse;
    consumption_patterns: ConsumptionPatternsResponse;
    progress_stats: ProgressStatsResponse;
    advanced_analytics: {
        correlations: Array<{
            factor1: string;
            factor2: string;
            correlation_strength: number;
            description: string;
        }>;
        predictions: Array<{
            metric: string;
            predicted_value: number;
            confidence_level: number;
            time_horizon_days: number;
            recommendation: string;
        }>;
        optimization_suggestions: string[];
    };
    generated_at: string;
}

export interface ComparisonResponse {
    current_period: {
        avg_daily_calories: number;
        dishes_tried: number;
        goal_adherence: number;
    };
    previous_period: {
        avg_daily_calories: number;
        dishes_tried: number;
        goal_adherence: number;
    };
    changes: {
        avg_daily_calories: number;
        dish_variety: number;
        goal_adherence: number;
    };
    insights: string[];
}

export interface TrendDataPoint {
    date: string;
    calories: number;
}

export interface MacroTrendDataPoint {
    date: string;
    carbs: number;
    protein: number;
    fats: number;
}

export interface TrendsResponse {
    period: string;
    calorie_trend: TrendDataPoint[];
    macronutrient_trend: MacroTrendDataPoint[];
    insights: string[];
}

// Generic API call function for statistics (similar to chatApi)
async function statsApiCall<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Get access token from localStorage
    const accessToken = localStorage.getItem("access_token");

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

            // If 401 and we have a refresh token, try to refresh
            if (response.status === 401) {
                const refreshToken = localStorage.getItem("refresh_token");
                if (refreshToken) {
                    try {
                        // Try to refresh the token using the existing auth API
                        const refreshResponse = await authApi.refreshToken(refreshToken);

                        // Retry the original request with new token
                        const newConfig = { ...config };
                        if (newConfig.headers) {
                            (newConfig.headers as Record<string, string>)["Authorization"] = `Bearer ${refreshResponse.access_token}`;
                        }

                        const retryResponse = await fetch(url, newConfig);
                        if (!retryResponse.ok) {
                            throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
                        }

                        const contentType = retryResponse.headers.get("content-type");
                        if (contentType && contentType.indexOf("application/json") !== -1) {
                            return await retryResponse.json();
                        } else {
                            return { success: true, status: retryResponse.status } as T;
                        }
                    } catch (refreshError) {
                        // Refresh failed, clear tokens
                        localStorage.removeItem("access_token");
                        localStorage.removeItem("refresh_token");
                        localStorage.removeItem("token_expiry");
                        throw new Error("Session expired. Please log in again.");
                    }
                }
            }

            throw new Error(
                errorData.detail?.[0]?.msg ||
                (typeof errorData.detail === 'string' ? errorData.detail : `HTTP ${response.status}: ${response.statusText}`)
            );
        }

        // Handle JSON and non-JSON responses
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json();
        } else {
            return { success: true, status: response.status } as T;
        }

    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Network error. Please check your connection and try again.");
    }
}

// Helper function to build query parameters
function buildQueryParams(params: TimeRangeParams | ComparisonParams): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            searchParams.append(key, value.toString());
        }
    });
    return searchParams.toString();
}

export const statsApi = {
    // Quick stats for dashboard
    async getQuickStats(): Promise<QuickStatsResponse> {
        return statsApiCall<QuickStatsResponse>(STATS_API_ENDPOINTS.QUICK);
    },

    // Comprehensive stats
    async getComprehensiveStats(params: TimeRangeParams): Promise<ComprehensiveStatsResponse> {
        const queryParams = buildQueryParams(params);
        return statsApiCall<ComprehensiveStatsResponse>(`${STATS_API_ENDPOINTS.COMPREHENSIVE}?${queryParams}`);
    },

    // Calorie statistics
    async getCalorieStats(params: TimeRangeParams): Promise<CalorieStatsResponse> {
        const queryParams = buildQueryParams(params);
        return statsApiCall<CalorieStatsResponse>(`${STATS_API_ENDPOINTS.CALORIES}?${queryParams}`);
    },

    // Macronutrient statistics
    async getMacronutrientStats(params: TimeRangeParams): Promise<MacronutrientStatsResponse> {
        const queryParams = buildQueryParams(params);
        return statsApiCall<MacronutrientStatsResponse>(`${STATS_API_ENDPOINTS.MACRONUTRIENTS}?${queryParams}`);
    },

    // Micronutrient statistics
    async getMicronutrientStats(params: TimeRangeParams): Promise<MicronutrientStatsResponse> {
        const queryParams = buildQueryParams(params);
        return statsApiCall<MicronutrientStatsResponse>(`${STATS_API_ENDPOINTS.MICRONUTRIENTS}?${queryParams}`);
    },

    // Nutrition overview (calories + macros + micros)
    async getNutritionOverview(params: TimeRangeParams): Promise<NutritionOverviewResponse> {
        const queryParams = buildQueryParams(params);
        return statsApiCall<NutritionOverviewResponse>(`${STATS_API_ENDPOINTS.NUTRITION_OVERVIEW}?${queryParams}`);
    },

    // Consumption patterns
    async getConsumptionPatterns(params: TimeRangeParams): Promise<ConsumptionPatternsResponse> {
        const queryParams = buildQueryParams(params);
        return statsApiCall<ConsumptionPatternsResponse>(`${STATS_API_ENDPOINTS.CONSUMPTION_PATTERNS}?${queryParams}`);
    },

    // Progress statistics
    async getProgressStats(params: TimeRangeParams): Promise<ProgressStatsResponse> {
        const queryParams = buildQueryParams(params);
        return statsApiCall<ProgressStatsResponse>(`${STATS_API_ENDPOINTS.PROGRESS}?${queryParams}`);
    },

    // Period comparison
    async getComparison(params: ComparisonParams): Promise<ComparisonResponse> {
        const queryParams = buildQueryParams(params);
        return statsApiCall<ComparisonResponse>(`${STATS_API_ENDPOINTS.COMPARISON}?${queryParams}`);
    },

    // Trend analysis
    async getTrends(params: TimeRangeParams): Promise<TrendsResponse> {
        const queryParams = buildQueryParams(params);
        return statsApiCall<TrendsResponse>(`${STATS_API_ENDPOINTS.TRENDS}?${queryParams}`);
    },
}; 