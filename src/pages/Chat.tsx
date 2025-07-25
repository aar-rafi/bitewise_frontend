import { Suspense } from "react";
import { ChatInterface } from "@/components/chat";
import { Skeleton } from "@/components/ui/skeleton";

// Loading component for chat interface
const ChatLoader = () => (
  <div className="h-screen flex">
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
    <div className="h-screen w-full">
      <Suspense fallback={<ChatLoader />}>
        <ChatInterface />
      </Suspense>
    </div>
  );
};

export default Chat;
