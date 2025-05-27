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
            queryClient.invalidateQueries({ queryKey: chatKeys.messages(data.conversation_id) });
            if (!variables.conversation_id) {
                queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
            }
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