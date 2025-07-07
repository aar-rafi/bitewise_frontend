import { useMutation, useQuery, useQueryClient, QueryKey } from '@tanstack/react-query';
import { chatApi } from '@/services/chatApi';
import {
    CreateConversationRequest,
    UpdateConversationRequest,
    CreateMessageRequest,
    SendChatRequest,
    UpdateMessageRequest,
    Message,
    MessagesResponse,
    AttachmentData,
    ChatResponse,
    ChatWithImagesRequest,
    ChatWithImagesResponse,
} from '@/types/chat';

// Query keys
export const chatKeys = {
    all: ['chat'] as const,
    conversations: () => [...chatKeys.all, 'conversations'] as const,
    conversation: (id: number) => [...chatKeys.conversations(), id] as const,
    messages: (conversationId: number) => [...chatKeys.all, 'messages', conversationId] as const,
    summary: (conversationId: number) => [...chatKeys.all, 'summary', conversationId] as const,
};

// AI Thinking messages
const thinkingStages = [
    "Parsing your query...",
    "Analyzing your health profile...",
    "Consulting nutritional database...",
    "Checking for allergens...",
    "Crafting a personalized response...",
    "Finalizing recommendations...",
];

// Conversation hooks
export function useConversations() {
    return useQuery({
        queryKey: chatKeys.conversations(),
        queryFn: chatApi.getConversations,
    });
}

export function useConversation(conversationId: number) {
    return useQuery({
        queryKey: chatKeys.conversation(conversationId),
        queryFn: () => chatApi.getConversation(conversationId),
        enabled: !!conversationId,
    });
}

export function useCreateConversation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateConversationRequest) => chatApi.createConversation(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
        },
    });
}

export function useUpdateConversation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateConversationRequest }) =>
            chatApi.updateConversation(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: chatKeys.conversation(id) });
            queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
        },
    });
}

export function useDeleteConversation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (conversationId: number) => chatApi.deleteConversation(conversationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
        },
    });
}

// Message hooks
export function useMessages(conversationId: number, page = 1, pageSize = 50) {
    return useQuery({
        queryKey: [...chatKeys.messages(conversationId), page, pageSize],
        queryFn: () => chatApi.getMessages(conversationId, page, pageSize),
        enabled: !!conversationId,
    });
}

export function useCreateMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ conversationId, data }: { conversationId: number; data: CreateMessageRequest }) =>
            chatApi.createMessage(conversationId, data),
        onSuccess: (_, { conversationId }) => {
            queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
        },
    });
}

export function useUpdateMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ messageId, data }: { messageId: number; data: UpdateMessageRequest }) =>
            chatApi.updateMessage(messageId, data),
        onSuccess: (message) => {
            queryClient.invalidateQueries({ queryKey: chatKeys.messages(message.conversation_id) });
        },
    });
}

export function useDeleteMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (messageId: number) => chatApi.deleteMessage(messageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...chatKeys.all, 'messages'] });
        },
    });
}

// Chat hooks
export function useSendChatMessage() {
    const queryClient = useQueryClient();

    // Define a more specific type for the context object
    type SendChatMessageContext = {
        previousMessages?: MessagesResponse;
        messagesQueryKey: readonly ["chat", "messages", number]; // Specific query key type
        tempAiMessageId: string; // ID is always string for optimistic AI message
        tempUserMessageId: string; // ID is always string for optimistic User message
    };

    return useMutation<ChatResponse, Error, SendChatRequest, SendChatMessageContext>({
        mutationFn: (data: SendChatRequest) => chatApi.sendChatMessage(data),
        onMutate: async (newMessageData): Promise<SendChatMessageContext> => {
            const tempConversationId = newMessageData.conversation_id || Date.now();
            const messagesQueryKey = chatKeys.messages(tempConversationId);

            await queryClient.cancelQueries({ queryKey: messagesQueryKey });
            const previousMessages = queryClient.getQueryData<MessagesResponse>(messagesQueryKey);

            const tempUserMessageId = `temp-user-${Date.now()}`;
            const optimisticUserMessage: Message = {
                id: tempUserMessageId,
                conversation_id: tempConversationId,
                is_user_message: true,
                content: newMessageData.message,
                message_type: newMessageData.attachments ? 'file' : 'text',
                attachments: newMessageData.attachments,
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            const tempAiMessageId = `temp-ai-${Date.now()}`;
            const optimisticAiThinkingMessage: Message = {
                id: tempAiMessageId,
                conversation_id: tempConversationId,
                is_user_message: false,
                content: thinkingStages[0],
                message_type: 'system_status',
                status: 'thinking',
                thinking_stages: thinkingStages,
                current_thinking_stage_index: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            queryClient.setQueryData<MessagesResponse>(messagesQueryKey, (old) => {
                const newMessages = old?.messages ? [...old.messages, optimisticUserMessage, optimisticAiThinkingMessage] : [optimisticUserMessage, optimisticAiThinkingMessage];
                return {
                    ...(old || { total_count: 0, page: 1, page_size: 50, total_pages: 1 }),
                    messages: newMessages,
                    total_count: (old?.total_count || 0) + 2,
                };
            });

            return { previousMessages, messagesQueryKey, tempAiMessageId, tempUserMessageId };
        },
        onError: (err, newMessageData, context) => {
            if (context?.previousMessages) {
                queryClient.setQueryData(context.messagesQueryKey, context.previousMessages);
            }
            console.error("Failed to send message:", err);
            if (context?.messagesQueryKey && context?.tempUserMessageId) {
                queryClient.setQueryData<MessagesResponse>(context.messagesQueryKey, (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        messages: old.messages.map(msg =>
                            msg.id === context.tempUserMessageId
                                ? { ...msg, status: 'failed' }
                                : msg
                        )
                    };
                });
            }
        },
        onSuccess: (data, variables, context) => {
            // When successful, the server messages will replace optimistic ones via invalidation
            // queryClient.invalidateQueries({ queryKey: chatKeys.messages(data.conversation_id) });
            // if (!variables.conversation_id) {
            //     queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
            // }
        },
        onSettled: (data, error, variables, context) => {
            // Ensure messages are refetched to clear optimistic UI or update failed status properly
            const conversationIdToInvalidate = data?.conversation_id || variables.conversation_id || (context?.messagesQueryKey && context.messagesQueryKey[2]);
            if (conversationIdToInvalidate) {
                queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationIdToInvalidate as number) });
            }
        },
    });
}

// New hook for sending chat messages with images
export function useSendChatWithImages() {
    const queryClient = useQueryClient();

    // Define a more specific type for the context object
    type SendChatWithImagesContext = {
        previousMessages?: MessagesResponse;
        messagesQueryKey: readonly ["chat", "messages", number];
        tempAiMessageId: string;
        tempUserMessageId: string;
        localImageUrls: string[]; // Track local blob URLs
    };

    return useMutation<ChatWithImagesResponse, Error, ChatWithImagesRequest, SendChatWithImagesContext>({
        mutationFn: (data: ChatWithImagesRequest) => chatApi.sendChatWithImages(data),
        onMutate: async (newMessageData): Promise<SendChatWithImagesContext> => {
            const tempConversationId = newMessageData.conversation_id || Date.now();
            const messagesQueryKey = chatKeys.messages(tempConversationId);

            await queryClient.cancelQueries({ queryKey: messagesQueryKey });
            const previousMessages = queryClient.getQueryData<MessagesResponse>(messagesQueryKey);

            // Create local blob URLs for preview
            const localImageUrls = newMessageData.images?.map(file => URL.createObjectURL(file)) || [];

            const tempUserMessageId = `temp-user-${Date.now()}`;
            const optimisticUserMessage: Message = {
                id: tempUserMessageId,
                conversation_id: tempConversationId,
                is_user_message: true,
                content: newMessageData.message,
                message_type: newMessageData.images && newMessageData.images.length > 0 ? 'image' : 'text',
                attachments: newMessageData.images && newMessageData.images.length > 0 ? {
                    files: [],
                    images: newMessageData.images.map((file, index) => ({
                        url: localImageUrls[index], // Use local blob URL
                        filename: file.name,
                        size: file.size,
                        content_type: file.type,
                        storage_path: '', // Will be filled by server
                        metadata: {
                            file_size: file.size,
                            upload_timestamp: new Date().toISOString(),
                        }
                    }))
                } : null,
                extra_data: newMessageData.images && newMessageData.images.length > 0 ? {
                    has_images: true,
                    image_count: newMessageData.images.length,
                    use_local_urls: true // Flag to indicate we should keep local URLs
                } : null,
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            const tempAiMessageId = `temp-ai-${Date.now()}`;
            const optimisticAiThinkingMessage: Message = {
                id: tempAiMessageId,
                conversation_id: tempConversationId,
                is_user_message: false,
                content: newMessageData.images && newMessageData.images.length > 0 
                    ? "Analyzing the uploaded images..." 
                    : thinkingStages[0],
                message_type: 'system_status',
                status: 'thinking',
                thinking_stages: newMessageData.images && newMessageData.images.length > 0 
                    ? ["Analyzing the uploaded images...", "Processing visual content...", "Generating response..."]
                    : thinkingStages,
                current_thinking_stage_index: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            queryClient.setQueryData<MessagesResponse>(messagesQueryKey, (old) => {
                const newMessages = old?.messages 
                    ? [...old.messages, optimisticUserMessage, optimisticAiThinkingMessage] 
                    : [optimisticUserMessage, optimisticAiThinkingMessage];
                return {
                    ...(old || { total_count: 0, page: 1, page_size: 50, total_pages: 1 }),
                    messages: newMessages,
                    total_count: (old?.total_count || 0) + 2,
                };
            });

            return { previousMessages, messagesQueryKey, tempAiMessageId, tempUserMessageId, localImageUrls };
        },
        onError: (err, newMessageData, context) => {
            if (context?.previousMessages) {
                queryClient.setQueryData(context.messagesQueryKey, context.previousMessages);
            }
            console.error("Failed to send message with images:", err);
            if (context?.messagesQueryKey && context?.tempUserMessageId) {
                queryClient.setQueryData<MessagesResponse>(context.messagesQueryKey, (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        messages: old.messages.map(msg =>
                            msg.id === context.tempUserMessageId
                                ? { ...msg, status: 'failed' }
                                : msg
                        )
                    };
                });
            }
            
            // Clean up blob URLs on error
            context?.localImageUrls.forEach(url => URL.revokeObjectURL(url));
        },
        onSuccess: (data, variables, context) => {
            // Instead of invalidating immediately, manually update the cache
            // This preserves local blob URLs for user messages
            if (context?.messagesQueryKey) {
                queryClient.setQueryData<MessagesResponse>(context.messagesQueryKey, (old) => {
                    if (!old) return old;
                    
                    // Remove temporary messages and add real ones
                    const filteredMessages = old.messages.filter(msg => 
                        msg.id !== context.tempUserMessageId && msg.id !== context.tempAiMessageId
                    );
                    
                    // Create user message with local blob URLs preserved
                    const userMessage: Message = {
                        ...data.user_message,
                        attachments: data.user_message.attachments && context.localImageUrls.length > 0 ? {
                            ...data.user_message.attachments,
                            images: data.user_message.attachments.images?.map((img, index) => ({
                                ...img,
                                url: context.localImageUrls[index] || img.url // Keep local URLs
                            }))
                        } : data.user_message.attachments,
                        extra_data: {
                            ...data.user_message.extra_data,
                            use_local_urls: true // Keep the flag
                        }
                    };
                    
                    // AI messages should NEVER display images - completely strip all image attachments
                    const aiMessage: Message = {
                        ...data.ai_message,
                        message_type: 'text', // Always text for AI responses
                        attachments: null, // Remove all attachments from AI messages
                        extra_data: {
                            ...data.ai_message.extra_data,
                            // Keep token counts and other metadata, but remove image-related data
                            has_images: undefined,
                            image_count: undefined
                        }
                    };
                    
                    return {
                        ...old,
                        messages: [...filteredMessages, userMessage, aiMessage],
                        total_count: old.total_count, // Should be same since we're replacing temp messages
                    };
                });
            }
        },
        onSettled: (data, error, variables, context) => {
            // Only clean up blob URLs if there was an error
            // On success, we keep them for the user message display
            if (error && context?.localImageUrls) {
                context.localImageUrls.forEach(url => URL.revokeObjectURL(url));
            }

            // Update conversations list if this was a new conversation
            if (!variables.conversation_id && data?.conversation_id) {
                queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
            }
        },
    });
}

export function useMarkMessagesAsRead() {
    return useMutation({
        mutationFn: (conversationId: number) => chatApi.markMessagesAsRead(conversationId),
    });
}

// Summary hooks
export function useConversationSummary(conversationId: number, maxLength?: number) {
    return useQuery({
        queryKey: [...chatKeys.summary(conversationId), maxLength],
        queryFn: () => chatApi.getConversationSummary(conversationId, maxLength),
        enabled: !!conversationId,
    });
} 

// Hook for confirming dish selection
export function useConfirmDishSelection() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ widgetId, dishId, portionSize }: { 
            widgetId: string; 
            dishId: number; 
            portionSize: number; 
        }) => chatApi.confirmDishSelection(widgetId, dishId, portionSize),
        onSuccess: (data) => {
            // Invalidate messages for the conversation
            queryClient.invalidateQueries({
                queryKey: chatKeys.messages(data.conversation_id)
            });
            
            // Invalidate conversations list to update timestamps
            queryClient.invalidateQueries({
                queryKey: chatKeys.conversations()
            });
        },
    });
} 