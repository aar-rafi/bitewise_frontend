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
import { useState } from "react";
import {FileUpload} from "@/components/ui/file-upload";
import { useTokenHandler } from "@/hooks/useTokenHandler";
import NutritionLoadingAnimation from "@/components/NutritionLoadingAnimation";
import ProgressiveLoadingAnimation from "@/components/ProgressiveLoadingAnimation";

export default function Dashboard() {
  const { data, isLoading, error } = useIntakesToday();
  const [files, setFiles] = useState<File[]>([]);
  const [showTokenProcessing, setShowTokenProcessing] = useState(false);
  
  // Handle OAuth tokens if present in URL
  const { isProcessingTokens } = useTokenHandler({
    onSuccess: (authData) => {
      console.log("OAuth authentication successful:", authData);
      // Token storage is already handled by the hook
      // Additional logic can be added here if needed
    },
    onError: (error) => {
      console.error("OAuth authentication error:", error);
      // Error handling is already handled by the hook with toast
    },
    onProcessingStart: () => {
      setShowTokenProcessing(true);
    },
    onProcessingEnd: () => {
      setShowTokenProcessing(false);
    },
  });
  
  const handleFileUpload = (files: File[]) => {
    setFiles(files);
    console.log(files);
  };

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
        <Alert
          variant="destructive"
          className="animate-fade-in bg-red-500/20 border-red-500/30"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">
            Failed to load nutritional data
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const calculateProgress = (current: string | undefined, goal: number) => {
    const currentValue = parseFloat(current || "0");
    return Math.min((currentValue / goal) * 100, 100);
  };

  // Show loading animation during token processing or initial data loading
  if (showTokenProcessing || isProcessingTokens) {
    return (
      <NutritionLoadingAnimation 
        message="Authenticating with Google..."
        showProgress={false}
      />
    );
  }

  // Show progressive loading animation during data fetching
  if (isLoading) {
    return (
      <ProgressiveLoadingAnimation 
        onComplete={() => {
          // This will be called when the animation completes
          // The actual data loading state will naturally transition
        }}
      />
    );
  }

  return (
    <div className="container py-8 pb-24 space-y-8 relative z-10">
      {/* Header */}
      <div className="flex justify-between items-center animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-nutrition-green to-nutrition-emerald bg-clip-text text-transparent">
            Today's Summary
          </h1>
          <p className="text-green-700/80 mt-1 font-medium">
            Track your nutritional journey
          </p>
        </div>
        <LogIntakeDialog />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        {/* Calories Card with Glass Effect */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-400/30 to-orange-500/30 backdrop-blur-sm border-2 border-yellow-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/20 to-transparent animate-glass-shimmer" />
          <CardHeader className="pb-2 flex flex-row items-center space-y-0 space-x-2">
            <Zap className="h-6 w-6 text-yellow-700 drop-shadow-sm" />
            <CardTitle className="text-sm font-bold text-yellow-900 drop-shadow-sm">
              Total Calories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold text-yellow-950 drop-shadow-sm">
                  <AnimatedNumber
                    value={data?.nutritional_summary.total_calories}
                    suffix=" kcal"
                    className="text-3xl font-bold text-yellow-950 drop-shadow-sm"
                  />
                </div>
                <Progress
                  value={calculateProgress(
                    data?.nutritional_summary.total_calories,
                    dailyGoals.calories
                  )}
                  className="h-3"
                />
                <p className="text-xs text-yellow-800 font-medium drop-shadow-sm">
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
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-400/30 to-emerald-500/30 border-2 border-green-500/50 hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-green-900 drop-shadow-sm">
              Protein
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-green-950 drop-shadow-sm">
                  <AnimatedNumber
                    value={data?.nutritional_summary.total_protein_g}
                    suffix="g"
                    className="text-3xl font-bold text-green-950 drop-shadow-sm"
                  />
                </div>
                <Progress
                  value={calculateProgress(
                    data?.nutritional_summary.total_protein_g,
                    dailyGoals.protein
                  )}
                  className="h-3 bg-green-200/50"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Carbohydrates Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-400/30 to-red-500/30 border-2 border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-orange-900 drop-shadow-sm">
              Carbohydrates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-orange-950 drop-shadow-sm">
                  <AnimatedNumber
                    value={data?.nutritional_summary.total_carbs_g}
                    suffix="g"
                    className="text-3xl font-bold text-orange-950 drop-shadow-sm"
                  />
                </div>
                <Progress
                  value={calculateProgress(
                    data?.nutritional_summary.total_carbs_g,
                    dailyGoals.carbs
                  )}
                  className="h-3 bg-orange-200/50"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Fats Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-400/30 to-yellow-500/30 border-2 border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-amber-900 drop-shadow-sm">
              Fats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-amber-950 drop-shadow-sm">
                  <AnimatedNumber
                    value={data?.nutritional_summary.total_fats_g}
                    suffix="g"
                    className="text-3xl font-bold text-amber-950 drop-shadow-sm"
                  />
                </div>
                <Progress
                  value={calculateProgress(
                    data?.nutritional_summary.total_fats_g,
                    dailyGoals.fats
                  )}
                  className="h-3 bg-amber-200/50"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
        {/* Macronutrients Bar Chart */}
        <Card className="col-span-1 lg:col-span-2 bg-gradient-to-br from-slate-700/20 to-slate-800/30 backdrop-blur-sm border-2 border-slate-600/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 font-bold drop-shadow-sm">
              <TrendingUp className="h-6 w-6 text-nutrition-green drop-shadow-sm" />
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
        <Card className="bg-gradient-to-br from-emerald-400/30 to-green-600/30 border-2 border-emerald-500/50 shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-emerald-900 drop-shadow-sm">
              Fiber
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-emerald-950 drop-shadow-sm">
                  <AnimatedNumber
                    value={data?.nutritional_summary.total_fiber_g}
                    suffix="g"
                    className="text-2xl font-bold text-emerald-950 drop-shadow-sm"
                  />
                </div>
                <Progress
                  value={calculateProgress(
                    data?.nutritional_summary.total_fiber_g,
                    dailyGoals.fiber
                  )}
                  className="h-3 bg-emerald-200/50"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Sugar Card */}
        <Card className="bg-gradient-to-br from-rose-400/30 to-pink-500/30 border-2 border-rose-500/50 shadow-xl hover:shadow-rose-500/25 transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-rose-900 drop-shadow-sm">
              Sugar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-rose-950 drop-shadow-sm">
                <AnimatedNumber
                  value={data?.nutritional_summary.total_sugar_g}
                  suffix="g"
                  className="text-2xl font-bold text-rose-950 drop-shadow-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Water Card */}
        <Card className="bg-gradient-to-br from-blue-400/30 to-cyan-500/30 border-2 border-blue-500/50 shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-2 flex flex-row items-center space-y-0 space-x-2">
            <Droplets className="h-5 w-5 text-blue-700 drop-shadow-sm" />
            <CardTitle className="text-sm font-bold text-blue-900 drop-shadow-sm">
              Water
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-950 drop-shadow-sm">
                  <AnimatedNumber
                    value={data?.nutritional_summary.total_water_ml}
                    suffix="ml"
                    className="text-2xl font-bold text-blue-950 drop-shadow-sm"
                  />
                </div>
                <Progress
                  value={calculateProgress(
                    data?.nutritional_summary.total_water_ml?.toString(),
                    dailyGoals.water
                  )}
                  className="h-3 bg-blue-200/50"
                />
              </>
            )}
          </CardContent>
        </Card>

      </div>
        <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-emerald-500/20 dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
          <FileUpload onChange={handleFileUpload} />
        </div>
    </div>
  );
}
