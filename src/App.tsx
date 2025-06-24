import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import BottomNavBar from "./components/BottomNavBar";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load route components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Chat = lazy(() => import("./pages/Chat"));
const Stats = lazy(() => import("./pages/Stats"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfileUpdate = lazy(() => import("./pages/ProfileUpdate"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading component for lazy routes
const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md px-4">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
      <div className="space-y-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  </div>
);

// Nutrition-themed floating background (only for login screen)
const NutritionFloatingBackground = () => {
  const location = useLocation();
  
  // Only show on login page
  if (location.pathname !== "/") {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Floating nutrition elements */}
      <div className="absolute top-20 left-20 w-36 h-16 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-xl animate-float"></div>
      <div
        className="absolute top-40 right-32 w-42 h-12 bg-gradient-to-br from-orange-400/25 to-yellow-500/25 rounded-full blur-lg animate-float"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute bottom-20 left-32 w-20 h-20 bg-gradient-to-br from-red-400/20 to-pink-500/20 rounded-full blur-lg animate-float"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute bottom-40 right-20 w-14 h-14 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-full blur-xl animate-float"
        style={{ animationDelay: "0.5s" }}
      ></div>
      <div
        className="absolute top-1/3 left-1/2 w-20 h-10 bg-gradient-to-br from-lime-400/25 to-green-500/25 rounded-full blur-lg animate-float"
        style={{ animationDelay: "1.5s" }}
      ></div>
      <div
        className="absolute bottom-1/3 right-1/3 w-18 h-18 bg-gradient-to-br from-cyan-400/20 to-teal-500/20 rounded-full blur-xl animate-float"
        style={{ animationDelay: "2.5s" }}
      ></div>
      
      {/* Additional nutrition-themed floating elements */}
      <div
        className="absolute top-64 left-1/4 w-8 h-8 bg-gradient-to-br from-green-500/30 to-emerald-600/30 rounded-full blur-md animate-float"
        style={{ animationDelay: "3s" }}
      ></div>
      <div
        className="absolute bottom-64 right-1/4 w-24 h-24 bg-gradient-to-br from-yellow-400/15 to-orange-500/15 rounded-full blur-2xl animate-float"
        style={{ animationDelay: "3.5s" }}
      ></div>
      <div
        className="absolute top-3/4 right-16 w-16 h-16 bg-gradient-to-br from-violet-400/20 to-purple-500/20 rounded-full blur-lg animate-float"
        style={{ animationDelay: "4.5s" }}
      ></div>
    </div>
  );
};

// Component to conditionally render BottomNavBar
const ConditionalBottomNavBar = () => {
  const location = useLocation();

  // Routes where BottomNavBar should NOT be shown
  const routesWithoutNavBar = ["/", "/verify-email"];

  if (routesWithoutNavBar.includes(location.pathname)) {
    return null;
  }

  return <BottomNavBar />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
            {/* Enhanced nutrition-themed background patterns */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(34,197,94,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(16,185,129,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(251,191,36,0.08),transparent_40%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(239,68,68,0.06),transparent_40%)]" />

            {/* Floating nutrition-themed background elements */}
            <NutritionFloatingBackground />

            <div className="relative z-10">
              <Suspense fallback={<RouteLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/stats" element={<Stats />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/update" element={<ProfileUpdate />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </div>
            <ConditionalBottomNavBar />
          </div>
        </BrowserRouter>
      </TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-nutrition-green/20 via-nutrition-emerald/10 to-nutrition-lime/20 relative overflow-hidden">
          {/* Global Animated Background Elements */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-20 left-20 w-32 h-32 bg-nutrition-green/25 rounded-full blur-xl animate-float"></div>
            <div
              className="absolute top-40 right-32 w-24 h-24 bg-nutrition-lime/30 rounded-full blur-lg animate-float"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute bottom-20 left-32 w-28 h-28 bg-nutrition-lime/25 rounded-full blur-lg animate-float"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute bottom-40 right-20 w-20 h-20 bg-nutrition-emerald/20 rounded-full blur-xl animate-float"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute top-1/3 left-1/2 w-16 h-16 bg-nutrition-green/15 rounded-full blur-lg animate-float"
              style={{ animationDelay: "1.5s" }}
            ></div>
            <div
              className="absolute bottom-1/3 right-1/3 w-20 h-20 bg-nutrition-emerald/15 rounded-full blur-xl animate-float"
              style={{ animationDelay: "2.5s" }}
            ></div>
          </div>

          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/update" element={<ProfileUpdate />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <ConditionalBottomNavBar />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
