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
    <div className="border-t bg-white shadow-sm">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="border-b border-gray-200 p-4 bg-blue-50/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-md">
                <Paperclip className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {attachments.length} file{attachments.length !== 1 ? 's' : ''} attached
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-2 pr-1 bg-white border-gray-200"
              >
                <span className="truncate max-w-[150px] text-gray-700">
                  {file.name} ({formatFileSize(file.size)})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
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

      <div className="p-4">
        <div className="flex items-end space-x-3">
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
            className="flex-shrink-0 h-10 px-3 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
            title="Attach files"
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
              className="min-h-[44px] max-h-[120px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              rows={1}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={
              disabled ||
              isSending ||
              (!message.trim() && attachments.length === 0)
            }
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Help Text - Now with better readability */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 font-medium">
              Press Enter to send, Shift+Enter for new line
            </span>
            {message.length > 0 && (
              <span className="text-xs text-gray-500">
                {message.length} characters
              </span>
            )}
          </div>
          
          {attachments.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                {attachments.length} file{attachments.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
