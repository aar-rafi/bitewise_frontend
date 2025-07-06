import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MessageInputWithImages } from '../MessageInputWithImages'

// Mock hooks
const mockSendChatMessage = { mutateAsync: vi.fn(), isPending: false }
const mockSendChatWithImages = { mutateAsync: vi.fn(), isPending: false }

vi.mock('@/hooks/useChat', () => ({
  useSendChatMessage: () => mockSendChatMessage,
  useSendChatWithImages: () => mockSendChatWithImages,
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

describe('MessageInputWithImages', () => {
  const mockOnMessageSent = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockSendChatMessage.isPending = false
  })

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <MessageInputWithImages onMessageSent={mockOnMessageSent} />
      </TestWrapper>
    )

    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
  })

  it('accepts text input', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <MessageInputWithImages onMessageSent={mockOnMessageSent} />
      </TestWrapper>
    )

    const input = screen.getByPlaceholderText('Type your message...')
    await user.type(input, 'Hello')
    
    expect(input).toHaveValue('Hello')
  })

  it('sends message when API is called', async () => {
    const user = userEvent.setup()
    
    mockSendChatMessage.mutateAsync.mockResolvedValue({
      conversation_id: 123,
      id: 1,
      content: 'Test',
    })

    render(
      <TestWrapper>
        <MessageInputWithImages onMessageSent={mockOnMessageSent} />
      </TestWrapper>
    )

    const input = screen.getByPlaceholderText('Type your message...')
    await user.type(input, 'Test{Enter}')

    await waitFor(() => {
      expect(mockSendChatMessage.mutateAsync).toHaveBeenCalled()
    })
  })

  it('handles disabled state', () => {
    render(
      <TestWrapper>
        <MessageInputWithImages 
          disabled={true}
          onMessageSent={mockOnMessageSent} 
        />
      </TestWrapper>
    )

    const input = screen.getByPlaceholderText('Type your message...')
    expect(input).toBeDisabled()
  })

  it('shows loading state correctly', () => {
    mockSendChatMessage.isPending = true

    render(
      <TestWrapper>
        <MessageInputWithImages onMessageSent={mockOnMessageSent} />
      </TestWrapper>
    )

    // Should show loading indicator
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })
}) 