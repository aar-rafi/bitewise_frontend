import { useState, useRef, useEffect } from "react";
import { Send, Loader2, ImageIcon, X, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useSendChatMessage, useSendChatWithImages } from "@/hooks/useChat";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "./ImageUpload";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MessageInputWithImagesProps {
  conversationId?: number;
  onMessageSent?: (conversationId: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MessageInputWithImages({
  conversationId,
  onMessageSent,
  placeholder = "Type your message...",
  disabled = false,
}: MessageInputWithImagesProps) {
  const [message, setMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Track blob URLs
  const [showImageUpload, setShowImageUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const sendMessageMutation = useSendChatMessage();
  const sendImageMessageMutation = useSendChatWithImages();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() && selectedImages.length === 0) return;

    try {
      if (selectedImages.length > 0) {
        // Send message with images using the new API
        const response = await sendImageMessageMutation.mutateAsync({
          message: message.trim(),
          conversation_id: conversationId,
          images: selectedImages,
        });

        setMessage("");
        setSelectedImages([]);
        setShowImageUpload(false);
        
        // Clean up blob URLs after successful send
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
        setImagePreviews([]);

        if (onMessageSent) {
          onMessageSent(response.conversation_id);
        }
      } else {
        // Send regular text message
        const response = await sendMessageMutation.mutateAsync({
          message: message.trim(),
          conversation_id: conversationId,
          message_type: "text",
        });

        setMessage("");

        if (onMessageSent) {
          onMessageSent(response.conversation_id);
        }
      }
    } catch (error) {
      console.error("MessageInputWithImages: Failed to send message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isSending) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImagesSelected = (images: File[]) => {
    // Clean up old blob URLs
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    
    // Create new blob URLs
    const newPreviews = images.map(file => URL.createObjectURL(file));
    
    setSelectedImages(images);
    setImagePreviews(newPreviews);
    if (images.length > 0) {
      setShowImageUpload(false); // Close the popover when images are selected
    }
  };

  const removeImage = (index: number) => {
    // Clean up the specific blob URL
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const removeAllImages = () => {
    // Clean up all blob URLs
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    
    setSelectedImages([]);
    setImagePreviews([]);
    setShowImageUpload(false);
  };

  const isSending = sendMessageMutation.isPending || sendImageMessageMutation.isPending;
  const canSend = (message.trim() || selectedImages.length > 0) && !isSending;

  return (
    <div className="border-t bg-background">
      {/* Image Preview Bar - shown when images are selected */}
      {selectedImages.length > 0 && (
        <div className="border-b p-3 bg-muted/20">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} attached
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeAllImages}
              disabled={isSending}
              className="ml-auto h-6 px-2"
            >
              <X className="h-3 w-3 mr-1" />
              Remove All
            </Button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto">
            {selectedImages.map((file, index) => (
              <div key={index} className="relative flex-shrink-0 group">
                <img
                  src={imagePreviews[index]}
                  alt={`Preview ${index + 1}`}
                  className="w-16 h-16 object-cover rounded border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                  disabled={isSending}
                >
                  <X className="h-2 w-2" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="p-4">
        <div className="flex items-end gap-2">
          {/* Image Upload Button */}
          <Popover open={showImageUpload} onOpenChange={setShowImageUpload}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={disabled || isSending}
                className="h-10 px-3"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-4" align="start">
              <ImageUpload
                onImagesSelected={handleImagesSelected}
                disabled={disabled || isSending}
              />
            </PopoverContent>
          </Popover>

          {/* Text Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedImages.length > 0 
                ? "Describe what you'd like to know about these images..." 
                : placeholder
              }
              disabled={disabled || isSending}
              className="min-h-[40px] max-h-[120px] resize-none pr-12"
              rows={1}
            />
            
            {/* Character counter - positioned absolutely */}
            {message.length > 0 && (
              <span className="absolute bottom-1 right-14 text-xs text-muted-foreground">
                {message.length}
              </span>
            )}
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!canSend || disabled}
            className="h-10 px-4"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <span>
            {selectedImages.length > 0 && (
              <span className="text-primary font-medium">
                {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} attached •{' '}
              </span>
            )}
            Press Enter to send, Shift+Enter for new line
          </span>
          
          {selectedImages.length > 0 && (
            <span>
              Total size: {(selectedImages.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024)).toFixed(2)} MB
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 