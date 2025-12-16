import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, X, Trash2 } from 'lucide-react';
import './SearchHistoryDropdown.css';
const SearchHistoryDropdown = ({ onSelectSearch, onClose }) => {
  const { getSearchHistory, clearSearchHistory, deleteSearchHistoryItem, isAuthenticated } = useAuth();
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadSearchHistory();
  }, []);
  const loadSearchHistory = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const history = await getSearchHistory();
      setSearchHistory(history.slice(0, 10));
    } catch (error) {
      console.error('Failed to load search history:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleClearAll = async () => {
    if (window.confirm('Clear all search history?')) {
      const result = await clearSearchHistory();
      if (result.success) {
        setSearchHistory([]);
      }
    }
  };
  const handleDeleteItem = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const result = await deleteSearchHistoryItem(id);
      if (result.success && result.searchHistory) {
        setSearchHistory(result.searchHistory.slice(0, 10));
      } else {
        setSearchHistory(prev => prev.filter(search => search._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete search:', error);
      setSearchHistory(prev => prev.filter(search => search._id !== id));
    }
  };
  const handleSelectSearch = (query) => {
    onSelectSearch(query);
    onClose();
  };
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes === 0 ? 'Just now' : `${minutes}m ago`;
    }
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
    return date.toLocaleDateString();
  };
  if (!isAuthenticated) {
    return (
      <div className="search-history-dropdown">
        <div className="search-history-empty">
          <p>Login to see your search history</p>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="search-history-dropdown">
        <div className="search-history-loading">Loading...</div>
      </div>
    );
  }
  if (searchHistory.length === 0) {
    return (
      <div className="search-history-dropdown">
        <div className="search-history-empty">
          <Clock size={32} />
          <p>No search history yet</p>
          <span>Your searches will appear here</span>
        </div>
      </div>
    );
  }
  return (
    <div className="search-history-dropdown">
      <div className="search-history-header">
        <h3>
          <Clock size={18} />
          Recent Searches
        </h3>
        <button className="clear-all-btn" onClick={handleClearAll}>
          <Trash2 size={16} />
          Clear All
        </button>
      </div>
      <div className="search-history-list">
        {searchHistory.map((search) => (
          <div
            key={search._id}
            className="search-history-item"
            onClick={() => handleSelectSearch(search.query)}
          >
            <div className="search-item-content">
              <div className="search-query">{search.query}</div>
              <div className="search-meta">
                <span className="search-time">{formatTimestamp(search.timestamp)}</span>
                {search.resultCount > 0 && (
                  <span className="search-results">{search.resultCount} results</span>
                )}
              </div>
            </div>
            <button
              className="delete-search-btn"
              onClick={(e) => handleDeleteItem(e, search._id)}
              title="Remove from history"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default SearchHistoryDropdown;
