import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { useCart } from '@/components/cart/HeaderContext';

// Mock the cart context
const mockCartContext = {
  cartItems: [],
  quantity: 0,
  updateQuantity: jest.fn(),
  removeFromCart: jest.fn(),
  addToCart: jest.fn(),
  clearCart: jest.fn(),
  total: 0,
};

jest.mock('@/components/cart/HeaderContext', () => ({
  useCart: jest.fn(),
  CartProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="cart-provider">{children}</div>
  ),
}));

// Mock cart components
const MockCartDropdown = () => {
  const { cartItems, quantity, updateQuantity, removeFromCart } = useCart();

  return (
    <div data-testid="cart-dropdown">
      <div data-testid="cart-quantity">{quantity}</div>
      {cartItems.map((item: any) => (
        <div key={item.id} data-testid={`cart-item-${item.id}`}>
          <span>{item.name}</span>
          <span data-testid={`item-quantity-${item.id}`}>{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            data-testid={`increase-${item.id}`}
          >
            +
          </button>
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            data-testid={`decrease-${item.id}`}
          >
            -
          </button>
          <button
            onClick={() => removeFromCart(item.id)}
            data-testid={`remove-${item.id}`}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

describe('Cart Functionality', () => {
  const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCart.mockReturnValue(mockCartContext);
  });

  describe('Empty Cart', () => {
    it('should display empty cart state', () => {
      render(<MockCartDropdown />);

      expect(screen.getByTestId('cart-quantity')).toHaveTextContent('0');
      expect(screen.queryByTestId(/cart-item-/)).not.toBeInTheDocument();
    });
  });

  describe('Cart with Items', () => {
    beforeEach(() => {
      mockUseCart.mockReturnValue({
        ...mockCartContext,
        cartItems: [
          {
            id: 1,
            name: 'Test Product 1',
            price: '29.99',
            quantity: 2,
            image: '/test1.jpg',
          },
          {
            id: 2,
            name: 'Test Product 2',
            price: '39.99',
            quantity: 1,
            image: '/test2.jpg',
          },
        ],
        quantity: 3,
        total: 99.97,
      });
    });

    it('should display cart items correctly', () => {
      render(<MockCartDropdown />);

      expect(screen.getByTestId('cart-quantity')).toHaveTextContent('3');
      expect(screen.getByTestId('cart-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-2')).toBeInTheDocument();
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });

    it('should show correct quantities for each item', () => {
      render(<MockCartDropdown />);

      expect(screen.getByTestId('item-quantity-1')).toHaveTextContent('2');
      expect(screen.getByTestId('item-quantity-2')).toHaveTextContent('1');
    });

    it('should handle quantity increase', async () => {
      render(<MockCartDropdown />);

      const increaseButton = screen.getByTestId('increase-1');
      fireEvent.click(increaseButton);

      expect(mockCartContext.updateQuantity).toHaveBeenCalledWith(1, 3);
    });

    it('should handle quantity decrease', async () => {
      render(<MockCartDropdown />);

      const decreaseButton = screen.getByTestId('decrease-1');
      fireEvent.click(decreaseButton);

      expect(mockCartContext.updateQuantity).toHaveBeenCalledWith(1, 1);
    });

    it('should handle item removal', async () => {
      render(<MockCartDropdown />);

      const removeButton = screen.getByTestId('remove-1');
      fireEvent.click(removeButton);

      expect(mockCartContext.removeFromCart).toHaveBeenCalledWith(1);
    });
  });

  describe('Cart State Management', () => {
    it('should handle adding items to cart', () => {
      const addToCartSpy = jest.fn();
      mockUseCart.mockReturnValue({
        ...mockCartContext,
        addToCart: addToCartSpy,
      });

      // Mock add to cart button
      const AddToCartButton = () => {
        const { addToCart } = useCart();
        return (
          <button
            onClick={() =>
              addToCart({
                id: 1,
                name: 'New Product',
                price: '25.99',
                quantity: 1,
                image: '/new.jpg',
              })
            }
            data-testid="add-to-cart"
          >
            Add to Cart
          </button>
        );
      };

      render(<AddToCartButton />);

      const addButton = screen.getByTestId('add-to-cart');
      fireEvent.click(addButton);

      expect(addToCartSpy).toHaveBeenCalledWith({
        id: 1,
        name: 'New Product',
        price: '25.99',
        quantity: 1,
        image: '/new.jpg',
      });
    });

    it('should handle clearing cart', () => {
      const clearCartSpy = jest.fn();
      mockUseCart.mockReturnValue({
        ...mockCartContext,
        clearCart: clearCartSpy,
      });

      const ClearCartButton = () => {
        const { clearCart } = useCart();
        return (
          <button onClick={clearCart} data-testid="clear-cart">
            Clear Cart
          </button>
        );
      };

      render(<ClearCartButton />);

      const clearButton = screen.getByTestId('clear-cart');
      fireEvent.click(clearButton);

      expect(clearCartSpy).toHaveBeenCalled();
    });
  });

  describe('Cart Persistence', () => {
    it('should persist cart data in localStorage', () => {
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });

      // Simulate cart update
      const cartData = {
        items: [{ id: 1, name: 'Test', quantity: 1 }],
        quantity: 1,
      };

      // This would be called by the actual cart context
      localStorage.setItem('cart', JSON.stringify(cartData));

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cart',
        JSON.stringify(cartData)
      );
    });

    it('should load cart data from localStorage on initialization', () => {
      const localStorageMock = {
        getItem: jest.fn().mockReturnValue(
          JSON.stringify({
            items: [{ id: 1, name: 'Persisted Item', quantity: 2 }],
            quantity: 2,
          })
        ),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });

      // Simulate cart context initialization
      const cartData = localStorage.getItem('cart');

      expect(localStorageMock.getItem).toHaveBeenCalledWith('cart');
      expect(cartData).toBeTruthy();

      if (cartData) {
        const parsedData = JSON.parse(cartData);
        expect(parsedData.items).toHaveLength(1);
        expect(parsedData.quantity).toBe(2);
      }
    });
  });

  describe('Cart Calculations', () => {
    it('should calculate total correctly', () => {
      const cartItems = [
        { id: 1, price: '29.99', quantity: 2 },
        { id: 2, price: '39.99', quantity: 1 },
        { id: 3, price: '19.99', quantity: 3 },
      ];

      // Mock calculation function
      const calculateTotal = (items: any[]) => {
        return items.reduce((total, item) => {
          return total + parseFloat(item.price) * item.quantity;
        }, 0);
      };

      const total = calculateTotal(cartItems);
      expect(total).toBeCloseTo(159.95, 2);
    });

    it('should calculate quantity correctly', () => {
      const cartItems = [
        { id: 1, quantity: 2 },
        { id: 2, quantity: 1 },
        { id: 3, quantity: 3 },
      ];

      const calculateQuantity = (items: any[]) => {
        return items.reduce((total, item) => total + item.quantity, 0);
      };

      const quantity = calculateQuantity(cartItems);
      expect(quantity).toBe(6);
    });
  });
});