import { Link, useLocation } from "react-router-dom";
import { Home, MessageSquare, LineChart, BarChart, User, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function BottomNavBar() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isManuallyHidden, setIsManuallyHidden] = useState(false);

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/stats", icon: LineChart, label: "Stats" },
    { path: "/chat", icon: MessageSquare, label: "Chat" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  // Listen for navbar visibility events from Chat page
  useEffect(() => {
    const handleNavbarVisibility = (event: CustomEvent) => {
      const { isVisible: chatIsVisible, isInputFocused: chatInputFocused } = event.detail;
      
      // Only auto-hide if not manually controlled and we're on chat page
      if (location.pathname === "/chat" && !isManuallyHidden) {
        setIsVisible(chatIsVisible);
        setIsInputFocused(chatInputFocused);
      }
    };

    window.addEventListener('navbarVisibilityChange', handleNavbarVisibility as EventListener);
    return () => window.removeEventListener('navbarVisibilityChange', handleNavbarVisibility as EventListener);
  }, [location.pathname, isManuallyHidden]);

  // Reset manual state when leaving chat
  useEffect(() => {
    if (location.pathname !== "/chat") {
      setIsManuallyHidden(false);
      setIsVisible(true);
      setIsInputFocused(false);
    }
  }, [location.pathname]);

  const toggleNavbar = () => {
    setIsManuallyHidden(!isManuallyHidden);
    setIsVisible(!isVisible);
  };

  // Determine final visibility state
  const shouldShow = isVisible && !isManuallyHidden;

  return (
    <>
      {/* Floating toggle for chat page when navbar is hidden */}
      {location.pathname === "/chat" && !shouldShow && (
        <Button
          onClick={toggleNavbar}
          size="sm"
          className="fixed bottom-4 right-4 z-[101] w-12 h-12 rounded-full bg-nutrition-green hover:bg-nutrition-emerald shadow-lg transition-all duration-300 ease-in-out hover:scale-110"
        >
          <ChevronDown className="h-5 w-5 text-white rotate-180" />
        </Button>
      )}

      <nav 
        className={`fixed left-1/2 transform -translate-x-1/2 w-full max-w-md mx-4 bg-white/20 backdrop-blur-xl border-2 border-white/40 rounded-2xl shadow-2xl z-[100] pointer-events-auto transition-all duration-500 ease-in-out hover:shadow-3xl hover:bg-white/25 ${
          shouldShow 
            ? 'bottom-4 translate-y-0 opacity-100' 
            : 'bottom-4 translate-y-20 opacity-0 pointer-events-none'
        } ${isInputFocused ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}
      >
        <div className="flex justify-around items-center h-16 px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center transition-all duration-200 py-1.5 px-4 rounded-xl ${
                  isActive
                    ? "text-white bg-gradient-to-br from-nutrition-green to-nutrition-emerald scale-110 shadow-lg shadow-nutrition-green/30"
                    : "text-green-800 hover:text-white hover:bg-gradient-to-br hover:from-nutrition-green/80 hover:to-nutrition-emerald/80 hover:scale-105 hover:shadow-md"
                }`}
              >
                <Icon className="h-6 w-6 mb-1 transition-transform duration-200 drop-shadow-sm" />
                <span className="text-xs transition-colors duration-200 font-semibold drop-shadow-sm">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
