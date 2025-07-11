import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import { Input, IconButton } from '@chakra-ui/react';
import type { ViewType } from '@/shared/hooks/useFilters';

import styles from '../../home/infrastructure/styles/home.module.css';
import { getFilterDisplayName } from '../../home/infrastructure/helpers/getFilterDisplayNames';

/**
 * Props for the EmailSearch component.
 */
interface EmailSearchProps {
  /** Callback function triggered when a search is performed */
  onSearch: (query: string) => void;
  /** Callback function triggered when search is cleared */
  onClear: () => void;
  /** Whether the search operation is currently in progress */
  isLoading?: boolean;
  /** Placeholder text for the search input field */
  placeholder?: string;
  /** Current active filter that affects search scope */
  activeFilter?: ViewType;
}

/**
 * A comprehensive email search component with filter integration and real-time feedback.
 * Provides users with the ability to search through emails within specific time-based filters,
 * featuring automatic re-search on filter changes and intuitive search controls.
 *
 * Features:
 * - Real-time search input with validation
 * - Automatic re-search when filter context changes
 * - Clear search functionality with visual feedback
 * - Loading state management and disabled states
 * - Filter context display for user awareness
 * - Keyboard shortcuts (Enter to search)
 * - Accessible button controls with ARIA labels
 *
 * Search Behavior:
 * - Searches are triggered on Enter key or search button click
 * - Automatically re-searches when activeFilter changes (if query exists)
 * - Trims whitespace from search queries for better results
 * - Provides visual feedback during loading states
 *
 * @param props - The component props
 * @param props.onSearch - Handler for executing search with trimmed query
 * @param props.onClear - Handler for clearing search and results
 * @param props.isLoading - Loading state that disables inputs and shows feedback
 * @param props.placeholder - Custom placeholder text for search input
 * @param props.activeFilter - Current filter affecting search scope
 * @returns A complete email search interface
 *
 * @example
 * ```tsx
 * const [isLoading, setIsLoading] = useState(false);
 * const [currentFilter, setCurrentFilter] = useState<ViewType>('my-month');
 *
 * <EmailSearch
 *   onSearch={(query) => {
 *     setIsLoading(true);
 *     performEmailSearch(query, currentFilter)
 *       .finally(() => setIsLoading(false));
 *   }}
 *   onClear={() => clearSearchResults()}
 *   isLoading={isLoading}
 *   placeholder="Search emails by content, sender, or subject..."
 *   activeFilter={currentFilter}
 * />
 * ```
 *
 * @note The component automatically handles filter changes and re-searches when needed
 * @note Search queries are trimmed to prevent empty searches
 * @see {@link ViewType} For available filter types
 * @see {@link getFilterDisplayName} For filter display names
 */
const EmailSearch = ({
  onSearch,
  onClear,
  isLoading = false,
  placeholder = 'Search emails...',
  activeFilter = 'my-month',
}: EmailSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const previousFilterRef = useRef<ViewType>(activeFilter);

  // Re-search when filter changes and there's an active search query
  useEffect(() => {
    // Only re-search if filter actually changed and there's a search query
    if (previousFilterRef.current !== activeFilter && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
    previousFilterRef.current = activeFilter;
  }, [activeFilter, searchQuery, onSearch]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    onClear();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputContainer}>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          size="md"
          variant="outline"
          disabled={isLoading}
          className={styles.searchInput}
        />
        <div className={styles.searchButtons}>
          {searchQuery && (
            <IconButton
              onClick={handleClear}
              size="sm"
              variant="ghost"
              disabled={isLoading}
              aria-label="Clear search"
            >
              <FaTimes />
            </IconButton>
          )}
          <IconButton
            onClick={handleSearch}
            size="sm"
            variant="solid"
            colorPalette="blue"
            disabled={isLoading || !searchQuery.trim()}
            aria-label="Search emails"
          >
            <FaSearch />
          </IconButton>
        </div>
      </div>
      <div className={styles.searchFilterIndicator}>
        <FaCalendarAlt size={12} />
        <span>Searching in: {getFilterDisplayName(activeFilter)}</span>
      </div>
      {isLoading && <div className={styles.searchLoadingIndicator}>Searching emails...</div>}
    </div>
  );
};

export default EmailSearch;
