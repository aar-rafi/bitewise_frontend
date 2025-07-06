import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LogIntakeDialog from '../LogIntakeDialog'

// Mock the API and external dependencies
vi.mock('@/lib/api', () => ({
  intakesApi: {
    create: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
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

describe('LogIntakeDialog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders trigger button', () => {
    render(
      <TestWrapper>
        <LogIntakeDialog />
      </TestWrapper>
    )
    
    const triggerButton = screen.getByRole('button', { name: /log intake/i })
    expect(triggerButton).toBeInTheDocument()
  })

  it('opens dialog when trigger button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <LogIntakeDialog />
      </TestWrapper>
    )
    
    const triggerButton = screen.getByRole('button', { name: /log intake/i })
    await user.click(triggerButton)
    
    expect(screen.getByText('Log Food Intake')).toBeInTheDocument()
    expect(screen.getByText('Record what you ate and when you ate it.')).toBeInTheDocument()
  })

  it('displays all form fields when dialog is open', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <LogIntakeDialog />
      </TestWrapper>
    )
    
    await user.click(screen.getByRole('button', { name: /log intake/i }))
    
    expect(screen.getByLabelText('Dish')).toBeInTheDocument()
    expect(screen.getByLabelText('Portion Size')).toBeInTheDocument()
    expect(screen.getByLabelText('Water (ml)')).toBeInTheDocument()
    expect(screen.getByLabelText('Time')).toBeInTheDocument()
  })

  it('accepts user input in form fields', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <LogIntakeDialog />
      </TestWrapper>
    )
    
    await user.click(screen.getByRole('button', { name: /log intake/i }))
    
    const dishInput = screen.getByPlaceholderText('Enter dish ID')
    const portionInput = screen.getByPlaceholderText('Enter portion size')
    const waterInput = screen.getByPlaceholderText('Enter water intake in ml')
    
    // Clear fields first then type new values
    await user.clear(dishInput)
    await user.type(dishInput, '123')
    
    await user.clear(portionInput)
    await user.type(portionInput, '1.5')
    
    await user.clear(waterInput)
    await user.type(waterInput, '250')
    
    expect(dishInput).toHaveValue(123)
    expect(portionInput).toHaveValue(1.5)
    expect(waterInput).toHaveValue(250)
  })

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <LogIntakeDialog />
      </TestWrapper>
    )
    
    await user.click(screen.getByRole('button', { name: /log intake/i }))
    expect(screen.getByText('Log Food Intake')).toBeInTheDocument()
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Log Food Intake')).not.toBeInTheDocument()
    })
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <LogIntakeDialog />
      </TestWrapper>
    )
    
    await user.click(screen.getByRole('button', { name: /log intake/i }))
    
    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /^log intake$/i })
    await user.click(submitButton)
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Please select a dish')).toBeInTheDocument()
    })
  })

  it('validates portion size minimum value', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <LogIntakeDialog />
      </TestWrapper>
    )
    
    await user.click(screen.getByRole('button', { name: /log intake/i }))
    
    const portionInput = screen.getByPlaceholderText('Enter portion size')
    await user.clear(portionInput)
    await user.type(portionInput, '0.05')
    
    const submitButton = screen.getByRole('button', { name: /^log intake$/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Portion size must be greater than 0')).toBeInTheDocument()
    })
  })

  it('handles form submission with valid data', async () => {
    const user = userEvent.setup()
    
    // Mock successful API call
    const { intakesApi } = await import('@/lib/api')
    const mockIntake = {
      id: 1,
      dish_id: 123,
      user_id: 1,
      intake_time: '2024-01-01T12:00:00',
      portion_size: '1.5',
      water_ml: 250,
      created_at: '2024-01-01T12:00:00',
      dish: {
        id: 123,
        name: 'Test Dish',
        description: 'Test Description',
        cuisine: 'Test Cuisine',
        image_urls: [],
        servings: 1,
        calories: '100',
        protein_g: '10',
        carbs_g: '15',
        fats_g: '5',
        fiber_g: '2',
        sugar_g: '3',
      }
    }
    vi.mocked(intakesApi.create).mockResolvedValue(mockIntake)
    
    render(
      <TestWrapper>
        <LogIntakeDialog />
      </TestWrapper>
    )
    
    await user.click(screen.getByRole('button', { name: /log intake/i }))
    
    // Fill in valid form data
    const dishInput = screen.getByPlaceholderText('Enter dish ID')
    const portionInput = screen.getByPlaceholderText('Enter portion size')
    const waterInput = screen.getByPlaceholderText('Enter water intake in ml')
    
    await user.clear(dishInput)
    await user.type(dishInput, '123')
    
    await user.clear(portionInput)
    await user.type(portionInput, '1.5')
    
    await user.clear(waterInput)
    await user.type(waterInput, '250')
    
    const submitButton = screen.getByRole('button', { name: /^log intake$/i })
    await user.click(submitButton)
    
    // Should call the API
    expect(intakesApi.create).toHaveBeenCalledWith({
      dish_id: 123,
      portion_size: 1.5,
      water_ml: 250,
      intake_time: expect.any(String)
    })
  })

  it('shows loading state when submitting', async () => {
    const user = userEvent.setup()
    
    // Mock a slow API call
    const { intakesApi } = await import('@/lib/api')
    vi.mocked(intakesApi.create).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    )
    
    render(
      <TestWrapper>
        <LogIntakeDialog />
      </TestWrapper>
    )
    
    await user.click(screen.getByRole('button', { name: /log intake/i }))
    
    // Fill in valid form data
    const dishInput = screen.getByPlaceholderText('Enter dish ID')
    await user.clear(dishInput)
    await user.type(dishInput, '123')
    
    const portionInput = screen.getByPlaceholderText('Enter portion size')
    await user.clear(portionInput)
    await user.type(portionInput, '1.5')
    
    const submitButton = screen.getByRole('button', { name: /^log intake$/i })
    await user.click(submitButton)
    
    // Should show loading state
    expect(screen.getByText('Logging...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })
}) 