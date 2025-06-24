import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart3, Calendar, Clock, TrendingUp, Activity, Utensils, PieChart, RefreshCw } from 'lucide-react';
import CalorieChart from '@/components/stats/CalorieChart';
import MacronutrientChart from '@/components/stats/MacronutrientChart';
import CuisineChart from '@/components/stats/CuisineChart';
import TopDishesChart from '@/components/stats/TopDishesChart';
import { useQuickStats, useComprehensiveStats } from '@/hooks/useStats';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

type TimeUnit = 'hour' | 'day' | 'week' | 'month';

// Helper functions for localStorage
const getStoredTimeUnit = (): TimeUnit => {
    try {
        const stored = localStorage.getItem('stats-time-unit');
        if (stored && ['hour', 'day', 'week', 'month'].includes(stored)) {
            return stored as TimeUnit;
        }
    } catch (error) {
        console.warn('Error reading time unit from localStorage:', error);
    }
    return 'day'; // default
};

const getStoredQuantity = (timeUnit: TimeUnit): number => {
    try {
        const stored = localStorage.getItem('stats-quantity');
        const parsedQuantity = stored ? parseInt(stored) : null;
        
        // Validate that the stored quantity is valid for the current time unit
        const validOptions = getQuantityOptionsForUnit(timeUnit);
        if (parsedQuantity && validOptions.includes(parsedQuantity)) {
            return parsedQuantity;
        }
    } catch (error) {
        console.warn('Error reading quantity from localStorage:', error);
    }
    
    // Return default quantity for the time unit
    const options = getQuantityOptionsForUnit(timeUnit);
    return options[1] || options[0]; // Second option or first if only one
};

const getQuantityOptionsForUnit = (unit: TimeUnit): number[] => {
    switch (unit) {
        case 'hour':
            return [6, 12, 24, 48];
        case 'day':
            return [3, 7, 14, 30];
        case 'week':
            return [2, 4, 8, 12];
        case 'month':
            return [3, 6, 12, 24];
        default:
            return [7];
    }
};

const Stats = () => {
    // Initialize state with values from localStorage
    const [timeUnit, setTimeUnit] = useState<TimeUnit>(() => getStoredTimeUnit());
    const [quantity, setQuantity] = useState(() => getStoredQuantity(getStoredTimeUnit()));

    // Save to localStorage whenever values change
    useEffect(() => {
        try {
            localStorage.setItem('stats-time-unit', timeUnit);
        } catch (error) {
            console.warn('Error saving time unit to localStorage:', error);
        }
    }, [timeUnit]);

    useEffect(() => {
        try {
            localStorage.setItem('stats-quantity', quantity.toString());
        } catch (error) {
            console.warn('Error saving quantity to localStorage:', error);
        }
    }, [quantity]);

    // Fetch data using hooks - using only comprehensive stats for efficiency
    const { data: quickStats, isLoading: quickLoading, error: quickError, refetch: refetchQuick } = useQuickStats();
    const { data: comprehensiveStats, isLoading: comprehensiveLoading, error: comprehensiveError, refetch: refetchComprehensive } = useComprehensiveStats(timeUnit, quantity);

    const isLoading = quickLoading || comprehensiveLoading;
    const hasError = quickError || comprehensiveError;

    const handleRefresh = () => {
        refetchQuick();
        refetchComprehensive();
    };

    const getQuantityOptions = (unit: TimeUnit) => {
        return getQuantityOptionsForUnit(unit);
    };

    const handleTimeUnitChange = (newUnit: TimeUnit) => {
        setTimeUnit(newUnit);
        // Reset quantity to a reasonable default for the new unit
        const options = getQuantityOptions(newUnit);
        setQuantity(options[1] || options[0]);
    };

    const LoadingSkeleton = ({ className = "" }: { className?: string }) => (
        <Card className={`relative overflow-hidden bg-gradient-to-br from-green-50/80 to-blue-50/80 border-2 border-green-200/60 backdrop-blur-sm ${className}`}>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-64 w-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 pb-24">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Nutrition Statistics</h1>
                                <p className="text-gray-600">Track your nutrition progress over time</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleRefresh}
                            variant="outline"
                            size="sm"
                            className="border-green-200 hover:bg-green-50"
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>

                    {/* Time Range Controls */}
                    <Card className="bg-white/60 backdrop-blur-sm border-green-200/60">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-gray-700">Time Range:</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                                        <SelectTrigger className="w-20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getQuantityOptions(timeUnit).map((option) => (
                                                <SelectItem key={option} value={option.toString()}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={timeUnit} onValueChange={handleTimeUnitChange}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hour">Hours</SelectItem>
                                            <SelectItem value="day">Days</SelectItem>
                                            <SelectItem value="week">Weeks</SelectItem>
                                            <SelectItem value="month">Months</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Clock className="h-4 w-4" />
                                    <span>Last {quantity} {timeUnit}{quantity !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Error Display */}
                {hasError && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                        <AlertDescription>
                            There was an error loading some statistics. Please try refreshing the page.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Quick Stats Cards */}
                {quickStats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <Card className="bg-gradient-to-br from-green-100/80 to-emerald-100/80 border-green-200/60 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-500 rounded-lg">
                                        <TrendingUp className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-green-700 font-medium">Today's Calories</p>
                                        <p className="text-2xl font-bold text-green-900">{Math.round(quickStats.today_calories)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-100/80 to-cyan-100/80 border-blue-200/60 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-500 rounded-lg">
                                        <Activity className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-700 font-medium">Total Dishes</p>
                                        <p className="text-2xl font-bold text-blue-900">{quickStats.total_dishes_tried}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-100/80 to-amber-100/80 border-orange-200/60 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-orange-500 rounded-lg">
                                        <Utensils className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-orange-700 font-medium">Weekly Average</p>
                                        <p className="text-2xl font-bold text-orange-900">{Math.round(quickStats.weekly_avg_calories)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-100/80 to-violet-100/80 border-purple-200/60 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-purple-500 rounded-lg">
                                        <PieChart className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-purple-700 font-medium">Top Cuisine</p>
                                        <p className="text-lg font-bold text-purple-900 truncate">{quickStats.top_cuisine_this_week}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Charts Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Calorie Chart */}
                    {comprehensiveLoading ? (
                        <LoadingSkeleton className="xl:col-span-2" />
                    ) : comprehensiveStats?.nutrition_overview?.calorie_stats ? (
                        <div className="xl:col-span-2">
                            <CalorieChart 
                                data={comprehensiveStats.nutrition_overview.calorie_stats.data_points} 
                                title={`Calorie Intake - Last ${quantity} ${timeUnit}${quantity !== 1 ? 's' : ''}`}
                            />
                        </div>
                    ) : null}

                    {/* Macronutrient Chart */}
                    {comprehensiveLoading ? (
                        <LoadingSkeleton />
                    ) : comprehensiveStats?.nutrition_overview?.macronutrient_stats ? (
                        <MacronutrientChart 
                            data={comprehensiveStats.nutrition_overview.macronutrient_stats.current_breakdown} 
                            title={`Macronutrient Breakdown - Last ${quantity} ${timeUnit}${quantity !== 1 ? 's' : ''}`}
                        />
                    ) : null}

                    {/* Cuisine Chart */}
                    {comprehensiveLoading ? (
                        <LoadingSkeleton />
                    ) : comprehensiveStats?.consumption_patterns?.cuisine_distribution ? (
                        <CuisineChart 
                            data={comprehensiveStats.consumption_patterns.cuisine_distribution} 
                            title={`Cuisine Distribution - Last ${quantity} ${timeUnit}${quantity !== 1 ? 's' : ''}`}
                        />
                    ) : null}

                    {/* Top Dishes Chart */}
                    {comprehensiveLoading ? (
                        <LoadingSkeleton className="xl:col-span-2" />
                    ) : comprehensiveStats?.consumption_patterns?.top_dishes ? (
                        <div className="xl:col-span-2">
                            <TopDishesChart 
                                data={comprehensiveStats.consumption_patterns.top_dishes} 
                                title={`Top Dishes - Last ${quantity} ${timeUnit}${quantity !== 1 ? 's' : ''}`}
                            />
                        </div>
                    ) : null}
                </div>

                {/* No Data Message */}
                {!isLoading && !hasError && !quickStats && (
                    <Card className="bg-white/60 backdrop-blur-sm border-gray-200/60">
                        <CardContent className="p-8 text-center">
                            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                            <p className="text-gray-600">Start tracking your nutrition to see statistics here.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Stats; 