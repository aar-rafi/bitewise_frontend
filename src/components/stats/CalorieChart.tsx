import { CalorieDataPoint } from '@/services/statsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { Zap, Target } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface CalorieChartProps {
    data: CalorieDataPoint[];
    title?: string;
    className?: string;
}

export default function CalorieChart({ data, title = "Calorie Intake", className }: CalorieChartProps) {
    // Transform data for the chart
    const chartData = data.map(point => ({
        date: format(parseISO(point.timestamp), 'MMM dd'),
        fullDate: point.timestamp,
        calories: Math.round(point.calories),
        goal: Math.round(point.goal_calories),
        deficit: point.deficit_surplus,
        isAboveGoal: point.calories > point.goal_calories,
    }));

    const avgGoal = data.length > 0 ? Math.round(data.reduce((sum, point) => sum + point.goal_calories, 0) / data.length) : 2000;

    const chartConfig = {
        calories: {
            label: "Calories",
            color: "#f59e0b",
        },
        goal: {
            label: "Goal",
            color: "#10b981",
        },
    };

    return (
        <Card className={`relative overflow-hidden bg-gradient-to-br from-yellow-50/80 to-orange-50/80 border-2 border-yellow-200/60 backdrop-blur-sm ${className}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <CardTitle className="text-lg font-bold text-yellow-900">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-80 w-full">
                    <ChartContainer config={chartConfig}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "#b45309" }}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "#b45309" }}
                                    domain={['dataMin - 200', 'dataMax + 200']}
                                />
                                <ChartTooltip 
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white/95 backdrop-blur-sm border border-yellow-200 rounded-lg p-3 shadow-lg">
                                                    <p className="font-semibold text-yellow-900 mb-2">{label}</p>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <Zap className="h-4 w-4 text-yellow-600" />
                                                            <span className="text-sm">
                                                                <span className="font-medium">Calories:</span> {data.calories} kcal
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Target className="h-4 w-4 text-green-600" />
                                                            <span className="text-sm">
                                                                <span className="font-medium">Goal:</span> {data.goal} kcal
                                                            </span>
                                                        </div>
                                                        <div className="text-xs pt-1">
                                                            <span className={`font-medium ${data.deficit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                                {data.deficit > 0 ? `+${Math.round(data.deficit)}` : Math.round(data.deficit)} 
                                                                {data.deficit > 0 ? ' surplus' : ' deficit'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <ReferenceLine 
                                    y={avgGoal} 
                                    stroke="#10b981" 
                                    strokeDasharray="5 5" 
                                    label={{ value: "Avg Goal", position: "top" }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="calories" 
                                    stroke="#f59e0b" 
                                    fill="url(#calorieGradient)"
                                    strokeWidth={3}
                                    dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
                
                {/* Summary stats */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-yellow-100/50 rounded-lg p-3">
                        <div className="text-xs text-yellow-700 font-medium">Average Daily</div>
                        <div className="text-lg font-bold text-yellow-900">
                            {data.length > 0 ? Math.round(data.reduce((sum, point) => sum + point.calories, 0) / data.length) : 0} kcal
                        </div>
                    </div>
                    <div className="bg-green-100/50 rounded-lg p-3">
                        <div className="text-xs text-green-700 font-medium">Goal Achievement</div>
                        <div className="text-lg font-bold text-green-900">
                            {data.length > 0 ? Math.round((data.filter(p => p.calories >= p.goal_calories).length / data.length) * 100) : 0}%
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 