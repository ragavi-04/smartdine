import { useState } from 'react';
import { Filter, X } from 'lucide-react';
const MapFilters = ({ onFilterChange, onClear }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    cuisine: '',
    priceRange: '',
    mealTime: '',
    minRating: ''
  });
  const cuisines = [
    'All', 'Italian', 'Indian', 'Chinese', 'Mexican', 'Japanese',
    'American', 'Thai', 'Korean', 'Continental'
  ];
  const priceRanges = ['All', '₹', '₹₹', '₹₹₹'];
  const mealTimes = ['All', 'breakfast', 'lunch', 'snacks', 'dinner', 'late-night'];
  const ratings = ['All', '4+', '4.5+'];
  const handleFilterChange = (key, value) => {
    const newValue = value === 'All' ? '' : value;
    const newFilters = { ...filters, [key]: newValue };
    setFilters(newFilters);
    const cleanFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([_, v]) => v !== '')
    );
    onFilterChange(cleanFilters);
  };
  const handleClearFilters = () => {
    setFilters({
      cuisine: '',
      priceRange: '',
      mealTime: '',
      minRating: ''
    });
    onClear();
  };
  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;
  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
      >
        <Filter size={20} className="text-orange-500" />
        <span className="font-semibold">Filters</span>
        {activeFilterCount > 0 && (
          <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>
      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute top-12 left-0 bg-white rounded-lg shadow-2xl p-4 w-80 z-[1000]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Filter Restaurants</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          {/* Cuisine Filter */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Cuisine</label>
            <select
              value={filters.cuisine}
              onChange={(e) => handleFilterChange('cuisine', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            >
              {cuisines.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
          </div>
          {/* Price Range Filter */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Price Range</label>
            <div className="flex gap-2">
              {priceRanges.map((price) => (
                <button
                  key={price}
                  onClick={() => handleFilterChange('priceRange', price)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                    filters.priceRange === (price === 'All' ? '' : price)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {price}
                </button>
              ))}
            </div>
          </div>
          {/* Meal Time Filter */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Meal Time</label>
            <select
              value={filters.mealTime}
              onChange={(e) => handleFilterChange('mealTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            >
              {mealTimes.map((time) => (
                <option key={time} value={time}>
                  {time === 'All' ? 'All Times' : time.charAt(0).toUpperCase() + time.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {/* Rating Filter */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Minimum Rating</label>
            <div className="flex gap-2">
              {ratings.map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleFilterChange('minRating', rating === 'All' ? '' : rating.replace('+', ''))}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                    filters.minRating === rating.replace('+', '')
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rating === 'All' ? 'All' : `⭐ ${rating}`}
                </button>
              ))}
            </div>
          </div>
          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};
export default MapFilters;
