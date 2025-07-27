import { Suspense, useState, useEffect, useCallback } from "react";
import { ChatInterface } from "@/components/chat";
import { Skeleton } from "@/components/ui/skeleton";

// Hook for smart navbar behavior
const useSmartNavbar = () => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    // Show navbar when scrolling up, hide when scrolling down
    if (currentScrollY < lastScrollY || currentScrollY < 10) {
      setIsNavbarVisible(true);
    } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setIsNavbarVisible(false);
    }
    
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Listen for input focus events globally
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('input[type="text"], textarea, [contenteditable="true"]')) {
        setIsInputFocused(true);
        setIsNavbarVisible(false); // Hide navbar when typing
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('input[type="text"], textarea, [contenteditable="true"]')) {
        setIsInputFocused(false);
        setIsNavbarVisible(true); // Show navbar when done typing
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return { isNavbarVisible, isInputFocused };
};

// Loading component for chat interface
const ChatLoader = () => (
  <div className="h-screen flex">
    {/* Sidebar skeleton - Hidden on mobile, visible on desktop (matches ChatInterface) */}
    <div className="hidden md:flex w-72 border-r bg-muted/20 p-4 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border rounded-lg p-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
    
    {/* Main chat area skeleton */}
    <div className="flex-1 flex flex-col">
      {/* Header skeleton */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Mobile hamburger skeleton */}
            <div className="md:hidden">
              <Skeleton className="h-6 w-6" />
            </div>
            <div>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32 mt-2" />
            </div>
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
      
      {/* Messages area skeleton - matches MessageList exactly */}
      <div className="flex-1 p-4">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className={`flex items-start space-x-2 max-w-[70%] ${
                i % 2 === 0 ? "" : "flex-row-reverse space-x-reverse"
              }`}>
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-16 w-64 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Input area skeleton */}
      <div className="p-4">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

const Chat = () => {
  const { isNavbarVisible, isInputFocused } = useSmartNavbar();

  // Pass navbar state to parent via custom event
  useEffect(() => {
    const event = new CustomEvent('navbarVisibilityChange', {
      detail: { isVisible: isNavbarVisible, isInputFocused }
    });
    window.dispatchEvent(event);
  }, [isNavbarVisible, isInputFocused]);

  return (
    <div className="h-screen w-full">
      <Suspense fallback={<ChatLoader />}>
        <ChatInterface />
      </Suspense>
    </div>
  );
};

export default Chat;
