import { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { Input, IconButton } from '@chakra-ui/react';

import styles from '../infrastructure/styles/home.module.css';

interface EmailSearchProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

const EmailSearch = ({ onSearch, onClear, isLoading = false, placeholder = 'Search emails...' }: EmailSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');

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
      {isLoading && <div className={styles.searchLoadingIndicator}>Searching emails...</div>}
    </div>
  );
};

export default EmailSearch;
