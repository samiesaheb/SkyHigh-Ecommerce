import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '@/components/search/SearchBar';

// Mock the search suggestions hook
jest.mock('@/components/search/useSearchSuggestions', () => ({
  useSearchSuggestions: () => ({
    suggestions: [
      {
        name: 'Geometry Whitening Facial Foam',
        slug: 'geometry-whitening-facial-foam',
        main_image: '/geometry.jpg',
        brand: 'Geometry',
        price: '25.99',
        category: 'Skincare',
      },
      {
        name: 'Geometry Cleansing Oil',
        slug: 'geometry-cleansing-oil',
        main_image: '/oil.jpg',
        brand: 'Geometry',
        price: '35.99',
        category: 'Skincare',
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('SearchBar Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders search input correctly', () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/search for products/i);
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  it('shows suggestions when typing', async () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/search for products/i);

    // Type in the search input
    await user.type(searchInput, 'geometry');

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Geometry Whitening Facial Foam')).toBeInTheDocument();
      expect(screen.getByText('Geometry Cleansing Oil')).toBeInTheDocument();
    });
  });

  it('handles keyboard navigation in suggestions', async () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/search for products/i);

    // Type to show suggestions
    await user.type(searchInput, 'geometry');

    await waitFor(() => {
      expect(screen.getByText('Geometry Whitening Facial Foam')).toBeInTheDocument();
    });

    // Press arrow down to select first suggestion
    fireEvent.keyDown(searchInput, { key: 'ArrowDown', code: 'ArrowDown' });

    // Check if first suggestion is highlighted
    const firstSuggestion = screen.getByText('Geometry Whitening Facial Foam').closest('button');
    expect(firstSuggestion).toHaveClass('bg-gray-100');

    // Press arrow down to select second suggestion
    fireEvent.keyDown(searchInput, { key: 'ArrowDown', code: 'ArrowDown' });

    // Check if second suggestion is highlighted
    const secondSuggestion = screen.getByText('Geometry Cleansing Oil').closest('button');
    expect(secondSuggestion).toHaveClass('bg-gray-100');
  });

  it('clears suggestions when input is empty', async () => {
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/search for products/i);

    // Type to show suggestions
    await user.type(searchInput, 'geometry');

    await waitFor(() => {
      expect(screen.getByText('Geometry Whitening Facial Foam')).toBeInTheDocument();
    });

    // Clear the input
    await user.clear(searchInput);

    // Suggestions should not be visible
    await waitFor(() => {
      expect(screen.queryByText('Geometry Whitening Facial Foam')).not.toBeInTheDocument();
    });
  });

  it('hides suggestions when clicking outside', async () => {
    render(
      <div>
        <SearchBar />
        <div data-testid="outside-element">Outside element</div>
      </div>
    );

    const searchInput = screen.getByPlaceholderText(/search for products/i);

    // Type to show suggestions
    await user.type(searchInput, 'geometry');

    await waitFor(() => {
      expect(screen.getByText('Geometry Whitening Facial Foam')).toBeInTheDocument();
    });

    // Click outside
    const outsideElement = screen.getByTestId('outside-element');
    await user.click(outsideElement);

    // Suggestions should be hidden
    await waitFor(() => {
      expect(screen.queryByText('Geometry Whitening Facial Foam')).not.toBeInTheDocument();
    });
  });

  it('handles Enter key to search', async () => {
    const mockPush = jest.fn();

    // Override the router mock for this test
    jest.doMock('next/navigation', () => ({
      useRouter: () => ({
        push: mockPush,
        replace: jest.fn(),
      }),
      useSearchParams: () => new URLSearchParams(),
    }));

    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/search for products/i);

    // Type a search term
    await user.type(searchInput, 'test search');

    // Press Enter
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    // Should navigate to search page
    expect(mockPush).toHaveBeenCalledWith('/search?q=test%20search');
  });

  it('shows search icon and handles click', () => {
    render(<SearchBar />);

    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeInTheDocument();

    // Should contain search icon
    const searchIcon = searchButton.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  it('handles suggestion click navigation', async () => {
    const mockPush = jest.fn();

    jest.doMock('next/navigation', () => ({
      useRouter: () => ({
        push: mockPush,
        replace: jest.fn(),
      }),
      useSearchParams: () => new URLSearchParams(),
    }));

    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/search for products/i);

    // Type to show suggestions
    await user.type(searchInput, 'geometry');

    await waitFor(() => {
      expect(screen.getByText('Geometry Whitening Facial Foam')).toBeInTheDocument();
    });

    // Click on a suggestion
    const suggestion = screen.getByText('Geometry Whitening Facial Foam');
    await user.click(suggestion);

    // Should navigate to product page
    expect(mockPush).toHaveBeenCalledWith('/products/geometry-whitening-facial-foam');
  });

  it('displays loading state during search', async () => {
    // Mock loading state
    jest.doMock('@/components/search/useSearchSuggestions', () => ({
      useSearchSuggestions: () => ({
        suggestions: [],
        isLoading: true,
        error: null,
      }),
    }));

    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/search for products/i);
    await user.type(searchInput, 'geometry');

    // Should show loading indicator
    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  it('displays error state when search fails', async () => {
    // Mock error state
    jest.doMock('@/components/search/useSearchSuggestions', () => ({
      useSearchSuggestions: () => ({
        suggestions: [],
        isLoading: false,
        error: 'Failed to load suggestions',
      }),
    }));

    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/search for products/i);
    await user.type(searchInput, 'geometry');

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to load suggestions/i)).toBeInTheDocument();
    });
  });
});