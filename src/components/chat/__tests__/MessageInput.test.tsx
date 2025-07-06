import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MessageInput } from '../MessageInput'

// Mock the chat hook
const mockMutateAsync = vi.fn()
const mockSendChatMessage = {
  mutateAsync: mockMutateAsync,
  isPending: false,
}

vi.mock('@/hooks/useChat', () => ({
  useSendChatMessage: () => mockSendChatMessage,
}))

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// Test wrapper with QueryClient
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('MessageInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendChatMessage.isPending = false
  })

  it('renders message input with placeholder', () => {
    render(
      <TestWrapper>
        <MessageInput placeholder="Test placeholder..." />
      </TestWrapper>
    )

    expect(screen.getByPlaceholderText('Test placeholder...')).toBeInTheDocument()
    
    // Find the send button (button with Send icon inside the message area)
    const sendButton = screen.getAllByRole('button')[1] // Second button is the send button
    expect(sendButton).toBeInTheDocument()
    expect(sendButton).toBeDisabled() // Send button should be disabled when empty
  })

  it('enables send button when message is typed', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <MessageInput />
      </TestWrapper>
    )

    const textarea = screen.getByPlaceholderText('Type your message...')
    const sendButton = screen.getAllByRole('button')[1] // Second button is the send button

    expect(sendButton).toBeDisabled()

    await user.type(textarea, 'Hello world')
    expect(sendButton).not.toBeDisabled()
  })

  it('sends message when send button is clicked', async () => {
    const user = userEvent.setup()
    const onMessageSent = vi.fn()
    
    mockMutateAsync.mockResolvedValue({ conversation_id: 123 })

    render(
      <TestWrapper>
        <MessageInput conversationId={123} onMessageSent={onMessageSent} />
      </TestWrapper>
    )

    const textarea = screen.getByPlaceholderText('Type your message...')
    const sendButton = screen.getAllByRole('button')[1] // Second button is the send button

    await user.type(textarea, 'Test message')
    await user.click(sendButton)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        message: 'Test message',
        conversation_id: 123,
        message_type: 'text',
        attachments: undefined,
      })
    })

    expect(onMessageSent).toHaveBeenCalledWith(123)
    expect(textarea).toHaveValue('') // Input should be cleared
  })

  it('sends message when Enter key is pressed', async () => {
    const user = userEvent.setup()
    
    mockMutateAsync.mockResolvedValue({ conversation_id: 456 })

    render(
      <TestWrapper>
        <MessageInput conversationId={456} />
      </TestWrapper>
    )

    const textarea = screen.getByPlaceholderText('Type your message...')
    
    await user.type(textarea, 'Message via Enter key')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        message: 'Message via Enter key',
        conversation_id: 456,
        message_type: 'text',
        attachments: undefined,
      })
    })
  })

  it('does not send message when Shift+Enter is pressed', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <MessageInput />
      </TestWrapper>
    )

    const textarea = screen.getByPlaceholderText('Type your message...')
    
    await user.type(textarea, 'Line 1')
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    await user.type(textarea, 'Line 2')

    expect(mockMutateAsync).not.toHaveBeenCalled()
    expect(textarea).toHaveValue('Line 1\nLine 2')
  })

  it('shows character count when typing', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <MessageInput />
      </TestWrapper>
    )

    const textarea = screen.getByPlaceholderText('Type your message...')
    
    await user.type(textarea, 'Hello')
    
    expect(screen.getByText('5 characters')).toBeInTheDocument()
  })

  it('shows loading state when sending', async () => {
    mockSendChatMessage.isPending = true
    
    render(
      <TestWrapper>
        <MessageInput />
      </TestWrapper>
    )

    // Check for the loader icon in the send button - look for the correct class
    expect(document.querySelector('.lucide-loader-circle')).toBeInTheDocument()
  })

  it('disables input when disabled prop is true', () => {
    render(
      <TestWrapper>
        <MessageInput disabled={true} />
      </TestWrapper>
    )

    const textarea = screen.getByPlaceholderText('Type your message...')
    const sendButton = screen.getAllByRole('button')[1] // Second button is the send button
    
    expect(textarea).toBeDisabled()
    expect(sendButton).toBeDisabled()
  })

  it('trims whitespace from messages', async () => {
    const user = userEvent.setup()
    
    mockMutateAsync.mockResolvedValue({ conversation_id: 789 })

    render(
      <TestWrapper>
        <MessageInput conversationId={789} />
      </TestWrapper>
    )

    const textarea = screen.getByPlaceholderText('Type your message...')
    
    await user.type(textarea, '   Test message with spaces   ')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        message: 'Test message with spaces',
        conversation_id: 789,
        message_type: 'text',
        attachments: undefined,
      })
    })
  })
}) 