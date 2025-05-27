import { Link, useLocation } from "react-router-dom";
import { Home, MessageSquare, LineChart, BarChart, User } from "lucide-react";

export default function BottomNavBar() {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/stats", icon: LineChart, label: "Stats" },
    { path: "/chat", icon: MessageSquare, label: "Chat" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-4 left-0 right-0 mx-auto max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 transition-all duration-300 ease-in-out">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center transition-colors duration-200 ${
                isActive
                  ? "text-red-500 dark:text-red-400 scale-110"
                  : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105"
              }`}
            >
              <Icon className="h-6 w-6 mb-1 transition-transform duration-200" />
              <span className="text-xs transition-colors duration-200">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
