import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import BottomNavBar from "./components/BottomNavBar";

const queryClient = new QueryClient();

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <ConditionalBottomNavBar />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
