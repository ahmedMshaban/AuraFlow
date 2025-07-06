import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ViewType } from '@/shared/hooks/useFilters';
import EmailSearch from './EmailSearch';

// Mock the helper function
vi.mock('../infrastructure/helpers/getFilterDisplayNames', () => ({
  getFilterDisplayName: vi.fn((filter: ViewType) => {
    switch (filter) {
      case 'my-day':
        return 'Today';
      case 'my-week':
        return 'This Week';
      case 'my-month':
        return 'This Month';
      default:
        return 'This Month';
    }
  }),
}));

// Mock CSS modules
vi.mock('../infrastructure/styles/home.module.css', () => ({
  default: {
    searchContainer: 'searchContainer',
    searchInputContainer: 'searchInputContainer',
    searchInput: 'searchInput',
    searchButtons: 'searchButtons',
    searchFilterIndicator: 'searchFilterIndicator',
    searchLoadingIndicator: 'searchLoadingIndicator',
  },
}));

// Mock Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Input: (props: { [key: string]: unknown }) => {
    // Filter out React-specific props that shouldn't be on DOM elements
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { colorScheme, isBackground, isLoading, size, variant, ...domProps } = props;
    return <input {...domProps} />;
  },
  IconButton: (props: { [key: string]: unknown }) => {
    // Filter out React-specific props that shouldn't be on DOM elements
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { colorScheme, isBackground, isLoading, size, variant, ...domProps } = props;
    return <button {...domProps} />;
  },
}));

describe('EmailSearch', () => {
  const mockOnSearch = vi.fn();
  const mockOnClear = vi.fn();

  const defaultProps = {
    onSearch: mockOnSearch,
    onClear: mockOnClear,
    isLoading: false,
    placeholder: 'Search emails...',
    activeFilter: 'my-month' as ViewType,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render search input with correct placeholder', () => {
      render(<EmailSearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search emails...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should render custom placeholder when provided', () => {
      render(
        <EmailSearch
          {...defaultProps}
          placeholder="Find your emails..."
        />,
      );

      const searchInput = screen.getByPlaceholderText('Find your emails...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should display current filter context', () => {
      render(
        <EmailSearch
          {...defaultProps}
          activeFilter="my-day"
        />,
      );

      expect(screen.getByText('Searching in: Today')).toBeInTheDocument();
    });

    it('should show search button', () => {
      render(<EmailSearch {...defaultProps} />);

      const searchButton = screen.getByLabelText('Search emails');
      expect(searchButton).toBeInTheDocument();
    });

    it('should not show clear button when search query is empty', () => {
      render(<EmailSearch {...defaultProps} />);

      const clearButton = screen.queryByLabelText('Clear search');
      expect(clearButton).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should update search query when typing', () => {
      render(<EmailSearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search emails...');
      fireEvent.change(searchInput, { target: { value: 'test query' } });

      expect(searchInput).toHaveValue('test query');
    });

    it('should show clear button when search query is not empty', () => {
      render(<EmailSearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search emails...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toBeInTheDocument();
    });

    it('should call onSearch when search button is clicked', () => {
      render(<EmailSearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search emails...');
      const searchButton = screen.getByLabelText('Search emails');

      fireEvent.change(searchInput, { target: { value: 'test query' } });
      fireEvent.click(searchButton);

      expect(mockOnSearch).toHaveBeenCalledWith('test query');
    });

    it('should call onSearch when Enter key is pressed', () => {
      render(<EmailSearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search emails...');

      fireEvent.change(searchInput, { target: { value: 'test query' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      expect(mockOnSearch).toHaveBeenCalledWith('test query');
    });

    it('should not call onSearch with empty query', () => {
      render(<EmailSearch {...defaultProps} />);

      const searchButton = screen.getByLabelText('Search emails');
      fireEvent.click(searchButton);

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should not call onSearch with whitespace-only query', () => {
      render(<EmailSearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search emails...');
      const searchButton = screen.getByLabelText('Search emails');

      fireEvent.change(searchInput, { target: { value: '   ' } });
      fireEvent.click(searchButton);

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should clear search query and call onClear when clear button is clicked', () => {
      render(<EmailSearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search emails...');

      // Type some text first
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      expect(searchInput).toHaveValue('test query');

      // Click clear button
      const clearButton = screen.getByLabelText('Clear search');
      fireEvent.click(clearButton);

      expect(searchInput).toHaveValue('');
      expect(mockOnClear).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should disable input when loading', () => {
      render(
        <EmailSearch
          {...defaultProps}
          isLoading={true}
        />,
      );

      const searchInput = screen.getByPlaceholderText('Search emails...');
      expect(searchInput).toBeDisabled();
    });

    it('should disable search button when loading', () => {
      render(
        <EmailSearch
          {...defaultProps}
          isLoading={true}
        />,
      );

      const searchButton = screen.getByLabelText('Search emails');
      expect(searchButton).toBeDisabled();
    });

    it('should show loading indicator when loading', () => {
      render(
        <EmailSearch
          {...defaultProps}
          isLoading={true}
        />,
      );

      expect(screen.getByText('Searching emails...')).toBeInTheDocument();
    });

    it('should not show loading indicator when not loading', () => {
      render(
        <EmailSearch
          {...defaultProps}
          isLoading={false}
        />,
      );

      expect(screen.queryByText('Searching emails...')).not.toBeInTheDocument();
    });
  });

  describe('Filter Changes', () => {
    it('should update filter display when activeFilter changes', () => {
      const { rerender } = render(
        <EmailSearch
          {...defaultProps}
          activeFilter="my-day"
        />,
      );

      expect(screen.getByText('Searching in: Today')).toBeInTheDocument();

      rerender(
        <EmailSearch
          {...defaultProps}
          activeFilter="my-week"
        />,
      );

      expect(screen.getByText('Searching in: This Week')).toBeInTheDocument();
    });

    it('should trigger search when filter changes and query exists', () => {
      const { rerender } = render(
        <EmailSearch
          {...defaultProps}
          activeFilter="my-day"
        />,
      );

      // Type a search query first
      const searchInput = screen.getByPlaceholderText('Search emails...');
      fireEvent.change(searchInput, { target: { value: 'test query' } });

      // Clear the mock to ignore any initial calls
      mockOnSearch.mockClear();

      // Change the filter - this should trigger the useEffect
      rerender(
        <EmailSearch
          {...defaultProps}
          activeFilter="my-week"
        />,
      );

      // Should trigger automatic search
      expect(mockOnSearch).toHaveBeenCalledWith('test query');
    });

    it('should not trigger search when filter changes but no query exists', () => {
      const { rerender } = render(
        <EmailSearch
          {...defaultProps}
          activeFilter="my-day"
        />,
      );

      // Change the filter without typing anything
      rerender(
        <EmailSearch
          {...defaultProps}
          activeFilter="my-week"
        />,
      );

      // Should not trigger search
      expect(mockOnSearch).not.toHaveBeenCalled();
    });
  });

  describe('Button States', () => {
    it('should disable search button when query is empty', () => {
      render(<EmailSearch {...defaultProps} />);

      const searchButton = screen.getByLabelText('Search emails');
      expect(searchButton).toBeDisabled();
    });

    it('should disable search button when query is whitespace only', () => {
      render(<EmailSearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search emails...');
      const searchButton = screen.getByLabelText('Search emails');

      fireEvent.change(searchInput, { target: { value: '   ' } });

      expect(searchButton).toBeDisabled();
    });

    it('should enable search button when query has content', () => {
      render(<EmailSearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search emails...');
      const searchButton = screen.getByLabelText('Search emails');

      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(searchButton).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels for buttons', () => {
      render(<EmailSearch {...defaultProps} />);

      expect(screen.getByLabelText('Search emails')).toBeInTheDocument();
    });

    it('should have proper aria label for clear button when visible', () => {
      render(<EmailSearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search emails...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });
  });
});
