import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';
import SearchHistoryDropdown from './SearchHistoryDropdown';
import { useAuth } from '../context/AuthContext';
const SearchBar = ({ onSearch, onSurprise, isLoading }) => {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const searchBarRef = useRef(null);
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowHistory(false);
    }
  };
  const handleSelectSearch = (searchQuery) => {
    setQuery(searchQuery);
    onSearch(searchQuery);
  };
  const handleFocus = () => {
    if (isAuthenticated) {
      setShowHistory(true);
    }
  };
  const placeholders = [
    "something cheesy but cheap",
    "comfort food after a rough day",
    "romantic dinner spot",
    "quick lunch under 200 rupees",
    "best biryani in town"
  ];
  return (
    <div className="w-full max-w-4xl mx-auto mb-8" ref={searchBarRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            placeholder={placeholders[Math.floor(Math.random() * placeholders.length)]}
            className="w-full px-6 py-5 pr-32 text-lg rounded-2xl border-2 border-orange-200 focus:border-orange-500 focus:outline-none shadow-lg transition-all duration-300"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Search size={20} />
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {showHistory && (
          <SearchHistoryDropdown
            onSelectSearch={handleSelectSearch}
            onClose={() => setShowHistory(false)}
          />
        )}
      </form>
      <div className="flex justify-center mt-4">
        <button
          onClick={onSurprise}
          disabled={isLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          <Sparkles size={20} />
          Surprise Me!
        </button>
      </div>
    </div>
  );
};
export default SearchBar;