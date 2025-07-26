import { useIntakesToday } from "@/hooks/useIntakes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Plus, User, Droplets, Zap, Activity, Utensils, Clock, Calendar, GlassWater, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LogIntakeDialog from "@/components/LogIntakeDialog";
import AnimatedNumber from "@/components/AnimatedNumber";
import AppHeader from "@/components/AppHeader";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import { useTokenHandler } from "@/hooks/useTokenHandler";
import NutritionLoadingAnimation from "@/components/NutritionLoadingAnimation";
import ProgressiveLoadingAnimation from "@/components/ProgressiveLoadingAnimation";
import { profileApi, UserProfile, intakesApi, CreateWaterIntakeRequest, ApiError } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Dashboard() {
  const { data, isLoading, error } = useIntakesToday();
  const [showTokenProcessing, setShowTokenProcessing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const queryClient = useQueryClient();
  
  // Handle OAuth tokens if present in URL
  const { isProcessingTokens } = useTokenHandler({
    onSuccess: (authData) => {
      console.log("OAuth authentication successful:", authData);
    },
    onError: (error) => {
      console.error("OAuth authentication error:", error);
    },
    onProcessingStart: () => {
      setShowTokenProcessing(true);
    },
    onProcessingEnd: () => {
      setShowTokenProcessing(false);
    },
  });

  // Load profile data
  useEffect(() => {
    profileApi.getMe()
      .then(setProfile)
      .catch((e) => console.error("Failed to load profile:", e.message));
  }, []);

  // Mock daily goals for progress calculation
  const dailyGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 65,
    water: 2000,
  };

  // Calculate current values
  const currentCalories = parseFloat(data?.nutritional_summary.total_calories || "0");
  const currentProtein = parseFloat(data?.nutritional_summary.total_protein_g || "0");
  const currentCarbs = parseFloat(data?.nutritional_summary.total_carbs_g || "0");
  const currentFats = parseFloat(data?.nutritional_summary.total_fats_g || "0");
  const currentWater = data?.nutritional_summary.total_water_ml || 0;

  // Prepare circular chart data
  const circularChartData = {
    calories: [
      { name: "consumed", value: currentCalories, color: "#ff6b35" },
      { name: "remaining", value: Math.max(0, dailyGoals.calories - currentCalories), color: "#f0f0f5" }
    ],
    protein: [
      { name: "consumed", value: currentProtein, color: "#00d4aa" },
      { name: "remaining", value: Math.max(0, dailyGoals.protein - currentProtein), color: "#f0f0f5" }
    ],
    carbs: [
      { name: "consumed", value: currentCarbs, color: "#ff9500" },
      { name: "remaining", value: Math.max(0, dailyGoals.carbs - currentCarbs), color: "#f0f0f5" }
    ]
  };

  // Water logging mutation
  const { mutate: logWater, isPending: isLoggingWater } = useMutation({
    mutationFn: (waterAmount: number) => {
      const waterIntakeData: CreateWaterIntakeRequest = {
        water_ml: waterAmount,
        intake_time: new Date().toISOString(),
      };
      return intakesApi.createWaterIntake(waterIntakeData);
    },
    onSuccess: (_, waterAmount) => {
      toast.success(`Added ${waterAmount}ml of water!`);
      queryClient.invalidateQueries({ queryKey: ["intakes"] });
    },
    onError: (error: ApiError) => {
      toast.error("Failed to log water intake", {
        description: error.message || "Please try again later",
      });
    },
  });

  const addWater = (amount: number) => {
    logWater(amount);
  };

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="animate-fade-in bg-red-500/20 border-red-500/30">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">
            Failed to load nutritional data
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (showTokenProcessing || isProcessingTokens) {
    return (
      <NutritionLoadingAnimation 
        message="Authenticating with Google..."
        showProgress={false}
      />
    );
  }

  if (isLoading) {
    return (
      <ProgressiveLoadingAnimation 
        onComplete={() => {}}
      />
    );
  }

  const CircularStat = ({ data, title, current, goal, unit, color }: {
    data: any[];
    title: string;
    current: number;
    goal: number;
    unit: string;
    color: string;
  }) => (
    <div className="flex flex-col items-center p-4">
      <div className="relative w-28 h-28 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={55}
              startAngle={90}
              endAngle={450}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-lg font-bold" style={{ color }}>
            {Math.round((current / goal) * 100)}%
          </div>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
        <div className="text-lg font-bold text-gray-800">
          {Math.round(current)} / {goal}{unit}
        </div>
      </div>
    </div>
  );

  // Water bottle visualization component
  const WaterBottle = ({ fillPercentage }: { fillPercentage: number }) => {
    // Calculate water level - bottle body goes from Y=55 to Y=120 (65 units height)
    const bottleBottom = 120;
    const bottleTop = 55;
    const bottleHeight = bottleBottom - bottleTop;
    const waterLevel = bottleBottom - (fillPercentage / 100 * bottleHeight);
    
    return (
      <div className="relative w-16 h-20 mx-auto mb-4">
        <svg viewBox="0 0 120 150" className="w-full h-full transform rotate-45">
          {/* Gradient definition - must be first */}
          <defs>
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
              <stop offset="30%" stopColor="#22d3ee" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="1" />
            </linearGradient>
          </defs>
          
          {/* Water fill - show only if there's water */}
          {fillPercentage > 0 && (
            <path
              d={`M28 ${waterLevel} L92 ${waterLevel} L92 120 Q92 128 85 128 L35 128 Q28 128 28 120 Z`}
              fill="url(#waterGradient)"
              className="transition-all duration-700 ease-out"
            />
          )}
          
          {/* Bottle outline */}
          <path
            d="M35 28 L35 15 Q35 9 42 9 L78 9 Q85 9 85 15 L85 28 L92 38 Q100 45 100 55 L100 120 Q100 135 85 135 L35 135 Q20 135 20 120 L20 55 Q20 45 28 38 L35 28"
            fill="none"
            stroke="#0891b2"
            strokeWidth="2.5"
            className="drop-shadow-sm"
          />
          
          {/* Bottle cap */}
          <rect x="40" y="3" width="40" height="15" rx="4" fill="#64748b" className="drop-shadow-sm" />
          
          {/* Water shine effect - show only if there's water */}
          {fillPercentage > 5 && (
            <ellipse
              cx="50"
              cy={Math.min(waterLevel + 10, bottleBottom - 5)}
              rx="10"
              ry="4"
              fill="rgba(255, 255, 255, 0.6)"
              className="transition-all duration-700"
            />
          )}
          
          {/* Small bubbles for animation */}
          {fillPercentage > 10 && (
            <>
              <circle cx="45" cy={waterLevel + 15} r="1.5" fill="rgba(255, 255, 255, 0.4)" className="animate-pulse" />
              <circle cx="65" cy={waterLevel + 25} r="1" fill="rgba(255, 255, 255, 0.3)" className="animate-pulse delay-300" />
            </>
          )}
        </svg>
      </div>
    );
  };

  return (
    <div className="container py-6 pb-24 space-y-8 relative z-10">
      {/* Header */}
      <AppHeader 
        title="Dashboard"
        subtitle="Your daily nutrition overview"
      />

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 h-auto">
        
        {/* Profile Section - Large Bento Box */}
        <Card className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 border-0 shadow-2xl backdrop-blur-sm rounded-3xl group hover:shadow-3xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 opacity-60"></div>
          <div className="absolute top-4 right-4">
            <Sparkles className="h-5 w-5 text-blue-400 animate-pulse" />
          </div>
          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="text-lg font-bold text-indigo-900 flex items-center gap-3">
              <User className="h-6 w-6" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                {profile?.profile_image_url && (
                  <AvatarImage src={profile.profile_image_url} alt="Profile" />
                )}
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xl">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-xl text-indigo-900 mb-1">
                  {profile ? `${profile.first_name} ${profile.last_name}` : "Loading..."}
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {profile?.fitness_goals?.[0] || "Nutrition tracking"}
                </Badge>
              </div>
            </div>
            {profile && (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/60 rounded-2xl backdrop-blur-sm">
                  <div className="text-2xl font-bold text-indigo-900">{profile.weight_kg}</div>
                  <div className="text-sm text-indigo-600 font-medium">Weight (kg)</div>
                </div>
                <div className="text-center p-4 bg-white/60 rounded-2xl backdrop-blur-sm">
                  <div className="text-2xl font-bold text-indigo-900">{profile.height_cm}</div>
                  <div className="text-sm text-indigo-600 font-medium">Height (cm)</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Progress - Large Bento Box */}
        <Card className="lg:col-span-4 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-0 shadow-2xl backdrop-blur-sm rounded-3xl group hover:shadow-3xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 opacity-60"></div>
          <div className="absolute top-4 right-4">
            <Activity className="h-6 w-6 text-emerald-400 animate-pulse" />
          </div>
          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="text-lg font-bold text-emerald-900 flex items-center gap-3">
              <Zap className="h-6 w-6" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex justify-around items-center">
              <CircularStat
                data={circularChartData.calories}
                title="Calories"
                current={currentCalories}
                goal={dailyGoals.calories}
                unit=" kcal"
                color="#ff6b35"
              />
              <CircularStat
                data={circularChartData.protein}
                title="Protein"
                current={currentProtein}
                goal={dailyGoals.protein}
                unit="g"
                color="#00d4aa"
              />
              <CircularStat
                data={circularChartData.carbs}
                title="Carbs"
                current={currentCarbs}
                goal={dailyGoals.carbs}
                unit="g"
                color="#ff9500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Water Intake - Enhanced with Bottle Visualization - Tall and Slim */}
        <Card className="lg:col-span-1 lg:row-span-2 relative overflow-hidden bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 border-0 shadow-2xl backdrop-blur-sm rounded-3xl group hover:shadow-3xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 opacity-60"></div>
          <div className="absolute top-4 right-4">
            <GlassWater className="h-6 w-6 text-cyan-400 animate-pulse" />
          </div>
          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="text-lg font-bold text-cyan-900 flex items-center gap-3">
              <Droplets className="h-6 w-6" />
              Water
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            {/* Water Bottle Visualization */}
            <div className="text-center">
              <WaterBottle fillPercentage={Math.min((currentWater / dailyGoals.water) * 100, 100)} />
              <div className="text-2xl font-bold text-cyan-900 mb-2">
                <AnimatedNumber
                  value={currentWater.toString()}
                  suffix=" ml"
                  className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent"
                />
              </div>
              <div className="text-sm text-cyan-600 font-medium mb-4">
                {Math.round((currentWater / dailyGoals.water) * 100)}% goal
              </div>
              <Progress
                value={Math.min((currentWater / dailyGoals.water) * 100, 100)}
                className="h-3 bg-cyan-100 rounded-full mb-6"
              />
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => addWater(250)}
                disabled={isLoggingWater}
                className="text-cyan-700 border-2 border-cyan-200 hover:bg-cyan-50 hover:border-cyan-300 rounded-xl font-semibold transition-all duration-200"
              >
                +250ml
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => addWater(500)}
                disabled={isLoggingWater}
                className="text-cyan-700 border-2 border-cyan-200 hover:bg-cyan-50 hover:border-cyan-300 rounded-xl font-semibold transition-all duration-200"
              >
                +500ml
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => addWater(1000)}
                disabled={isLoggingWater}
                className="text-cyan-700 border-2 border-cyan-200 hover:bg-cyan-50 hover:border-cyan-300 rounded-xl font-semibold transition-all duration-200"
              >
                +1L
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Log - Taller Box */}
        <Card className="lg:col-span-2 lg:row-span-2 relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-0 shadow-2xl backdrop-blur-sm rounded-3xl group hover:shadow-3xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-600/10 opacity-60"></div>
          <div className="absolute top-4 right-4">
            <Clock className="h-6 w-6 text-purple-400 animate-pulse" />
          </div>
          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-3">
              <Calendar className="h-6 w-6" />
              Today's Log
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            {data?.intakes && data.intakes.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {data.intakes.map((intake, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/70 rounded-2xl backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-purple-900 mb-1">
                        {intake.dish?.name || "Water"}
                      </div>
                      <div className="text-xs text-purple-600 font-medium">
                        {new Date(intake.intake_time).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      {intake.water_ml && intake.water_ml > 0 && (
                        <div className="text-xs text-cyan-600 font-medium mt-1">
                          💧 {intake.water_ml}ml water
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-purple-800 px-3 py-1 bg-purple-100 rounded-full">
                      {intake.dish ? Math.round(parseFloat(intake.dish?.calories || "0")) : 0} kcal
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-50" />
                <p className="text-base font-semibold text-purple-700 mb-2">No meals logged today</p>
                <p className="text-sm text-purple-600">Start tracking your nutrition!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Add - Enhanced and Wider */}
        <Card className="lg:col-span-3 lg:row-span-2 relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-0 shadow-2xl backdrop-blur-sm rounded-3xl group hover:shadow-3xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-amber-600/10 opacity-60"></div>
          <div className="absolute top-4 right-4">
            <Utensils className="h-6 w-6 text-orange-400 animate-pulse" />
          </div>
          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="text-lg font-bold text-orange-900 flex items-center gap-3">
              <Plus className="h-6 w-6" />
              Quick Add
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 relative z-10">
            <div className="grid grid-cols-2 gap-6">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-orange-300 hover:border-orange-400 hover:bg-orange-50 rounded-2xl transition-all duration-200 group"
              >
                <Plus className="h-10 w-10 text-orange-600 mb-2 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm font-semibold text-orange-700">Add Meal</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-orange-300 hover:border-orange-400 hover:bg-orange-50 rounded-2xl transition-all duration-200 group"
              >
                <Plus className="h-10 w-10 text-orange-600 mb-2 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm font-semibold text-orange-700">Add Snack</span>
              </Button>
            </div>
            <div className="text-center">
              <LogIntakeDialog />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-xl font-semibold transition-all duration-200 h-12"
              >
                Search Recipes
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-xl font-semibold transition-all duration-200 h-12"
              >
                Scan Barcode
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
