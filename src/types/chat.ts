// Types based on the API documentation
export interface Conversation {
    id: number;
    user_id: number;
    title: string;
    status: "active" | "archived";
    extra_data: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface AttachmentDataFile {
    name: string;
    size: number;
    type: string;
}

export interface AttachmentData {
    files: AttachmentDataFile[];
}

export type MessageStatus = "sent" | "pending" | "failed" | "thinking";

export interface Message {
    id: number | string;
    conversation_id: number;
    user_id?: number;
    is_user_message: boolean;
    content: string;
    message_type: "text" | "file" | "system_status";
    attachments?: AttachmentData | null;
    extra_data?: Record<string, unknown> | null;
    llm_model_id?: number | null;
    input_tokens?: number | null;
    output_tokens?: number | null;
    parent_message_id?: number | null;
    reactions?: Record<string, unknown> | null;
    status: MessageStatus;
    created_at: string;
    updated_at: string;

    thinking_stages?: string[];
    current_thinking_stage_index?: number;
}

export interface MessagesResponse {
    messages: Message[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface ChatResponse {
    conversation_id: number;
    user_message: Message;
    ai_message: Message;
    total_tokens_used: number;
    cost_estimate: number;
}

export interface ConversationSummary {
    conversation_id: number;
    summary: string;
    key_topics: string[];
    message_count: number;
    date_range: Record<string, string>;
}

export interface CreateConversationRequest {
    title: string;
    extra_data?: Record<string, unknown>;
}

export interface UpdateConversationRequest {
    title?: string;
    status?: "active" | "archived";
    extra_data?: Record<string, unknown>;
}

export interface CreateMessageRequest {
    content: string;
    message_type?: "text" | "image" | "file";
    attachments?: Record<string, unknown>;
    extra_data?: Record<string, unknown>;
    parent_message_id?: number;
}

export interface SendChatRequest {
    message: string;
    conversation_id?: number;
    message_type?: "text" | "file";
    attachments?: AttachmentData;
    context?: Record<string, unknown>;
}

export interface UpdateMessageRequest {
    content?: string;
    status?: "sent" | "pending" | "failed";
    reactions?: Record<string, unknown>;
    extra_data?: Record<string, unknown>;
}

export interface GetConversationsResponse {
    conversations: Conversation[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
} 