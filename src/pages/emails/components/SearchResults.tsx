import { Box } from '@chakra-ui/react';
import type { GmailMessageWithStress } from '@/shared/types/gmail.types';
import type { ViewType } from '@/shared/hooks/useFilters';
import EmailItem from '../../home/components/emails/EmailItem';
import styles from '../../home/infrastructure/styles/home.module.css';
import { getFilterSearchDescription } from '../../home/infrastructure/helpers/getFilterDisplayNames';

/**
 * Props for the SearchResults component.
 */
interface SearchResultsProps {
  /** Array of email search results with stress analysis data */
  searchResults: GmailMessageWithStress[];
  /** The search query that was executed */
  searchQuery: string;
  /** Whether a search operation is currently in progress */
  isSearching: boolean;
  /** Error message if search operation failed */
  searchError: string | null;
  /** Callback function to clear the current search */
  onClearSearch: () => void;
  /** Current active filter affecting search scope */
  activeFilter?: ViewType;
}

/**
 * A comprehensive search results display component for email search functionality.
 * Handles all states of email search including loading, error, empty results, and
 * successful results with contextual messaging and clear user feedback.
 *
 * Display States:
 * - Loading: Shows spinner and search progress indicator
 * - Error: Displays error message with option to clear search
 * - No Results: Shows helpful message with search context and suggestions
 * - Results Found: Lists all matching emails with count and filter context
 * - No Search: Returns null when no search is active
 *
 * Features:
 * - Contextual headers showing search query and filter scope
 * - Result count display for successful searches
 * - Clear search functionality in all relevant states
 * - Error handling with user-friendly messages
 * - Integration with email stress analysis data
 * - Responsive layout for various screen sizes
 *
 * @param props - The component props
 * @param props.searchResults - Email results from search operation
 * @param props.searchQuery - User's search query for display
 * @param props.isSearching - Loading state for search operation
 * @param props.searchError - Error message if search failed
 * @param props.onClearSearch - Handler to reset search state
 * @param props.activeFilter - Current filter affecting search scope
 * @returns Search results interface or null if no active search
 *
 * @example
 * ```tsx
 * const [searchState, setSearchState] = useState({
 *   results: [],
 *   query: '',
 *   isSearching: false,
 *   error: null
 * });
 *
 * <SearchResults
 *   searchResults={searchState.results}
 *   searchQuery={searchState.query}
 *   isSearching={searchState.isSearching}
 *   searchError={searchState.error}
 *   onClearSearch={() => setSearchState(initialState)}
 *   activeFilter="my-month"
 * />
 * ```
 *
 * @note Component returns null when no search is active (query is empty)
 * @note Each email result includes stress analysis data for additional insights
 * @see {@link GmailMessageWithStress} For email data structure
 * @see {@link EmailItem} For individual email display component
 * @see {@link getFilterSearchDescription} For filter context descriptions
 */
const SearchResults = ({
  searchResults,
  searchQuery,
  isSearching,
  searchError,
  onClearSearch,
  activeFilter = 'my-month',
}: SearchResultsProps) => {
  if (isSearching) {
    return (
      <div className={styles.searchResultsContainer}>
        <div className={styles.searchResultsHeader}>
          <h3>Searching for "{searchQuery}"...</h3>
        </div>
        <div className={styles.loadingSpinner}>
          <span>Loading search results...</span>
        </div>
      </div>
    );
  }

  if (searchError) {
    return (
      <div className={styles.searchResultsContainer}>
        <div className={styles.searchResultsHeader}>
          <h3>Search Error</h3>
          <button
            onClick={onClearSearch}
            className={styles.clearSearchButton}
          >
            Clear Search
          </button>
        </div>
        <div className={styles.errorMessage}>
          <p>
            Error searching for "{searchQuery}": {searchError}
          </p>
        </div>
      </div>
    );
  }

  if (searchQuery && searchResults.length === 0) {
    return (
      <div className={styles.searchResultsContainer}>
        <div className={styles.searchResultsHeader}>
          <h3>No Results Found</h3>
          <button
            onClick={onClearSearch}
            className={styles.clearSearchButton}
          >
            Clear Search
          </button>
        </div>
        <div className={styles.noResultsMessage}>
          <p>
            No emails found for "{searchQuery}" in {getFilterSearchDescription(activeFilter)}. Try a different search
            term or change the time filter.
          </p>
        </div>
      </div>
    );
  }

  if (searchResults.length > 0) {
    return (
      <div className={styles.searchResultsContainer}>
        <div className={styles.searchResultsHeader}>
          <h3>
            Search Results for "{searchQuery}" in {getFilterSearchDescription(activeFilter)} ({searchResults.length}{' '}
            found)
          </h3>
          <button
            onClick={onClearSearch}
            className={styles.clearSearchButton}
          >
            Clear Search
          </button>
        </div>
        <div className={styles.searchResultsList}>
          {searchResults.map((email) => (
            <Box
              key={email.id}
              className={styles.searchResultItem}
            >
              <EmailItem email={email} />
            </Box>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default SearchResults;
