import { lazy, Suspense } from "react";
import { Bot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load the ChatInterface for code splitting
const ChatInterface = lazy(() => import("@/components/chat/ChatInterface").then(module => ({ default: module.ChatInterface })));

// Loading component for chat interface
const ChatLoader = () => (
  <div className="h-[calc(100vh-10rem)] flex">
    {/* Sidebar skeleton */}
    <div className="w-72 border-r bg-muted/20 p-4 space-y-4">
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
      <div className="border-b p-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32 mt-2" />
      </div>
      <div className="flex-1 p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className="max-w-[70%] space-y-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      <div className="p-4">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

const Chat = () => {
  return (
    <div className="min-h-screen w-full relative">
      {/* Compact header */}
      <div className="relative z-10 bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Bot className="h-8 w-8 text-green-700" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-nutrition-green to-nutrition-emerald bg-clip-text text-transparent">
                Nutrition Chat
              </h1>
              <p className="text-green-700/80 text-sm font-medium">
                Get personalized nutrition advice
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width chat interface */}
      <div className="relative z-10 h-[calc(100vh-10rem)] pb-12">
        <Suspense fallback={<ChatLoader />}>
          <ChatInterface />
        </Suspense>
      </div>
    </div>
  );
};

export default Chat;
