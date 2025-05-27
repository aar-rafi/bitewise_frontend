import { useQuery } from "@tanstack/react-query";
import { intakesApi, type TodayIntakesResponse } from "@/lib/api";

export const useIntakesToday = () => {
    return useQuery<TodayIntakesResponse>({
        queryKey: ["intakes", "today"],
        queryFn: () => intakesApi.getToday(),
    });
};

export default {
    useIntakesToday,
}; 