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
    <div className="border-t bg-white shadow-sm">
      {/* Image Preview Bar - shown when images are selected */}
      {selectedImages.length > 0 && (
        <div className="border-b border-gray-200 p-4 bg-blue-50/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-md">
                <ImageIcon className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} attached
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeAllImages}
              disabled={isSending}
              className="ml-auto h-7 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="h-3 w-3 mr-1" />
              Remove All
            </Button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-1">
            {selectedImages.map((file, index) => (
              <div key={index} className="relative flex-shrink-0 group">
                <img
                  src={imagePreviews[index]}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                  disabled={isSending}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="bg-black/70 text-white text-xs px-1.5 py-0.5 rounded text-center truncate">
                    {file.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="p-4">
        <div className="flex items-end gap-3">
          {/* Image Upload Button */}
          <Popover open={showImageUpload} onOpenChange={setShowImageUpload}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={disabled || isSending}
                className="h-10 px-3 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
                title="Attach images"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[90vw] md:w-[600px] p-6" align="start">
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
              className="min-h-[44px] max-h-[120px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              rows={1}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!canSend || disabled}
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
          
          {selectedImages.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''}
              </Badge>
              <span className="text-xs text-gray-500">
                {(selectedImages.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 