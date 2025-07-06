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
  Download,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

// Component for displaying images in messages
function MessageImages({ message }: { message: Message }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  // Clean up blob URLs when component unmounts (only for user messages with local URLs)
  useEffect(() => {
    return () => {
      if (message.is_user_message && message.extra_data?.use_local_urls && message.attachments?.images) {
        message.attachments.images.forEach(image => {
          if (image.url.startsWith('blob:')) {
            URL.revokeObjectURL(image.url);
          }
        });
      }
    };
  }, [message.is_user_message, message.extra_data?.use_local_urls, message.attachments?.images]);
  
  if (!message.attachments?.images || message.attachments.images.length === 0) {
    return null;
  }

  const images = message.attachments.images;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <div className="mt-3 space-y-2">
        {/* Images grid */}
        <div className={`grid gap-2 ${
          images.length === 1 
            ? 'grid-cols-1' 
            : images.length === 2 
            ? 'grid-cols-2' 
            : 'grid-cols-2 md:grid-cols-3'
        }`}>
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden border cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedImageIndex(index)}
            >
              <img
                src={image.url}
                alt={image.filename}
                className="w-full h-32 object-cover"
                loading="lazy"
              />
              
              {/* Overlay with image info */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="h-6 w-6 text-white" />
                </div>
              </div>
              
              {/* Image number badge for multiple images */}
              {images.length > 1 && (
                <Badge 
                  variant="secondary" 
                  className="absolute top-1 left-1 h-5 w-5 p-0 rounded-full text-xs flex items-center justify-center"
                >
                  {index + 1}
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Image metadata */}
        <div className="flex flex-wrap gap-1">
          {images.map((image, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {image.filename} ({formatFileSize(image.size)})
            </Badge>
          ))}
        </div>
      </div>

      {/* Image viewer dialog */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={() => setSelectedImageIndex(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-2">
          {selectedImageIndex !== null && (
            <>
              <DialogHeader className="px-4 py-2">
                <DialogTitle className="flex items-center justify-between">
                  <span>{images[selectedImageIndex].filename}</span>
                  <div className="flex items-center gap-2">
                    {images.length > 1 && (
                      <span className="text-sm text-muted-foreground">
                        {selectedImageIndex + 1} of {images.length}
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = images[selectedImageIndex].url;
                        link.download = images[selectedImageIndex].filename;
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="relative flex items-center justify-center p-4">
                <img
                  src={images[selectedImageIndex].url}
                  alt={images[selectedImageIndex].filename}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
                
                {/* Navigation buttons for multiple images */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                      onClick={() => setSelectedImageIndex(
                        selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1
                      )}
                    >
                      ←
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setSelectedImageIndex(
                        selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1
                      )}
                    >
                      →
                    </Button>
                  </>
                )}
              </div>
              
              <div className="px-4 pb-2">
                <div className="text-sm text-muted-foreground">
                  {formatFileSize(images[selectedImageIndex].size)} • {images[selectedImageIndex].content_type}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function MessageBubble({ message }: { message: Message }) {
  console.log("MessageBubble called with message:", message);
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
  console.log(
    `Message ID: ${message.id}, isUser: ${isUser}, isPending: ${isPending}, isThinking: ${isThinking}, status: ${message.status}`
  );

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

              {/* Display images ONLY for user messages - AI should never display images */}
              {message.is_user_message && (message.message_type === "image" || (message.attachments?.images && message.attachments.images.length > 0)) && (
                <MessageImages message={message} />
              )}

              {message.message_type === "file" && message.attachments && message.attachments.files && (
                <div className="mt-2">
                  {message.attachments.files.map((file, idx) => (
                    <Badge key={idx} variant="outline" className="mr-1 mb-1">
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </Badge>
                  ))}
                </div>
              )}

              {/* Show additional metadata for image messages */}
              {message.message_type === "image" && message.extra_data?.has_images && (
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {(message.extra_data.image_count as number) || 1} image{((message.extra_data.image_count as number) || 1) !== 1 ? 's' : ''} analyzed
                  </Badge>
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

  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessages(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [messagesResponse]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesResponse?.messages]);

  if (isLoading || !showMessages) {
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

  // Temporarily add optimistic messages if not already present
  // This is a diagnostic step to ensure they are in the array before rendering
  const optimisticMessages = [
    messages.find(
      (msg) => typeof msg.id === "string" && msg.id.startsWith("temp-user-")
    ),
    messages.find(
      (msg) => typeof msg.id === "string" && msg.id.startsWith("temp-ai-")
    ),
  ].filter(Boolean) as Message[];

  const messagesToRender = [
    ...messages.filter((msg) => typeof msg.id !== "string"),
    ...optimisticMessages,
  ];

  if (messagesToRender.length === 0) {
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
        {messagesToRender.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
