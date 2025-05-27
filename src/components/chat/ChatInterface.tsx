import { useState, useEffect } from "react";
import { Info, Settings, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConversationList } from "./ConversationList";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
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
    <div className={`flex h-screen bg-background ${className}`}>
      {/* Sidebar - Conversation List */}
      <div className="w-80 border-r bg-muted/20 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Chat Interface</h1>
          <p className="text-sm text-muted-foreground">
            AI-powered conversations
          </p>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full p-4">
            <ConversationList
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleConversationSelect}
            />
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId && conversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b bg-background p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {conversation.title}
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Badge
                        variant={
                          conversation.status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {conversation.status}
                      </Badge>
                      <span>ID: {conversation.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Conversation Summary Dialog */}
                  <Dialog open={showSummary} onOpenChange={setShowSummary}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Summary
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Conversation Summary</DialogTitle>
                      </DialogHeader>
                      {summary ? (
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold mb-2">Overview</h3>
                            <p className="text-sm text-muted-foreground">
                              {summary.summary}
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">Key Topics</h3>
                            <div className="flex flex-wrap gap-2">
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

            {/* Message Input */}
            <MessageInput
              conversationId={selectedConversationId}
              onMessageSent={handleMessageSent}
              placeholder={`Message ${conversation.title}...`}
            />
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Welcome to Chat Interface
              </h2>
              <p className="text-muted-foreground mb-6">
                Select a conversation from the sidebar to start chatting, or
                create a new conversation to begin.
              </p>

              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="text-base">Quick Start</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• Create a new conversation to start chatting</p>
                  <p>• Send messages with text or file attachments</p>
                  <p>• View conversation summaries and analytics</p>
                  <p>
                    • Manage conversations with edit, archive, and delete
                    options
                  </p>
                </CardContent>
              </Card>

              {/* Start New Conversation */}
              <div className="mt-6">
                <MessageInput
                  onMessageSent={handleMessageSent}
                  placeholder="Start a new conversation..."
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
