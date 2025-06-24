import { MacronutrientBreakdown } from '@/services/statsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Activity } from 'lucide-react';

interface MacronutrientChartProps {
    data: MacronutrientBreakdown;
    title?: string;
    className?: string;
}

// Helper function to safely convert to number
const safeNumber = (value: unknown): number => {
    const num = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    return isNaN(num) ? 0 : num;
};

export default function MacronutrientChart({ data, title = "Macronutrient Breakdown", className }: MacronutrientChartProps) {
    // Transform data for the pie chart with safe number conversion
    const chartData = [
        {
            name: 'Protein',
            value: safeNumber(data.protein_percentage),
            grams: Math.round(safeNumber(data.protein_grams)),
            fill: '#10b981', // emerald-500
            color: 'emerald',
        },
        {
            name: 'Carbs',
            value: safeNumber(data.carbs_percentage),
            grams: Math.round(safeNumber(data.carbs_grams)),
            fill: '#f97316', // orange-500
            color: 'orange',
        },
        {
            name: 'Fats',
            value: safeNumber(data.fats_percentage),
            grams: Math.round(safeNumber(data.fats_grams)),
            fill: '#eab308', // yellow-500
            color: 'yellow',
        },
    ];

    const chartConfig = {
        protein: {
            label: "Protein",
            color: "#10b981",
        },
        carbs: {
            label: "Carbs",
            color: "#f97316",
        },
        fats: {
            label: "Fats",
            color: "#eab308",
        },
    };

    const CustomTooltip = ({ active, payload }: { 
        active?: boolean; 
        payload?: Array<{ 
            payload: {
                name: string;
                value: number;
                grams: number;
                fill: string;
                color: string;
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
                        <div><span className="font-medium">Amount:</span> {data.grams}g</div>
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
                className="font-semibold text-sm drop-shadow-md"
            >
                {`${(safeNumber(percent) * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <Card className={`relative overflow-hidden bg-gradient-to-br from-green-50/80 to-blue-50/80 border-2 border-green-200/60 backdrop-blur-sm ${className}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg font-bold text-green-900">{title}</CardTitle>
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
                                    strokeWidth={3}
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

                {/* Detailed breakdown */}
                <div className="mt-4 space-y-3">
                    {chartData.map((macro) => (
                        <div key={macro.name} className="flex items-center justify-between p-3 rounded-lg bg-white/50">
                            <div className="flex items-center space-x-3">
                                <div 
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: macro.fill }}
                                />
                                <span className="font-medium text-gray-900">{macro.name}</span>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-gray-900">{macro.grams}g</div>
                                <div className="text-sm text-gray-600">{safeNumber(macro.value).toFixed(1)}%</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional nutrition info */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-blue-100/50 rounded-lg p-3">
                        <div className="text-xs text-blue-700 font-medium">Fiber</div>
                        <div className="text-lg font-bold text-blue-900">{Math.round(safeNumber(data.fiber_grams))}g</div>
                    </div>
                    <div className="bg-purple-100/50 rounded-lg p-3">
                        <div className="text-xs text-purple-700 font-medium">Sugar</div>
                        <div className="text-lg font-bold text-purple-900">{Math.round(safeNumber(data.sugar_grams))}g</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}