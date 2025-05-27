# Chat Interface Documentation

## Overview

The Chat Interface is a comprehensive AI-powered chat system built with React, TypeScript, and the API endpoints defined in `api-doc.md`. It provides a modern, responsive chat experience with full conversation management capabilities.

## Features

### 🗣️ Conversation Management
- **Create new conversations** with custom titles
- **Edit conversation titles** in-place
- **Archive/unarchive conversations** for organization
- **Delete conversations** with confirmation
- **View conversation metadata** (ID, status, timestamps)

### 💬 Message System
- **Send text messages** with real-time updates
- **File attachments** support (images, documents, PDFs)
- **Message status tracking** (sent, pending, failed)
- **Message actions** (copy, delete, react)
- **Token usage display** for AI responses
- **Auto-scrolling** to new messages

### 🤖 AI Integration
- **AI response generation** via `/api/v1/chat/chat` endpoint
- **Message reactions** (like/dislike for AI responses)
- **Token counting** and cost estimation
- **Model information** display

### 📊 Analytics & Insights
- **Conversation summaries** with key topics extraction
- **Message count tracking**
- **Date range analysis**
- **Usage statistics**

### 🎨 User Experience
- **Responsive design** that works on all screen sizes
- **Modern UI** built with shadcn/ui components
- **Real-time updates** using React Query
- **Toast notifications** for user feedback
- **Loading states** and error handling
- **Keyboard shortcuts** (Enter to send, Shift+Enter for new line)

## API Endpoints Used

The chat interface integrates with all the chat-related API endpoints:

### Conversation Endpoints
- `POST /api/v1/chat/conversations` - Create new conversation
- `GET /api/v1/chat/conversations` - Get all conversations
- `GET /api/v1/chat/conversations/{id}` - Get specific conversation
- `PUT /api/v1/chat/conversations/{id}` - Update conversation
- `DELETE /api/v1/chat/conversations/{id}` - Delete conversation

### Message Endpoints
- `GET /api/v1/chat/conversations/{id}/messages` - Get conversation messages
- `POST /api/v1/chat/conversations/{id}/messages` - Create message
- `PUT /api/v1/chat/messages/{id}` - Update message
- `DELETE /api/v1/chat/messages/{id}` - Delete message

### Chat Endpoint
- `POST /api/v1/chat/chat` - Send chat message (creates both user and AI messages)

### Utility Endpoints
- `POST /api/v1/chat/conversations/{id}/mark-read` - Mark messages as read
- `GET /api/v1/chat/conversations/{id}/summary` - Get conversation summary

## Component Architecture

```
src/components/chat/
├── ChatInterface.tsx      # Main chat interface container
├── ConversationList.tsx   # Sidebar conversation management
├── MessageList.tsx        # Message display and interactions
├── MessageInput.tsx       # Message composition and sending
└── index.ts              # Component exports
```

### Supporting Files
```
src/
├── types/chat.ts          # TypeScript interfaces
├── services/chatApi.ts    # API service layer
├── hooks/useChat.ts       # React Query hooks
└── pages/Chat.tsx         # Chat page component
```

## Usage

### Navigation
Visit `/chat` to access the chat interface, or click the "Try Chat Interface Demo" button on the home page.

### Creating Conversations
1. Click the "+" button in the conversation sidebar
2. Enter a conversation title
3. Click "Create" or press Enter

### Sending Messages
1. Select a conversation from the sidebar
2. Type your message in the input field
3. Press Enter to send (Shift+Enter for new line)
4. Optionally attach files using the paperclip button

### Managing Conversations
- **Edit**: Click the three dots menu → Edit to rename
- **Archive**: Click the three dots menu → Archive to organize
- **Delete**: Click the three dots menu → Delete to remove permanently

### Message Actions
- **Copy**: Copy message content to clipboard
- **React**: Like/dislike AI responses (not available for user messages)
- **Delete**: Remove messages permanently

### Viewing Summaries
Click the "Summary" button in the chat header to view:
- Conversation overview
- Key topics discussed
- Message count and date range

## Configuration

### Environment Variables
Set the API base URL in your environment:
```env
VITE_API_BASE_URL=https://your-api-domain.com
```

### React Query
The chat interface uses React Query for:
- Caching conversation and message data
- Optimistic updates for better UX
- Background refetching
- Error handling and retries

## Error Handling

The interface includes comprehensive error handling:
- **Network errors**: Displays user-friendly error messages
- **Validation errors**: Shows inline form validation
- **API errors**: Toast notifications with error details
- **Loading states**: Skeleton loaders and spinners

## Accessibility

The chat interface follows accessibility best practices:
- **Keyboard navigation**: Full keyboard support
- **Screen readers**: Proper ARIA labels and roles
- **Focus management**: Logical tab order
- **Color contrast**: WCAG compliant color schemes

## Performance Optimizations

- **Virtual scrolling**: Efficient message list rendering
- **Debounced API calls**: Prevents excessive requests
- **Memoized components**: Reduces unnecessary re-renders
- **Lazy loading**: Components and data loaded as needed
- **Query caching**: Reduces API calls with React Query

## Future Enhancements

Potential improvements for the chat interface:
- **Real-time messaging** with WebSocket support
- **Message search** functionality
- **Conversation export** (PDF, text formats)
- **Message threading** for complex discussions
- **Voice message** recording and playback
- **Rich text editing** with markdown support
- **Custom themes** and dark mode
- **Message templates** for common responses 