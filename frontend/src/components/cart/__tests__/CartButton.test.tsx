import { render, screen, fireEvent } from '@testing-library/react'
import CartButton from '@/components/cart/CartButton'

describe('CartButton', () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    mockOnClick.mockClear()
  })

  it('renders cart button with zero quantity', () => {
    render(<CartButton onClick={mockOnClick} cartQuantity={0} />)
    
    expect(screen.getByLabelText('Shopping cart with 0 items')).toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument() // Badge should not show for 0
  })

  it('renders cart button with quantity badge', () => {
    render(<CartButton onClick={mockOnClick} cartQuantity={3} />)
    
    expect(screen.getByLabelText('Shopping cart with 3 items')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('handles click events', () => {
    render(<CartButton onClick={mockOnClick} cartQuantity={2} />)
    
    const button = screen.getByLabelText('Shopping cart with 2 items')
    fireEvent.click(button)
    
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('shows correct quantity for large numbers', () => {
    render(<CartButton onClick={mockOnClick} cartQuantity={99} />)
    
    expect(screen.getByText('99')).toBeInTheDocument()
  })

  it('limits badge display for very large numbers', () => {
    render(<CartButton onClick={mockOnClick} cartQuantity={999} />)
    
    // Assuming the component has logic to show "99+" for numbers > 99
    // If not, this test would need to be adjusted
    const badge = screen.getByText('99+')
    expect(badge).toBeInTheDocument()
  })

  it('has correct accessibility attributes', () => {
    render(<CartButton onClick={mockOnClick} cartQuantity={5} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Shopping cart with 5 items')
  })

  it('applies correct CSS classes', () => {
    render(<CartButton onClick={mockOnClick} cartQuantity={1} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('relative', 'p-2.5', 'transition-all')
  })
})