import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useSendChatMessage } from "@/hooks/useChat";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  conversationId?: number;
  onMessageSent?: (conversationId: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MessageInput({
  conversationId,
  onMessageSent,
  placeholder = "Type your message...",
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const sendMessageMutation = useSendChatMessage();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return;

    try {
      const attachmentData =
        attachments.length > 0
          ? {
              files: attachments.map((file) => ({
                name: file.name,
                size: file.size,
                type: file.type,
              })),
            }
          : undefined;

      const response = await sendMessageMutation.mutateAsync({
        message: message.trim(),
        conversation_id: conversationId,
        message_type: attachments.length > 0 ? "file" : "text",
        attachments: attachmentData,
      });

      setMessage("");
      setAttachments([]);

      if (onMessageSent) {
        onMessageSent(response.conversation_id);
      }
    } catch (error) {
      console.error(
        "MessageInput: Failed to send message - error caught in component:",
        error
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !sendMessageMutation.isPending) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachments((prev) => [...prev, ...files].slice(0, 5));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isSending = sendMessageMutation.isPending;

  return (
    <div className="border-t bg-background p-4">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-2 pr-1"
              >
                <span className="truncate max-w-[150px]">
                  {file.name} ({formatFileSize(file.size)})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeAttachment(index)}
                  disabled={isSending}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end space-x-2">
        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,text/*,.pdf,.doc,.docx"
          disabled={isSending}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isSending}
          className="flex-shrink-0"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="min-h-[40px] max-h-[120px] resize-none pr-12"
            rows={1}
          />

          {/* Send Button */}
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={
              disabled ||
              isSending ||
              (!message.trim() && attachments.length === 0)
            }
            className="absolute right-2 bottom-2 h-6 w-6 p-0"
          >
            {isSending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Send className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Character/Token Counter */}
      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
        <div>
          {attachments.length > 0 && (
            <span>
              {attachments.length} file{attachments.length !== 1 ? "s" : ""}{" "}
              attached
            </span>
          )}
        </div>
        <div>
          {message.length > 0 && <span>{message.length} characters</span>}
        </div>
      </div>
    </div>
  );
}
