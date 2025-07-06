import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConversationList } from '../ConversationList'

// Mock the chat hooks
const mockMutateAsync = vi.fn()
const mockUseConversations = vi.fn()
const mockCreateConversation = { mutateAsync: mockMutateAsync, isPending: false }
const mockUpdateConversation = { mutateAsync: vi.fn(), isPending: false }
const mockDeleteConversation = { mutateAsync: vi.fn(), isPending: false }

vi.mock('@/hooks/useChat', () => ({
  useConversations: () => mockUseConversations(),
  useCreateConversation: () => mockCreateConversation,
  useUpdateConversation: () => mockUpdateConversation,
  useDeleteConversation: () => mockDeleteConversation,
}))

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('ConversationList', () => {
  const mockOnSelectConversation = vi.fn()
  const originalConsoleWarn = console.warn

  beforeEach(() => {
    vi.clearAllMocks()
    // Suppress Dialog accessibility warnings to keep tests clean
    console.warn = (message: unknown) => {
      if (typeof message === 'string' && message.includes('Missing `Description`')) {
        return
      }
      originalConsoleWarn(message)
    }
  })

  afterEach(() => {
    console.warn = originalConsoleWarn
  })

  it('renders empty state when no conversations', () => {
    mockUseConversations.mockReturnValue({
      data: { conversations: [] },
      isLoading: false,
      error: null,
    })

    render(
      <TestWrapper>
        <ConversationList onSelectConversation={mockOnSelectConversation} />
      </TestWrapper>
    )

    expect(screen.getByText('No conversations yet')).toBeInTheDocument()
    expect(screen.getByText('Create your first conversation to get started')).toBeInTheDocument()
  })

  it('renders conversations list', () => {
    const mockConversations = [
      {
        id: 1,
        title: 'Test Conversation 1',
        status: 'active' as const,
        updated_at: '2024-01-01T12:00:00Z',
      },
      {
        id: 2,
        title: 'Test Conversation 2',
        status: 'active' as const,
        updated_at: '2024-01-01T11:00:00Z',
      },
    ]

    mockUseConversations.mockReturnValue({
      data: { conversations: mockConversations },
      isLoading: false,
      error: null,
    })

    render(
      <TestWrapper>
        <ConversationList onSelectConversation={mockOnSelectConversation} />
      </TestWrapper>
    )

    expect(screen.getByText('Test Conversation 1')).toBeInTheDocument()
    expect(screen.getByText('Test Conversation 2')).toBeInTheDocument()
  })

  it('handles conversation selection', async () => {
    const user = userEvent.setup()
    const mockConversations = [
      {
        id: 1,
        title: 'Test Conversation',
        status: 'active' as const,
        updated_at: '2024-01-01T12:00:00Z',
      },
    ]

    mockUseConversations.mockReturnValue({
      data: { conversations: mockConversations },
      isLoading: false,
      error: null,
    })

    render(
      <TestWrapper>
        <ConversationList onSelectConversation={mockOnSelectConversation} />
      </TestWrapper>
    )

    const conversationElement = screen.getByText('Test Conversation')
    await user.click(conversationElement)
    expect(mockOnSelectConversation).toHaveBeenCalledWith(1)
  })

  it('opens create dialog when plus button clicked', async () => {
    const user = userEvent.setup()
    
    mockUseConversations.mockReturnValue({
      data: { conversations: [] },
      isLoading: false,
      error: null,
    })

    render(
      <TestWrapper>
        <ConversationList onSelectConversation={mockOnSelectConversation} />
      </TestWrapper>
    )

    const createButton = screen.getByRole('button')
    await user.click(createButton)

    expect(screen.getByText('Create New Conversation')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter conversation title')).toBeInTheDocument()
  })

  it('creates new conversation', async () => {
    const user = userEvent.setup()
    
    mockUseConversations.mockReturnValue({
      data: { conversations: [] },
      isLoading: false,
      error: null,
    })
    
    mockMutateAsync.mockResolvedValue({ id: 123, title: 'New Conversation' })

    render(
      <TestWrapper>
        <ConversationList onSelectConversation={mockOnSelectConversation} />
      </TestWrapper>
    )

    // Open create dialog
    await user.click(screen.getByRole('button'))
    
    // Fill in title and create
    const titleInput = screen.getByPlaceholderText('Enter conversation title')
    await user.type(titleInput, 'New Conversation')
    
    const createButton = screen.getByRole('button', { name: /create/i })
    await user.click(createButton)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ title: 'New Conversation' })
      expect(mockOnSelectConversation).toHaveBeenCalledWith(123)
    })
  })

  it('shows loading state', () => {
    mockUseConversations.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    })

    render(
      <TestWrapper>
        <ConversationList onSelectConversation={mockOnSelectConversation} />
      </TestWrapper>
    )

    expect(screen.getByText('Conversations')).toBeInTheDocument()
  })

  it('shows error state', () => {
    mockUseConversations.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load'),
    })

    render(
      <TestWrapper>
        <ConversationList onSelectConversation={mockOnSelectConversation} />
      </TestWrapper>
    )

    expect(screen.getByText('Failed to load conversations')).toBeInTheDocument()
  })
}) 