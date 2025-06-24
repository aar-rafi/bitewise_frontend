import { useQuery } from '@tanstack/react-query';
import { 
    statsApi, 
    TimeRangeParams, 
    ComparisonParams,
    QuickStatsResponse,
    ComprehensiveStatsResponse,
    CalorieStatsResponse,
    MacronutrientStatsResponse,
    MicronutrientStatsResponse,
    ConsumptionPatternsResponse,
    ProgressStatsResponse,
    ComparisonResponse,
    TrendsResponse,
    NutritionOverviewResponse
} from '@/services/statsApi';

// Quick stats hook for dashboard
export function useQuickStats() {
    return useQuery({
        queryKey: ['stats', 'quick'],
        queryFn: () => statsApi.getQuickStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

// Comprehensive stats hook
export function useComprehensiveStats(unit: string, num: number) {
    const params = { unit: unit as TimeRangeParams['unit'], num };
    return useQuery({
        queryKey: ['stats', 'comprehensive', params],
        queryFn: () => statsApi.getComprehensiveStats(params),
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!params.unit && !!params.num,
    });
}

// Calorie stats hook
export function useCalorieStats(unit: string, num: number) {
    const params = { unit: unit as TimeRangeParams['unit'], num };
    return useQuery({
        queryKey: ['stats', 'calories', params],
        queryFn: () => statsApi.getCalorieStats(params),
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!params.unit && !!params.num,
    });
}

// Macronutrient stats hook
export function useMacronutrientStats(unit: string, num: number) {
    const params = { unit: unit as TimeRangeParams['unit'], num };
    return useQuery({
        queryKey: ['stats', 'macronutrients', params],
        queryFn: () => statsApi.getMacronutrientStats(params),
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!params.unit && !!params.num,
    });
}

// Micronutrient stats hook
export function useMicronutrientStats(unit: string, num: number) {
    const params = { unit: unit as TimeRangeParams['unit'], num };
    return useQuery({
        queryKey: ['stats', 'micronutrients', params],
        queryFn: () => statsApi.getMicronutrientStats(params),
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!params.unit && !!params.num,
    });
}

// Nutrition overview hook (combines calories, macros, and micros)
export function useNutritionOverview(unit: string, num: number) {
    const params = { unit: unit as TimeRangeParams['unit'], num };
    return useQuery({
        queryKey: ['stats', 'nutrition-overview', params],
        queryFn: () => statsApi.getNutritionOverview(params),
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!params.unit && !!params.num,
    });
}

// Consumption patterns hook
export function useConsumptionPatterns(unit: string, num: number) {
    const params = { unit: unit as TimeRangeParams['unit'], num };
    return useQuery({
        queryKey: ['stats', 'consumption-patterns', params],
        queryFn: () => statsApi.getConsumptionPatterns(params),
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!params.unit && !!params.num,
    });
}

// Cuisine statistics hook (extracted from consumption patterns)
export function useCuisineStats(unit: string, num: number) {
    const params = { unit: unit as TimeRangeParams['unit'], num };
    return useQuery({
        queryKey: ['stats', 'cuisine', params],
        queryFn: async () => {
            const data = await statsApi.getConsumptionPatterns(params);
            return data.cuisine_distribution;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!params.unit && !!params.num,
    });
}

// Top dishes statistics hook (extracted from consumption patterns)
export function useTopDishesStats(unit: string, num: number) {
    const params = { unit: unit as TimeRangeParams['unit'], num };
    return useQuery({
        queryKey: ['stats', 'top-dishes', params],
        queryFn: async () => {
            const data = await statsApi.getConsumptionPatterns(params);
            return data.top_dishes;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!params.unit && !!params.num,
    });
}

// Progress stats hook
export function useProgressStats(unit: string, num: number) {
    const params = { unit: unit as TimeRangeParams['unit'], num };
    return useQuery({
        queryKey: ['stats', 'progress', params],
        queryFn: () => statsApi.getProgressStats(params),
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!params.unit && !!params.num,
    });
}

// Comparison hook
export function useComparison(params: ComparisonParams) {
    return useQuery({
        queryKey: ['stats', 'comparison', params],
        queryFn: () => statsApi.getComparison(params),
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!params.current_unit && !!params.current_num && !!params.previous_unit && !!params.previous_num,
    });
}

// Trends hook
export function useTrends(unit: string, num: number) {
    const params = { unit: unit as TimeRangeParams['unit'], num };
    return useQuery({
        queryKey: ['stats', 'trends', params],
        queryFn: () => statsApi.getTrends(params),
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!params.unit && !!params.num,
    });
} 