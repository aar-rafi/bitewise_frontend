import {
    Conversation,
    Message,
    MessagesResponse,
    ChatResponse,
    ConversationSummary,
    CreateConversationRequest,
    UpdateConversationRequest,
    CreateMessageRequest,
    SendChatRequest,
    UpdateMessageRequest,
    GetConversationsResponse,
    ChatWithImagesRequest,
    ChatWithImagesResponse,
} from '@/types/chat';
import { authApi } from '@/lib/api';

// Import the existing API infrastructure
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// API endpoint paths for chat
const CHAT_API_ENDPOINTS = {
    CONVERSATIONS: "/api/v1/chat/conversations",
    CONVERSATION: (id: number) => `/api/v1/chat/conversations/${id}`,
    MESSAGES: (conversationId: number) => `/api/v1/chat/conversations/${conversationId}/messages`,
    MESSAGE: (id: number) => `/api/v1/chat/messages/${id}`,
    CHAT: "/api/v1/chat/chat",
    CHAT_WITH_IMAGES: "/api/v1/chat/chat-with-images",
    MARK_READ: (conversationId: number) => `/api/v1/chat/conversations/${conversationId}/mark-read`,
    SUMMARY: (conversationId: number) => `/api/v1/chat/conversations/${conversationId}/summary`,
} as const;

// Generic API call function for chat (similar to the one in api.ts)
async function chatApiCall<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Get access token from localStorage (same as api.ts)
    const accessToken = localStorage.getItem("access_token");

    const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (accessToken) {
        defaultHeaders["Authorization"] = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // If 401 and we have a refresh token, try to refresh
            if (response.status === 401) {
                const refreshToken = localStorage.getItem("refresh_token");
                if (refreshToken) {
                    try {
                        // Try to refresh the token using the existing auth API
                        const refreshResponse = await authApi.refreshToken(refreshToken);

                        // Retry the original request with new token
                        const newConfig = { ...config };
                        if (newConfig.headers) {
                            (newConfig.headers as Record<string, string>)["Authorization"] = `Bearer ${refreshResponse.access_token}`;
                        }

                        const retryResponse = await fetch(url, newConfig);
                        if (!retryResponse.ok) {
                            throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
                        }

                        const contentType = retryResponse.headers.get("content-type");
                        if (contentType && contentType.indexOf("application/json") !== -1) {
                            return await retryResponse.json();
                        } else {
                            return { success: true, status: retryResponse.status } as T;
                        }
                    } catch (refreshError) {
                        // Refresh failed, clear tokens
                        localStorage.removeItem("access_token");
                        localStorage.removeItem("refresh_token");
                        localStorage.removeItem("token_expiry");
                        throw new Error("Session expired. Please log in again.");
                    }
                }
            }

            throw new Error(
                errorData.detail?.[0]?.msg ||
                (typeof errorData.detail === 'string' ? errorData.detail : `HTTP ${response.status}: ${response.statusText}`)
            );
        }

        // Handle JSON and non-JSON responses
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json();
        } else {
            return { success: true, status: response.status } as T;
        }

    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Network error. Please check your connection and try again.");
    }
}

// Specialized API call function for multipart/form-data requests
async function chatFormDataApiCall<T>(
    endpoint: string,
    formData: FormData
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const accessToken = localStorage.getItem("access_token");

    const headers: HeadersInit = {};
    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }
    // Don't set Content-Type for FormData - let the browser set it with boundary

    const config: RequestInit = {
        method: 'POST',
        headers,
        body: formData,
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // If 401 and we have a refresh token, try to refresh
            if (response.status === 401) {
                const refreshToken = localStorage.getItem("refresh_token");
                if (refreshToken) {
                    try {
                        // Try to refresh the token using the existing auth API
                        const refreshResponse = await authApi.refreshToken(refreshToken);

                        // Retry the original request with new token
                        const newHeaders = { ...headers };
                        newHeaders["Authorization"] = `Bearer ${refreshResponse.access_token}`;

                        const retryResponse = await fetch(url, {
                            ...config,
                            headers: newHeaders,
                        });
                        
                        if (!retryResponse.ok) {
                            throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
                        }

                        return await retryResponse.json();
                    } catch (refreshError) {
                        // Refresh failed, clear tokens
                        localStorage.removeItem("access_token");
                        localStorage.removeItem("refresh_token");
                        localStorage.removeItem("token_expiry");
                        throw new Error("Session expired. Please log in again.");
                    }
                }
            }

            throw new Error(
                errorData.detail?.[0]?.msg ||
                (typeof errorData.detail === 'string' ? errorData.detail : `HTTP ${response.status}: ${response.statusText}`)
            );
        }

        return await response.json();

    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Network error. Please check your connection and try again.");
    }
}

export const chatApi = {
    // Conversation endpoints
    async createConversation(data: CreateConversationRequest): Promise<Conversation> {
        return chatApiCall<Conversation>(CHAT_API_ENDPOINTS.CONVERSATIONS, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async getConversations(): Promise<GetConversationsResponse> {
        return chatApiCall<GetConversationsResponse>(CHAT_API_ENDPOINTS.CONVERSATIONS);
    },

    async getConversation(conversationId: number): Promise<Conversation> {
        return chatApiCall<Conversation>(CHAT_API_ENDPOINTS.CONVERSATION(conversationId));
    },

    async updateConversation(
        conversationId: number,
        data: UpdateConversationRequest
    ): Promise<Conversation> {
        return chatApiCall<Conversation>(CHAT_API_ENDPOINTS.CONVERSATION(conversationId), {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteConversation(conversationId: number): Promise<string> {
        return chatApiCall<string>(CHAT_API_ENDPOINTS.CONVERSATION(conversationId), {
            method: 'DELETE',
        });
    },

    // Message endpoints
    async getMessages(
        conversationId: number,
        page = 1,
        pageSize = 50
    ): Promise<MessagesResponse> {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
        });
        return chatApiCall<MessagesResponse>(
            `${CHAT_API_ENDPOINTS.MESSAGES(conversationId)}?${params}`
        );
    },

    async createMessage(
        conversationId: number,
        data: CreateMessageRequest
    ): Promise<Message> {
        return chatApiCall<Message>(CHAT_API_ENDPOINTS.MESSAGES(conversationId), {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateMessage(messageId: number, data: UpdateMessageRequest): Promise<Message> {
        return chatApiCall<Message>(CHAT_API_ENDPOINTS.MESSAGE(messageId), {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteMessage(messageId: number): Promise<string> {
        return chatApiCall<string>(CHAT_API_ENDPOINTS.MESSAGE(messageId), {
            method: 'DELETE',
        });
    },

    // Chat endpoint
    async sendChatMessage(data: SendChatRequest): Promise<ChatResponse> {
        return chatApiCall<ChatResponse>(CHAT_API_ENDPOINTS.CHAT, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // New chat with images endpoint
    async sendChatWithImages(data: ChatWithImagesRequest): Promise<ChatWithImagesResponse> {
        const formData = new FormData();
        
        // Add text message
        formData.append('message', data.message);
        
        // Add conversation ID if provided
        if (data.conversation_id) {
            formData.append('conversation_id', data.conversation_id.toString());
        }
        
        // Add images if provided
        if (data.images && data.images.length > 0) {
            data.images.forEach((image) => {
                formData.append('images', image);
            });
        }
        
        return chatFormDataApiCall<ChatWithImagesResponse>(
            CHAT_API_ENDPOINTS.CHAT_WITH_IMAGES,
            formData
        );
    },

    // Utility endpoints
    async markMessagesAsRead(conversationId: number): Promise<string> {
        return chatApiCall<string>(CHAT_API_ENDPOINTS.MARK_READ(conversationId), {
            method: 'POST',
        });
    },

    async getConversationSummary(
        conversationId: number,
        maxLength?: number
    ): Promise<ConversationSummary> {
        const params = maxLength ? `?max_length=${maxLength}` : '';
        return chatApiCall<ConversationSummary>(
            `${CHAT_API_ENDPOINTS.SUMMARY(conversationId)}${params}`
        );
    },
}; 