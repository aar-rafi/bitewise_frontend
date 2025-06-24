import { TopDish } from '@/services/statsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface TopDishesChartProps {
    data: TopDish[];
    title?: string;
    className?: string;
}

// Helper function to safely convert to number
const safeNumber = (value: unknown): number => {
    const num = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    return isNaN(num) ? 0 : num;
};

export default function TopDishesChart({ data, title = "Top Dishes", className }: TopDishesChartProps) {
    // Get top 3 dishes
    const topDishes = data
        .sort((a, b) => b.consumption_count - a.consumption_count)
        .slice(0, 3);

    return (
        <Card className={`relative overflow-hidden bg-gradient-to-br from-green-50/80 to-teal-50/80 border-2 border-green-200/60 backdrop-blur-sm ${className}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                    <Utensils className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg font-bold text-green-900">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {/* Top 3 dishes list */}
                <div className="space-y-2">
                    {topDishes.length > 0 ? (
                        topDishes.map((dish, index) => (
                            <div 
                                key={dish.dish_id} 
                                className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                                    index % 2 === 0 ? 'bg-white/70' : 'bg-green-50/70'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                                        #{index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 text-sm">{dish.dish_name}</div>
                                        <div className="text-xs text-gray-600">{dish.cuisine}</div>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="text-lg font-bold text-green-900">{dish.consumption_count}x</div>
                                    <div className="text-xs text-gray-600 flex items-center justify-end">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {format(parseISO(dish.last_consumed), 'MMM dd')}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Avg: {safeNumber(dish.avg_portion_size).toFixed(1)}x portion
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Utensils className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No dishes recorded yet</p>
                        </div>
                    )}
                </div>

                {/* Summary stats */}
                {data.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-green-100/50 rounded-lg p-3 text-center">
                            <div className="text-xs text-green-700 font-medium">Total Dishes Tried</div>
                            <div className="text-xl font-bold text-green-900">{data.length}</div>
                        </div>
                        <div className="bg-teal-100/50 rounded-lg p-3 text-center">
                            <div className="text-xs text-teal-700 font-medium">Most Popular</div>
                            <div className="text-xl font-bold text-teal-900">
                                {data[0]?.consumption_count || 0}x
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 