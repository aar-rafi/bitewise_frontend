import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  User,
  Bot,
  MoreVertical,
  Edit2,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useMessages,
  useDeleteMessage,
  useUpdateMessage,
} from "@/hooks/useChat";
import { Message } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

interface MessageListProps {
  conversationId: number;
}

function MessageBubble({ message }: { message: Message }) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const { toast } = useToast();
  const deleteMessage = useDeleteMessage();
  const updateMessage = useUpdateMessage();

  const [currentThinkingText, setCurrentThinkingText] = useState(
    message.content
  );
  const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (
      message.status === "thinking" &&
      message.thinking_stages &&
      message.thinking_stages.length > 0
    ) {
      let stageIndex = message.current_thinking_stage_index || 0;
      setCurrentThinkingText(message.thinking_stages[stageIndex]);

      thinkingIntervalRef.current = setInterval(() => {
        stageIndex = (stageIndex + 1) % message.thinking_stages!.length;
        setCurrentThinkingText(message.thinking_stages![stageIndex]);
      }, 2000);
    } else {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = null;
      }
      setCurrentThinkingText(message.content);
    }

    return () => {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
      }
    };
  }, [
    message.status,
    message.thinking_stages,
    message.content,
    message.current_thinking_stage_index,
  ]);

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(message.id.toString());
      toast({
        title: "Copied to clipboard",
        description: "Message copied successfully",
      });
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy message to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async () => {
    if (typeof message.id === "string") {
      toast({
        title: "Cannot delete",
        description: "This message is still being processed.",
        variant: "destructive",
      });
      return;
    }
    try {
      await deleteMessage.mutateAsync(message.id as number);
      toast({
        title: "Message deleted",
        description: "The message has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete the message",
        variant: "destructive",
      });
    }
  };

  const handleReaction = async (type: "like" | "dislike") => {
    if (typeof message.id === "string") {
      toast({
        title: "Cannot react",
        description: "Wait for the message to be confirmed by the server.",
        variant: "destructive",
      });
      return;
    }
    try {
      const currentReactions = message.reactions || {};
      const newReactions = {
        ...currentReactions,
        [type]: ((currentReactions[type] as number) || 0) + 1,
      };

      await updateMessage.mutateAsync({
        messageId: message.id as number,
        data: { reactions: newReactions },
      });
    } catch (error) {
      toast({
        title: "Reaction failed",
        description: "Failed to add reaction",
        variant: "destructive",
      });
    }
  };

  const isUser = message.is_user_message;
  const isThinking = message.status === "thinking";
  const isPending = message.status === "pending";

  let badgeVariant: "default" | "secondary" | "destructive" = "secondary";
  if (
    message.status === "sent" ||
    message.status === "pending" ||
    message.status === "thinking"
  ) {
    badgeVariant = "default";
  }
  if (message.status === "failed") badgeVariant = "destructive";

  // Base card classes
  let cardBaseClasses = "";
  if (isUser && !isThinking) {
    cardBaseClasses = "bg-primary text-primary-foreground";
  } else {
    cardBaseClasses = "bg-muted";
  }

  // Conditional classes for animations and styling
  const pendingUserMessageClasses =
    isUser && isPending ? "animate-pulse-border rounded-lg" : ""; // For pulsing border
  const thinkingAiMessageClasses =
    !isUser && isThinking ? "border-blue-500 border-dashed" : "";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`flex items-start space-x-2 max-w-[80%] ${
          isUser ? "flex-row-reverse space-x-reverse" : ""
        }`}
      >
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        <div className={`${pendingUserMessageClasses}`}>
          {" "}
          {/* Wrapper for pulsing border on user pending */}
          <Card
            className={`${cardBaseClasses} ${thinkingAiMessageClasses} transition-all duration-300`}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={badgeVariant}
                    className="text-xs min-w-[60px] flex justify-center items-center"
                  >
                    {message.status}
                    {(isPending || isThinking) && (
                      <Loader2 className="h-3 w-3 ml-1 animate-spin" />
                    )}
                  </Badge>
                  {!(isThinking || (isUser && isPending)) && ( // Hide timestamp for thinking AI and pending User messages
                    <span className="text-xs opacity-70">
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>

                {!(isThinking || (isUser && isPending)) && ( // Hide menu for thinking AI and pending User messages
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                        disabled={typeof message.id === "string"}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => copyToClipboard(message.content)}
                        disabled={message.message_type === "system_status"}
                      >
                        {copiedMessageId === message.id.toString() ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </>
                        )}
                      </DropdownMenuItem>
                      {!isUser && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleReaction("like")}
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Like ({(message.reactions?.like as number) || 0})
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleReaction("dislike")}
                          >
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            Dislike (
                            {(message.reactions?.dislike as number) || 0})
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={handleDeleteMessage}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="whitespace-pre-wrap break-words">
                {isThinking ? (
                  <div className="flex items-center space-x-2 text-sm font-medium py-1">
                    {/* Loader is now with the status badge, text is more prominent */}
                    <span>{currentThinkingText}</span>
                  </div>
                ) : (
                  message.content
                )}
              </div>

              {message.message_type === "file" && message.attachments && (
                <div className="mt-2">
                  {message.attachments.files.map((file, idx) => (
                    <Badge key={idx} variant="outline" className="mr-1 mb-1">
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </Badge>
                  ))}
                </div>
              )}

              {!isUser &&
                !isThinking &&
                (message.input_tokens ||
                  0 > 0 ||
                  message.output_tokens ||
                  0 > 0) && (
                  <div className="flex items-center space-x-2 mt-2 text-xs opacity-70">
                    <span>
                      Tokens:{" "}
                      {(message.input_tokens || 0) +
                        (message.output_tokens || 0)}
                    </span>
                    {message.llm_model_id && (
                      <span>Model: {message.llm_model_id}</span>
                    )}
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function MessageList({ conversationId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    data: messagesResponse,
    isLoading,
    error,
  } = useMessages(conversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesResponse?.messages]);

  if (isLoading) {
    return (
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`flex ${
                i % 2 === 0 ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex items-start space-x-2 max-w-[80%]">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-16 w-64" />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Failed to load messages</p>
          <p className="text-sm opacity-70">Please try again later</p>
        </div>
      </div>
    );
  }

  const messages = messagesResponse?.messages || [];

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No messages yet</p>
          <p className="text-sm">Start a conversation by sending a message</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-1">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
