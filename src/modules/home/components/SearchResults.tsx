import { Box } from '@chakra-ui/react';
import type { GmailMessageWithStress } from '@/shared/types/gmail.types';
import EmailItem from './emails/EmailItem';
import styles from '../infrastructure/styles/home.module.css';

interface SearchResultsProps {
  searchResults: GmailMessageWithStress[];
  searchQuery: string;
  isSearching: boolean;
  searchError: string | null;
  onClearSearch: () => void;
}

const SearchResults = ({ searchResults, searchQuery, isSearching, searchError, onClearSearch }: SearchResultsProps) => {
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
          <p>No emails found for "{searchQuery}". Try a different search term.</p>
        </div>
      </div>
    );
  }

  if (searchResults.length > 0) {
    return (
      <div className={styles.searchResultsContainer}>
        <div className={styles.searchResultsHeader}>
          <h3>
            Search Results for "{searchQuery}" ({searchResults.length} found)
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
