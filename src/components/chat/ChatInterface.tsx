import { useState, useEffect } from "react";
import { MessageCircle, Menu, X, ChartArea, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConversationList } from "./ConversationList";
import { MessageList } from "./MessageList";
import { MessageInputWithImages } from "./MessageInputWithImages";
import { ChatHeader } from "./ChatHeader";
import {
  useConversation,
  useMarkMessagesAsRead,
} from "@/hooks/useChat";
import { AnimatePresence, motion } from "framer-motion";

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | undefined
  >();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const { data: conversation } = useConversation(selectedConversationId!);
  const markAsReadMutation = useMarkMessagesAsRead();

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      markAsReadMutation.mutate(selectedConversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversationId, markAsReadMutation.mutate]);

  const handleConversationSelect = (conversationId: number) => {
    setSelectedConversationId(conversationId);
    setIsHistoryOpen(false); // Close history when selecting conversation
  };

  const handleMessageSent = (conversationId: number) => {
    // If this is a new conversation, select it
    if (!selectedConversationId) {
      setSelectedConversationId(conversationId);
    }
  };

  return (
    <div className={`relative h-full bg-background ${className}`}>
      {/* Animated History Sidebar */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsHistoryOpen(false)}
            />
            
            {/* History Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-background backdrop-blur-sm border-r border-border/50 z-50 shadow-2xl"
            >
                               <div className="h-full p-4 overflow-y-auto">
                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-lg font-semibold text-foreground">Chat History</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsHistoryOpen(false)}
                    className="h-8 w-8 p-0 hover:bg-nutrition-green/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ConversationList
                  selectedConversationId={selectedConversationId}
                  onSelectConversation={handleConversationSelect}
                  showMobileSheet={false}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Container */}
      <div className="h-full flex flex-col w-[80%] mx-auto">
        {/* Sticky Floating Header */}
        <ChatHeader />
        
        {selectedConversationId && conversation ? (
          <>
            {/* Clean Chat Messages Container */}
            <div className="flex-1 overflow-hidden bg-background">
              <MessageList conversationId={selectedConversationId} />
            </div>

            {/* Message Input Area */}
            <div className="px-4 pt-4 pb-8 bg-background border-t border-border/30">
              <MessageInputWithImages
                conversationId={selectedConversationId}
                onMessageSent={handleMessageSent}
                placeholder="Type your message..."
              />
            </div>
          </>
        ) : (
          <>
            {/* Welcome Screen */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
              <div className="text-center max-w-2xl w-full">
                <div className="w-24 h-24 bg-nutrition-green rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-4 text-foreground">
                  Welcome to Chat
                </h1>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  Start a conversation, upload images for analysis, or explore your nutrition journey with our AI assistant
                </p>

                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <Card className="text-center border-primary/20 hover:border-primary/40 transition-colors">
                    <CardContent className="p-6">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <MessageCircle className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Chat</h3>
                      <p className="text-sm text-muted-foreground">Start conversations with our AI assistant</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center border-primary/20 hover:border-primary/40 transition-colors">
                    <CardContent className="p-6">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Utensils />
                      </div>
                      <h3 className="font-semibold mb-2">Food Analysis</h3>
                      <p className="text-sm text-muted-foreground">Upload food images for nutritional insights</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center border-primary/20 hover:border-primary/40 transition-colors">
                    <CardContent className="p-6">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <ChartArea />
                      </div>
                      <h3 className="font-semibold mb-2">Nutrition Tracking</h3>
                      <p className="text-sm text-muted-foreground">Get personalized nutrition recommendations</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Message Input for Welcome Screen */}
            <div className="px-4 pt-4 pb-8 bg-background border-t border-border/30">
              <MessageInputWithImages
                onMessageSent={handleMessageSent}
                placeholder="Ask me about nutrition, upload a food image, or start a conversation..."
              />
            </div>
          </>
        )}
      </div>

      {/* Pocket Menu Button - Bottom Left */}
      <motion.div
        className="fixed bottom-6 left-6 z-30"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="h-12 w-12 rounded-full bg-nutrition-green hover:bg-nutrition-emerald shadow-lg border-0 text-white"
          size="sm"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  );
}
