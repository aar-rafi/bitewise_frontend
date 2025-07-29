import { useState, useEffect } from "react";
import { Utensils, Coffee, Sun, Moon } from "lucide-react";

export function ChatHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    
    if (hour >= 5 && hour < 12) {
      return {
        greeting: "Good Morning",
        icon: <Sun className="h-4 w-4 text-nutrition-green" />,
        suggestion: "Ready for a nutritious breakfast?",
        mealTime: "breakfast"
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: "Good Afternoon",
        icon: <Utensils className="h-4 w-4 text-nutrition-green" />,
        suggestion: "Time for a healthy lunch?",
        mealTime: "lunch"
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        greeting: "Good Evening",
        icon: <Utensils className="h-4 w-4 text-nutrition-green" />,
        suggestion: "Planning dinner tonight?",
        mealTime: "dinner"
      };
    } else {
      return {
        greeting: "Good Evening",
        icon: <Moon className="h-4 w-4 text-nutrition-green" />,
        suggestion: "How was your day's nutrition?",
        mealTime: "evening"
      };
    }
  };

  const timeInfo = getTimeBasedGreeting();
  const timeString = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="sticky top-0 z-20 bg-background">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Logo/Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-nutrition-green/30 rounded-md flex items-center justify-center">
              <span className="text-sm font-bold text-nutrition-green">B</span>
            </div>
            <span className="text-lg font-light text-foreground/80 tracking-wide">
              Bitewise
            </span>
          </div>
          <div className="hidden sm:block w-px h-4"></div>
          <div className="hidden sm:flex items-center space-x-2 text-sm bg text-nutrition-green">
            {timeInfo.icon}
            <span className="font-medium">{timeInfo.greeting}</span>
          </div>
        </div>

        {/* Right side - Time and suggestion */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
            <span className="text-primary/80">{timeInfo.suggestion}</span>
          </div>
          <div className="text-xs text-muted-foreground/60 font-mono bg-muted/30 px-2 py-1 rounded-md">
            {timeString}
          </div>
        </div>
      </div>

      {/* Mobile greeting - shows below on small screens */}
      <div className="sm:hidden px-6 pb-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          {timeInfo.icon}
          <span className="font-medium">{timeInfo.greeting}</span>
          <span className="text-primary/80">• {timeInfo.suggestion}</span>
        </div>
      </div>
    </div>
  );
} 