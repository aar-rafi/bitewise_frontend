import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import BottomNavBar from "./components/BottomNavBar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTokenHandler } from "@/hooks/useTokenHandler";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";



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

// Nutrition-themed floating background elements
const NutritionFloatingBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Floating nutrition icons with subtle animations */}
    <div className="absolute top-20 left-10 w-8 h-8 bg-nutrition-green/5 rounded-full animate-float-slow" />
    <div className="absolute top-40 right-20 w-12 h-12 bg-nutrition-orange/5 rounded-full animate-float-medium" />
    <div className="absolute bottom-32 left-1/4 w-6 h-6 bg-nutrition-emerald/5 rounded-full animate-float-fast" />
    <div className="absolute bottom-20 right-1/3 w-10 h-10 bg-nutrition-amber/5 rounded-full animate-float-slow" />
    <div className="absolute top-1/3 left-1/2 w-4 h-4 bg-nutrition-lime/5 rounded-full animate-float-medium" />
  </div>
);

// Global token handler component
const GlobalTokenHandler = () => {
  useTokenHandler({
    onSuccess: (authData) => {
      console.log("OAuth authentication successful:", authData);
    },
    onError: (error) => {
      console.error("OAuth authentication error:", error);
    },
  });
  return null;
};

// Component to conditionally show bottom nav bar
const ConditionalBottomNavBar = () => {
  const location = useLocation();
  
  // Don't show bottom nav on login/register/verify pages
  const hideBottomNavRoutes = ['/', '/verify-email'];
  const shouldHideBottomNav = hideBottomNavRoutes.includes(location.pathname);
  
  if (shouldHideBottomNav) return null;
  
  return <BottomNavBar />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
              {/* Enhanced nutrition-themed background patterns */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(34,197,94,0.1),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(16,185,129,0.1),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(251,191,36,0.08),transparent_40%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(239,68,68,0.06),transparent_40%)]" />

              {/* Floating nutrition-themed background elements */}
              <NutritionFloatingBackground />

              <div className="relative z-10">
                {/* Global token handler */}
                <GlobalTokenHandler />
                
                <Suspense fallback={<RouteLoader />}>
                  <Routes>
                    {/* Public routes - redirect to dashboard if authenticated */}
                    <Route 
                      path="/" 
                      element={
                        <PublicRoute>
                          <Index />
                        </PublicRoute>
                      } 
                    />
                    <Route 
                      path="/verify-email" 
                      element={
                        <PublicRoute>
                          <VerifyEmail />
                        </PublicRoute>
                      } 
                    />

                    {/* Chat route - protected route requiring authentication */}
                    <Route 
                      path="/chat" 
                      element={
                        <ProtectedRoute>
                          <Chat />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Protected routes - require authentication */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/stats" 
                      element={
                        <ProtectedRoute>
                          <Stats />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile/update" 
                      element={
                        <ProtectedRoute>
                          <ProfileUpdate />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </div>
              <ConditionalBottomNavBar />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
      <Toaster />
      <Sonner />
    </QueryClientProvider>
  );
};

export default App;
