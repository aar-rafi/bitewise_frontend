import { useIntakesToday } from "@/hooks/useIntakes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, TrendingUp, Droplets, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LogIntakeDialog from "@/components/LogIntakeDialog";
import AnimatedNumber from "@/components/AnimatedNumber";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const { data, isLoading, error } = useIntakesToday();

  // Mock daily goals for progress calculation
  const dailyGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 65,
    fiber: 25,
    water: 2000,
  };

  // Prepare chart data
  const macroData = data
    ? [
        {
          name: "Protein",
          value: parseFloat(data.nutritional_summary.total_protein_g || "0"),
          color: "hsl(var(--nutrition-green))",
          fill: "#4ade80",
        },
        {
          name: "Carbs",
          value: parseFloat(data.nutritional_summary.total_carbs_g || "0"),
          color: "hsl(var(--nutrition-orange))",
          fill: "#fb923c",
        },
        {
          name: "Fats",
          value: parseFloat(data.nutritional_summary.total_fats_g || "0"),
          color: "hsl(var(--nutrition-amber))",
          fill: "#f59e0b",
        },
      ]
    : [];

  const chartConfig = {
    protein: {
      label: "Protein",
      color: "#4ade80",
    },
    carbs: {
      label: "Carbohydrates",
      color: "#fb923c",
    },
    fats: {
      label: "Fats",
      color: "#f59e0b",
    },
  };

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load nutritional data</AlertDescription>
        </Alert>
      </div>
    );
  }

  const calculateProgress = (current: string | undefined, goal: number) => {
    const currentValue = parseFloat(current || "0");
    return Math.min((currentValue / goal) * 100, 100);
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Today's Summary
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your nutritional journey
          </p>
        </div>
        <LogIntakeDialog />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        {/* Calories Card with Glass Effect */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-glass-shimmer" />
          <CardHeader className="pb-2 flex flex-row items-center space-y-0 space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Calories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold text-foreground">
                  <AnimatedNumber
                    value={data?.nutritional_summary.total_calories}
                    suffix=" kcal"
                    className="text-3xl font-bold text-foreground"
                  />
                </div>
                <Progress
                  value={calculateProgress(
                    data?.nutritional_summary.total_calories,
                    dailyGoals.calories
                  )}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {Math.round(
                    calculateProgress(
                      data?.nutritional_summary.total_calories || "0",
                      dailyGoals.calories
                    )
                  )}
                  % of daily goal
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Protein Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
              Protein
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                  <AnimatedNumber
                    value={data?.nutritional_summary.total_protein_g}
                    suffix="g"
                    className="text-3xl font-bold text-green-700 dark:text-green-300"
                  />
                </div>
                <Progress
                  value={calculateProgress(
                    data?.nutritional_summary.total_protein_g,
                    dailyGoals.protein
                  )}
                  className="h-2 bg-green-100 dark:bg-green-900"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Carbohydrates Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">
              Carbohydrates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                  <AnimatedNumber
                    value={data?.nutritional_summary.total_carbs_g}
                    suffix="g"
                    className="text-3xl font-bold text-orange-700 dark:text-orange-300"
                  />
                </div>
                <Progress
                  value={calculateProgress(
                    data?.nutritional_summary.total_carbs_g,
                    dailyGoals.carbs
                  )}
                  className="h-2 bg-orange-100 dark:bg-orange-900"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Fats Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Fats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                  <AnimatedNumber
                    value={data?.nutritional_summary.total_fats_g}
                    suffix="g"
                    className="text-3xl font-bold text-amber-700 dark:text-amber-300"
                  />
                </div>
                <Progress
                  value={calculateProgress(
                    data?.nutritional_summary.total_fats_g,
                    dailyGoals.fats
                  )}
                  className="h-2 bg-amber-100 dark:bg-amber-900"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
        {/* Macronutrients Bar Chart */}
        <Card className="col-span-1 lg:col-span-2 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Macronutrient Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-64">
                <BarChart data={macroData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={8}>
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Nutrients */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        {/* Fiber Card */}
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Fiber
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  <AnimatedNumber
                    value={data?.nutritional_summary.total_fiber_g}
                    suffix="g"
                    className="text-2xl font-bold text-emerald-700 dark:text-emerald-300"
                  />
                </div>
                <Progress
                  value={calculateProgress(
                    data?.nutritional_summary.total_fiber_g,
                    dailyGoals.fiber
                  )}
                  className="h-2 bg-emerald-100 dark:bg-emerald-900"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Sugar Card */}
        <Card className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 border-rose-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-600 dark:text-rose-400">
              Sugar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">
                <AnimatedNumber
                  value={data?.nutritional_summary.total_sugar_g}
                  suffix="g"
                  className="text-2xl font-bold text-rose-700 dark:text-rose-300"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Water Card */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2 flex flex-row items-center space-y-0 space-x-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Water
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  <AnimatedNumber
                    value={data?.nutritional_summary.total_water_ml}
                    suffix="ml"
                    className="text-2xl font-bold text-blue-700 dark:text-blue-300"
                  />
                </div>
                <Progress
                  value={calculateProgress(
                    data?.nutritional_summary.total_water_ml?.toString(),
                    dailyGoals.water
                  )}
                  className="h-2 bg-blue-100 dark:bg-blue-900"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
