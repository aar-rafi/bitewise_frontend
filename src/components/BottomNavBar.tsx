import { Link, useLocation } from "react-router-dom";
import { Home, MessageSquare, LineChart, BarChart, User, Sparkles, ForkKnifeCrossed, Utensils, MessageCircle, Users, Mail } from "lucide-react";

export default function BottomNavBar() {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/intakes", icon: Utensils, label: "Intakes" },
    { path: "/dishes", icon: ForkKnifeCrossed, label: "Dishes" },
    { path: "/messages", icon: Mail, label: "Messages" },
    { path: "/conversations", icon: MessageCircle, label: "Conversations" },
    { path: "/users", icon: Users, label: "Users" },
    { path: "/stats", icon: LineChart, label: "Stats" },
    { path: "/chat", icon: MessageSquare, label: "Chat" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-6xl mx-4 bg-white/20 backdrop-blur-xl border-2 border-white/40 rounded-2xl shadow-2xl z-[100] transition-all duration-300 ease-in-out hover:shadow-3xl hover:bg-white/25 pointer-events-auto">
      <div className="flex justify-around items-center h-16 px-2 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center transition-all duration-200 py-1.5 px-2 rounded-xl min-w-0 flex-shrink-0 ${
                isActive
                  ? "text-white bg-gradient-to-br from-nutrition-green to-nutrition-emerald scale-110 shadow-lg shadow-nutrition-green/30"
                  : "text-green-800 hover:text-white hover:bg-gradient-to-br hover:from-nutrition-green/80 hover:to-nutrition-emerald/80 hover:scale-105 hover:shadow-md"
              }`}
            >
              <Icon className="h-5 w-5 mb-1 transition-transform duration-200 drop-shadow-sm" />
              <span className="text-xs transition-colors duration-200 font-semibold drop-shadow-sm truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
