import { CuisineDistribution } from '@/services/statsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Globe } from 'lucide-react';

interface CuisineChartProps {
    data: CuisineDistribution[];
    title?: string;
    className?: string;
}

// Helper function to safely convert to number
const safeNumber = (value: unknown): number => {
    const num = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    return isNaN(num) ? 0 : num;
};

// Predefined colors for different cuisines
const CUISINE_COLORS = [
    '#10b981', // emerald-500
    '#f97316', // orange-500
    '#8b5cf6', // violet-500
    '#06b6d4', // cyan-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#84cc16', // lime-500
    '#ec4899', // pink-500
    '#6366f1', // indigo-500
    '#14b8a6', // teal-500
];

export default function CuisineChart({ data, title = "Cuisine Distribution", className }: CuisineChartProps) {
    // Transform and sort data for the chart
    const chartData = data
        .sort((a, b) => b.consumption_count - a.consumption_count)
        .slice(0, 10) // Show top 10 cuisines
        .map((cuisine, index) => ({
            name: cuisine.cuisine,
            value: safeNumber(cuisine.percentage),
            count: cuisine.consumption_count,
            calories: Math.round(safeNumber(cuisine.calories_consumed)),
            fill: CUISINE_COLORS[index % CUISINE_COLORS.length],
        }));

    const chartConfig = chartData.reduce((config, item, index) => {
        config[item.name.toLowerCase().replace(/\s+/g, '')] = {
            label: item.name,
            color: CUISINE_COLORS[index % CUISINE_COLORS.length],
        };
        return config;
    }, {} as Record<string, { label: string; color: string }>);

    const CustomTooltip = ({ active, payload }: { 
        active?: boolean; 
        payload?: Array<{ 
            payload: { 
                name: string; 
                value: number; 
                count: number; 
                calories: number; 
                fill: string; 
            } 
        }> 
    }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg">
                    <div className="flex items-center space-x-2 mb-2">
                        <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: data.fill }}
                        />
                        <span className="font-semibold text-gray-900">{data.name}</span>
                    </div>
                    <div className="space-y-1 text-sm">
                        <div><span className="font-medium">Percentage:</span> {safeNumber(data.value).toFixed(1)}%</div>
                        <div><span className="font-medium">Times Eaten:</span> {data.count}</div>
                        <div><span className="font-medium">Calories:</span> {data.calories} kcal</div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: { 
        cx: number; 
        cy: number; 
        midAngle: number; 
        innerRadius: number; 
        outerRadius: number; 
        percent: number; 
    }) => {
        // Only show labels for slices larger than 5%
        if (safeNumber(percent) < 0.05) return null;
        
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                className="font-semibold text-xs drop-shadow-md"
            >
                {`${(safeNumber(percent) * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <Card className={`relative overflow-hidden bg-gradient-to-br from-purple-50/80 to-pink-50/80 border-2 border-purple-200/60 backdrop-blur-sm ${className}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg font-bold text-purple-900">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-80 w-full">
                    <ChartContainer config={chartConfig}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={CustomLabel}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    stroke="#fff"
                                    strokeWidth={2}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartTooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                {/* Top cuisines list */}
                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                    {chartData.map((cuisine, index) => (
                        <div key={cuisine.name} className="flex items-center justify-between p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs font-bold text-gray-500 w-4">#{index + 1}</span>
                                    <div 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: cuisine.fill }}
                                    />
                                </div>
                                <span className="font-medium text-gray-900 text-sm">{cuisine.name}</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-gray-900">{cuisine.count}x</div>
                                <div className="text-xs text-gray-600">{safeNumber(cuisine.value).toFixed(1)}%</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary stats */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-purple-100/50 rounded-lg p-3">
                        <div className="text-xs text-purple-700 font-medium">Total Cuisines</div>
                        <div className="text-lg font-bold text-purple-900">{data.length}</div>
                    </div>
                    <div className="bg-pink-100/50 rounded-lg p-3">
                        <div className="text-xs text-pink-700 font-medium">Most Popular</div>
                        <div className="text-lg font-bold text-pink-900 truncate">
                            {data.length > 0 ? data[0].cuisine : 'N/A'}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 