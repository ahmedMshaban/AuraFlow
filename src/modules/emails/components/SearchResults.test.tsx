import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ViewType } from '@/shared/hooks/useFilters';
import type { GmailMessageWithStress } from '@/shared/types/gmail.types';
import SearchResults from './SearchResults';

// Mock the helper function
vi.mock('../infrastructure/helpers/getFilterDisplayNames', () => ({
  getFilterSearchDescription: vi.fn((filter: ViewType) => {
    switch (filter) {
      case 'my-day':
        return 'emails from today';
      case 'my-week':
        return 'emails from the last 7 days';
      case 'my-month':
        return 'emails from the last 30 days';
      default:
        return 'emails from the last 30 days';
    }
  }),
}));

// Mock CSS modules
vi.mock('../infrastructure/styles/home.module.css', () => ({
  default: {
    searchResultsContainer: 'searchResultsContainer',
    searchResultsHeader: 'searchResultsHeader',
    clearSearchButton: 'clearSearchButton',
    loadingSpinner: 'loadingSpinner',
    errorMessage: 'errorMessage',
    noResultsMessage: 'noResultsMessage',
    searchResultsList: 'searchResultsList',
    searchResultItem: 'searchResultItem',
  },
}));

// Mock EmailItem component
vi.mock('../../home/components/emails/EmailItem', () => ({
  default: ({ email }: { email: GmailMessageWithStress }) => (
    <div data-testid={`email-item-${email.id}`}>
      <span>{email.subject}</span>
      <span>{email.from}</span>
    </div>
  ),
}));

// Mock Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Box: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  HStack: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div
      data-testid="hstack"
      {...props}
    >
      {children}
    </div>
  ),
  Text: ({ children, as, ...props }: { children: React.ReactNode; as?: string; [key: string]: unknown }) => {
    const Component = as || 'span';
    return React.createElement(Component, props, children);
  },
  Heading: ({ children, as, ...props }: { children: React.ReactNode; as?: string; [key: string]: unknown }) => {
    const Component = as || 'h3';
    return React.createElement(Component, props, children);
  },
  Badge: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <span {...props}>{children}</span>
  ),
}));

describe('SearchResults', () => {
  const mockOnClearSearch = vi.fn();

  const mockEmail: GmailMessageWithStress = {
    id: '1',
    threadId: 'thread-1',
    subject: 'Test Email Subject',
    from: 'test@example.com',
    to: 'recipient@example.com',
    snippet: 'This is a test email snippet',
    date: new Date('2024-01-15'),
    read: false,
    important: false,
    starred: false,
    hasAttachments: false,
    labels: [],
    stressAnalysis: {
      stressIndicators: {
        urgentKeywords: 1,
        allCapsWords: 0,
        exclamationMarks: 0,
        deadlineKeywords: 1,
        negativeEmotions: 0,
      },
      priority: 'medium',
    },
  };

  const defaultProps = {
    searchResults: [],
    searchQuery: '',
    isSearching: false,
    searchError: null,
    onClearSearch: mockOnClearSearch,
    activeFilter: 'my-month' as ViewType,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading state when isSearching is true', () => {
      render(
        <SearchResults
          {...defaultProps}
          isSearching={true}
          searchQuery="test query"
        />,
      );

      expect(screen.getByText('Searching for "test query"...')).toBeInTheDocument();
      expect(screen.getByText('Loading search results...')).toBeInTheDocument();
    });

    it('should show loading spinner during search', () => {
      render(
        <SearchResults
          {...defaultProps}
          isSearching={true}
          searchQuery="loading test"
        />,
      );

      const loadingElement = screen.getByText('Loading search results...');
      expect(loadingElement).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when searchError is provided', () => {
      const errorMessage = 'Network connection failed';
      render(
        <SearchResults
          {...defaultProps}
          searchError={errorMessage}
          searchQuery="error query"
        />,
      );

      expect(screen.getByText('Search Error')).toBeInTheDocument();
      expect(screen.getByText(`Error searching for "error query": ${errorMessage}`)).toBeInTheDocument();
    });

    it('should show clear search button in error state', () => {
      render(
        <SearchResults
          {...defaultProps}
          searchError="Some error"
          searchQuery="test"
        />,
      );

      const clearButton = screen.getByText('Clear Search');
      expect(clearButton).toBeInTheDocument();
    });

    it('should call onClearSearch when clear button is clicked in error state', () => {
      render(
        <SearchResults
          {...defaultProps}
          searchError="Some error"
          searchQuery="test"
        />,
      );

      const clearButton = screen.getByText('Clear Search');
      fireEvent.click(clearButton);

      expect(mockOnClearSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe('No Results State', () => {
    it('should display no results message when searchQuery exists but no results found', () => {
      render(
        <SearchResults
          {...defaultProps}
          searchQuery="no results query"
          searchResults={[]}
        />,
      );

      expect(screen.getByText('No Results Found')).toBeInTheDocument();
      expect(
        screen.getByText(/No emails found for "no results query" in emails from the last 30 days/),
      ).toBeInTheDocument();
    });

    it('should show clear search button in no results state', () => {
      render(
        <SearchResults
          {...defaultProps}
          searchQuery="test"
          searchResults={[]}
        />,
      );

      const clearButton = screen.getByText('Clear Search');
      expect(clearButton).toBeInTheDocument();
    });

    it('should call onClearSearch when clear button is clicked in no results state', () => {
      render(
        <SearchResults
          {...defaultProps}
          searchQuery="test"
          searchResults={[]}
        />,
      );

      const clearButton = screen.getByText('Clear Search');
      fireEvent.click(clearButton);

      expect(mockOnClearSearch).toHaveBeenCalledTimes(1);
    });

    it('should display correct filter context in no results message', () => {
      render(
        <SearchResults
          {...defaultProps}
          searchQuery="test"
          searchResults={[]}
          activeFilter="my-day"
        />,
      );

      expect(screen.getByText(/No emails found for "test" in emails from today/)).toBeInTheDocument();
    });
  });

  describe('Search Results Display', () => {
    it('should display search results when emails are found', () => {
      const searchResults = [mockEmail];
      render(
        <SearchResults
          {...defaultProps}
          searchQuery="test query"
          searchResults={searchResults}
        />,
      );

      expect(
        screen.getByText(/Search Results for "test query" in emails from the last 30 days \(1 found\)/),
      ).toBeInTheDocument();
      expect(screen.getByTestId('email-item-1')).toBeInTheDocument();
    });

    it('should display multiple search results', () => {
      const searchResults = [
        mockEmail,
        {
          ...mockEmail,
          id: '2',
          threadId: 'thread-2',
          subject: 'Second Email',
          from: 'another@example.com',
        },
      ];
      render(
        <SearchResults
          {...defaultProps}
          searchQuery="multiple results"
          searchResults={searchResults}
        />,
      );

      expect(
        screen.getByText(/Search Results for "multiple results" in emails from the last 30 days \(2 found\)/),
      ).toBeInTheDocument();
      expect(screen.getByTestId('email-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('email-item-2')).toBeInTheDocument();
    });

    it('should show clear search button in results state', () => {
      render(
        <SearchResults
          {...defaultProps}
          searchQuery="test"
          searchResults={[mockEmail]}
        />,
      );

      const clearButton = screen.getByText('Clear Search');
      expect(clearButton).toBeInTheDocument();
    });

    it('should call onClearSearch when clear button is clicked in results state', () => {
      render(
        <SearchResults
          {...defaultProps}
          searchQuery="test"
          searchResults={[mockEmail]}
        />,
      );

      const clearButton = screen.getByText('Clear Search');
      fireEvent.click(clearButton);

      expect(mockOnClearSearch).toHaveBeenCalledTimes(1);
    });

    it('should display correct filter context in search results header', () => {
      render(
        <SearchResults
          {...defaultProps}
          searchQuery="test"
          searchResults={[mockEmail]}
          activeFilter="my-week"
        />,
      );

      expect(
        screen.getByText(/Search Results for "test" in emails from the last 7 days \(1 found\)/),
      ).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render nothing when no searchQuery and no results', () => {
      const { container } = render(
        <SearchResults
          {...defaultProps}
          searchQuery=""
          searchResults={[]}
        />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render search results when searchQuery is empty but results exist', () => {
      const { container } = render(
        <SearchResults
          {...defaultProps}
          searchQuery=""
          searchResults={[mockEmail]}
        />,
      );

      // Component shows results even with empty query if results exist
      expect(container.firstChild).not.toBeNull();
      expect(screen.getByText(/Search Results for "" in emails from the last 30 days \(1 found\)/)).toBeInTheDocument();
    });
  });

  describe('Filter Context', () => {
    it('should use default activeFilter when not provided', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { activeFilter, ...propsWithoutFilter } = defaultProps;
      render(
        <SearchResults
          {...propsWithoutFilter}
          searchQuery="test"
          searchResults={[]}
        />,
      );

      expect(screen.getByText(/No emails found for "test" in emails from the last 30 days/)).toBeInTheDocument();
    });

    it('should handle all filter types correctly', () => {
      const filters: ViewType[] = ['my-day', 'my-week', 'my-month'];
      const expectedTexts = ['emails from today', 'emails from the last 7 days', 'emails from the last 30 days'];

      filters.forEach((filter, index) => {
        const { unmount } = render(
          <SearchResults
            {...defaultProps}
            searchQuery="test"
            searchResults={[]}
            activeFilter={filter}
          />,
        );

        expect(
          screen.getByText(new RegExp(`No emails found for "test" in ${expectedTexts[index]}`)),
        ).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(
        <SearchResults
          {...defaultProps}
          searchQuery="test"
          searchResults={[mockEmail]}
        />,
      );

      const heading = screen.getByRole('heading', { level: 3, name: /Search Results for "test"/ });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/Search Results for "test"/);
    });

    it('should have accessible clear button', () => {
      render(
        <SearchResults
          {...defaultProps}
          searchQuery="test"
          searchResults={[]}
        />,
      );

      const clearButton = screen.getByRole('button', { name: 'Clear Search' });
      expect(clearButton).toBeInTheDocument();
    });

    it('should provide clear error messaging', () => {
      render(
        <SearchResults
          {...defaultProps}
          searchError="Connection timeout"
          searchQuery="test"
        />,
      );

      const errorText = screen.getByText(/Error searching for "test": Connection timeout/);
      expect(errorText).toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    it('should handle undefined activeFilter gracefully', () => {
      render(
        <SearchResults
          searchResults={[]}
          searchQuery="test"
          isSearching={false}
          searchError={null}
          onClearSearch={mockOnClearSearch}
        />,
      );

      expect(screen.getByText(/No emails found for "test" in emails from the last 30 days/)).toBeInTheDocument();
    });

    it('should handle empty searchQuery correctly', () => {
      const { container } = render(
        <SearchResults
          {...defaultProps}
          searchQuery=""
        />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('should prioritize loading state over error state', () => {
      render(
        <SearchResults
          {...defaultProps}
          isSearching={true}
          searchError="Some error"
          searchQuery="test"
        />,
      );

      // Component checks isSearching first, so loading takes precedence
      expect(screen.getByText('Searching for "test"...')).toBeInTheDocument();
      expect(screen.getByText('Loading search results...')).toBeInTheDocument();
      expect(screen.queryByText('Search Error')).not.toBeInTheDocument();
    });

    it('should prioritize error state over results', () => {
      render(
        <SearchResults
          {...defaultProps}
          searchError="Some error"
          searchResults={[mockEmail]}
          searchQuery="test"
        />,
      );

      // Should show error, not results
      expect(screen.getByText('Search Error')).toBeInTheDocument();
      expect(screen.queryByTestId('email-item-1')).not.toBeInTheDocument();
    });
  });
});
