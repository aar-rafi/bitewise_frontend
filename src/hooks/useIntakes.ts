import { useQuery } from "@tanstack/react-query";
import { intakesApi, type TodayIntakesResponse, type ApiError } from "@/lib/api";
import { authInterceptor } from "@/lib/authInterceptor";

export const useIntakesToday = () => {
    return useQuery<TodayIntakesResponse, ApiError>({
        queryKey: ["intakes", "today"],
        queryFn: () => authInterceptor.interceptApiCall(() => intakesApi.getToday()),
        staleTime: 30 * 1000, // Consider data fresh for 30 seconds
        refetchInterval: 60 * 1000, // Refetch every minute instead of on every focus
        refetchOnWindowFocus: false, // Don't refetch on window focus to prevent jumping
        refetchOnMount: true,
        refetchOnReconnect: false, // Don't refetch on network reconnect
        refetchIntervalInBackground: false, // Don't refetch when tab is in background
        retry: (failureCount, error) => {
            // Don't retry authentication failures
            if (error?.status === 401) {
                return false;
            }
            // Retry other errors up to 2 times
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
        // Only refetch if data actually changed
        structuralSharing: true,
    });
};

export default {
    useIntakesToday,
}; 