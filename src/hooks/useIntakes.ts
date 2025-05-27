import { useQuery } from "@tanstack/react-query";
import { intakesApi, type TodayIntakesResponse } from "@/lib/api";

export const useIntakesToday = () => {
    return useQuery<TodayIntakesResponse>({
        queryKey: ["intakes", "today"],
        queryFn: () => intakesApi.getToday(),
        staleTime: 30 * 1000, // Consider data fresh for 30 seconds
        refetchInterval: 60 * 1000, // Refetch every minute instead of on every focus
        refetchOnWindowFocus: false, // Don't refetch on window focus to prevent jumping
        refetchOnMount: true,
        refetchOnReconnect: false, // Don't refetch on network reconnect
        refetchIntervalInBackground: false, // Don't refetch when tab is in background
        retry: 2,
        retryDelay: 1000, // Wait 1 second between retries
        // Only refetch if data actually changed
        structuralSharing: true,
    });
};

export default {
    useIntakesToday,
}; 