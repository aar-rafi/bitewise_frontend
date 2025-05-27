import { ChatInterface } from "@/components/chat/ChatInterface";
import { Bot } from "lucide-react";

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
        <ChatInterface />
      </div>
    </div>
  );
};

export default Chat;
