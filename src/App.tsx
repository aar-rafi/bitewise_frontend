import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import BottomNavBar from "./components/BottomNavBar";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";

// Lazy load route components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const GoogleCallback = lazy(() => import("./pages/GoogleCallback"));
const Chat = lazy(() => import("./pages/Chat"));
const Stats = lazy(() => import("./pages/Stats"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfileUpdate = lazy(() => import("./pages/ProfileUpdate"));
const Demo = lazy(() => import("./pages/Demo"));
const Dishes = lazy(() => import("./pages/Dishes"));
const Intakes = lazy(() => import("./pages/Intakes"));
const Messages = lazy(() => import("./pages/Messages"));
const Conversations = lazy(() => import("./pages/Conversations"));
const Users = lazy(() => import("./pages/Users"));
const Tests = lazy(() => import("./pages/Tests"));

// Detail pages for individual entities
const DishDetail = lazy(() => import("./pages/DishDetail"));
const IntakeDetail = lazy(() => import("./pages/IntakeDetail"));
const MessageDetail = lazy(() => import("./pages/MessageDetail"));
const ConversationDetail = lazy(() => import("./pages/ConversationDetail"));
const UserDetail = lazy(() => import("./pages/UserDetail"));

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

// Helper component for background patterns
const NutritionFloatingBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-20 left-10 w-6 h-6 bg-green-200 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
    <div className="absolute top-40 right-20 w-4 h-4 bg-orange-200 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
    <div className="absolute bottom-40 left-20 w-5 h-5 bg-yellow-200 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }} />
    <div className="absolute bottom-20 right-10 w-3 h-3 bg-red-200 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '5s' }} />
  </div>
);

// Component to conditionally show bottom nav bar
const ConditionalBottomNavBar = () => {
  const location = useLocation();
  
  // Don't show bottom nav on login/register/verify pages and Google callback
  const hideBottomNavRoutes = ['/', '/verify-email', '/auth/google/callback'];
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

                    {/* Google OAuth callback route - public but handles authentication */}
                    <Route 
                      path="/auth/google/callback" 
                      element={<GoogleCallback />} 
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
                      path="/demo" 
                      element={
                        <ProtectedRoute>
                          <Demo />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/dishes" 
                      element={
                        <ProtectedRoute>
                          <Dishes />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/intakes" 
                      element={
                        <ProtectedRoute>
                          <Intakes />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/messages" 
                      element={
                        <ProtectedRoute>
                          <Messages />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/conversations" 
                      element={
                        <ProtectedRoute>
                          <Conversations />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/users" 
                      element={
                        <ProtectedRoute>
                          <Users />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/tests" 
                      element={
                        <ProtectedRoute>
                          <Tests />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Individual entity detail routes */}
                    <Route 
                      path="/dishes/:id" 
                      element={
                        <ProtectedRoute>
                          <DishDetail />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/intakes/:id" 
                      element={
                        <ProtectedRoute>
                          <IntakeDetail />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/messages/:id" 
                      element={
                        <ProtectedRoute>
                          <MessageDetail />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/conversations/:id" 
                      element={
                        <ProtectedRoute>
                          <ConversationDetail />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/users/:id" 
                      element={
                        <ProtectedRoute>
                          <UserDetail />
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
