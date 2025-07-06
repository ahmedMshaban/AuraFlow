import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import { Input, IconButton } from '@chakra-ui/react';
import type { ViewType } from '@/shared/hooks/useFilters';

import styles from '../../home/infrastructure/styles/home.module.css';
import { getFilterDisplayName } from '../../home/infrastructure/helpers/getFilterDisplayNames';

interface EmailSearchProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  isLoading?: boolean;
  placeholder?: string;
  activeFilter?: ViewType;
}

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
            colorScheme="blue"
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
