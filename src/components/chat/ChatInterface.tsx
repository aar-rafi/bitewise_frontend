import { useState, useEffect } from "react";
import { MessageCircle, Settings, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConversationList, ConversationListMobileTrigger } from "./ConversationList";
import { MessageList } from "./MessageList";
import { MessageInputWithImages } from "./MessageInputWithImages";
import {
  useConversation,
  useConversationSummary,
  useMarkMessagesAsRead,
} from "@/hooks/useChat";

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | undefined
  >();
  const [showSummary, setShowSummary] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const { data: conversation } = useConversation(selectedConversationId!);
  const { data: summary } = useConversationSummary(
    selectedConversationId!,
    undefined
  );
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
  };

  const handleMessageSent = (conversationId: number) => {
    // If this is a new conversation, select it
    if (!selectedConversationId) {
      setSelectedConversationId(conversationId);
    }
  };

  return (
    <div className={`flex h-full bg-background ${className}`}>
      {/* Sidebar - Conversation List (Desktop only) */}
      <div className="hidden md:flex w-72 border-r bg-muted/20 flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="h-full p-4">
            <ConversationList
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleConversationSelect}
              showMobileSheet={false}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sheet for Conversation List */}
      <ConversationList
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleConversationSelect}
        showMobileSheet={true}
        isMobileSheetOpen={isMobileSheetOpen}
        onMobileSheetOpenChange={setIsMobileSheetOpen}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId && conversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b p-4 bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Hamburger menu for mobile */}
                  <ConversationListMobileTrigger
                    onOpenSheet={() => setIsMobileSheetOpen(true)}
                  />
                  <div>
                    <h2 className="font-semibold text-lg truncate max-w-[300px]">
                      {conversation.title}
                    </h2>
                    {/* <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Badge
                        variant={
                          conversation.status === "active"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {conversation.status}
                      </Badge>
                    </div> */}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Dialog open={showSummary} onOpenChange={setShowSummary}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Summary
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Conversation Summary</DialogTitle>
                      </DialogHeader>
                      {summary ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Summary</h4>
                            <p className="text-sm text-muted-foreground">
                              {summary.summary}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Key Topics</h4>
                            <div className="flex flex-wrap gap-1">
                              {summary.key_topics.map((topic, index) => (
                                <Badge key={index} variant="secondary">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Messages:</span>{" "}
                              {summary.message_count}
                            </div>
                            <div>
                              <span className="font-medium">
                                Conversation ID:
                              </span>{" "}
                              {summary.conversation_id}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No summary available</p>
                          <p className="text-sm">
                            Summary will be generated based on conversation
                            content
                          </p>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <MessageList conversationId={selectedConversationId} />

            {/* Message Input with Image Support */}
            <div className="pb-4">
              <MessageInputWithImages
                conversationId={selectedConversationId}
                onMessageSent={handleMessageSent}
                placeholder={`Message ${conversation.title}...`}
              />
            </div>
          </>
        ) : (
          <>
            {/* Header for welcome screen with hamburger menu */}
            <div className="border-b p-4 bg-background md:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ConversationListMobileTrigger
                    onOpenSheet={() => setIsMobileSheetOpen(true)}
                  />
                  <h2 className="font-semibold text-lg">Chat</h2>
                </div>
              </div>
            </div>

            {/* Welcome Screen */}
            <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Welcome to Chat
              </h2>
              <p className="text-muted-foreground mb-4 text-sm">
                Start a conversation or upload images for analysis
              </p>

              <Card className="text-left mb-4">
                <CardContent className="p-4 space-y-1 text-sm">
                  <p>• Create new conversations</p>
                  <p>• Send text messages and images</p>
                  <p>• Get AI analysis and insights</p>
                </CardContent>
              </Card>

              {/* Start New Conversation */}
              <MessageInputWithImages
                onMessageSent={handleMessageSent}
                placeholder="Start a new conversation..."
              />
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
