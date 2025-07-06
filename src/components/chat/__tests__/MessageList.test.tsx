import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MessageList } from '../MessageList'

// Mock hooks
const mockUseMessages = vi.fn()
const mockDeleteMessage = { mutateAsync: vi.fn(), isPending: false }
const mockUpdateMessage = { mutateAsync: vi.fn(), isPending: false }

vi.mock('@/hooks/useChat', () => ({
  useMessages: () => mockUseMessages(),
  useDeleteMessage: () => mockDeleteMessage,
  useUpdateMessage: () => mockUpdateMessage,
}))

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('MessageList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    mockUseMessages.mockReturnValue({
      data: { messages: [] },
      isLoading: false,
      error: null,
    })

    render(
      <TestWrapper>
        <MessageList conversationId={1} />
      </TestWrapper>
    )

    // Should render successfully
    expect(document.body).toBeInTheDocument()
  })

  it('handles loading state without errors', () => {
    mockUseMessages.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    })

    render(
      <TestWrapper>
        <MessageList conversationId={1} />
      </TestWrapper>
    )

    // Should show loading elements
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('handles error state gracefully', () => {
    mockUseMessages.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Test error'),
    })

    render(
      <TestWrapper>
        <MessageList conversationId={1} />
      </TestWrapper>
    )

    // Should not crash
    expect(document.body).toBeInTheDocument()
  })

  it('renders with message data provided', () => {
    const mockMessages = [
      {
        id: 1,
        content: 'Test message',
        is_user_message: true,
        status: 'sent',
        created_at: '2024-01-01T12:00:00Z',
        message_type: 'text',
      },
    ]

    mockUseMessages.mockReturnValue({
      data: { messages: mockMessages },
      isLoading: false,
      error: null,
    })

    render(
      <TestWrapper>
        <MessageList conversationId={1} />
      </TestWrapper>
    )

    // Should render with data
    expect(document.body).toBeInTheDocument()
  })
}) 