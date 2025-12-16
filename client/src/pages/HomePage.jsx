import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import RestaurantCard from '../components/RestaurantCard';
import RestaurantDetailModal from '../components/RestaurantDetailModal';
import LoadingSpinner from '../components/LoadingSpinner';
import AIRecommendation from '../components/AIRecommendation';
import MealTimeFilter from '../components/MealTimeFilter';
import VibeFilter from '../components/VibeFilter';
import AllergyFilter from '../components/AllergyFilter';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import PreferencesModal from '../components/PreferencesModal';
import UserMenu from '../components/UserMenu';
import FavoritesPage from '../components/FavoritesPage';
import UserProfilePage from '../components/UserProfilePage';
import UserReviewsPage from '../components/UserReviewsPage';
import { searchRestaurants, surpriseMe, getRestaurantsByCurrentTime, getAllRestaurants, searchWithAllergyFilters } from '../services/api';
import { Utensils, MapPin } from 'lucide-react';
function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [currentMealTime, setCurrentMealTime] = useState(null);
  const [activeMealFilter, setActiveMealFilter] = useState(null);
  const [activeVibeFilter, setActiveVibeFilter] = useState(null);
  const [activeAllergyFilters, setActiveAllergyFilters] = useState([]);
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const { logout, addSearchHistory } = useAuth();
  useEffect(() => {
    const handleAuthLogout = () => {
      logout();
      setIsLoginOpen(true);
    };
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, [logout]);
  const handleSearch = async (query) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setActiveMealFilter(null);
    setActiveVibeFilter(null);
    setLastSearchQuery(query);
    try {
      let data;
      if (activeAllergyFilters.length > 0) {
        data = await searchWithAllergyFilters(query, activeAllergyFilters);
      } else {
        data = await searchRestaurants(query);
      }
      setResults(data);
      setCurrentMealTime(data.currentMealTime);
      setWeather(data.weather);
      const resultCount = data.restaurants?.length || data.count || 0;
      await addSearchHistory(query, resultCount);
    } catch (err) {
      setError('Failed to search restaurants. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleSurprise = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setActiveMealFilter(null);
    setActiveVibeFilter(null);
    try {
      const data = await surpriseMe();
      setResults({
        surprise: true,
        ...data
      });
      setCurrentMealTime(data.currentMealTime);
    } catch (err) {
      setError('Failed to get surprise. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleFilterByTime = async (mealTime) => {
    setLoading(true);
    setError(null);
    setActiveMealFilter(mealTime);
    try {
      const data = await getAllRestaurants({ mealTime });
      setResults({
        restaurants: data.data,
        count: data.count,
        filteredByTime: mealTime
      });
      setCurrentMealTime(data.currentMealTime);
    } catch (err) {
      setError('Failed to filter restaurants. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleClearFilter = async () => {
    setActiveMealFilter(null);
    setActiveVibeFilter(null);
    setResults(null);
  };
  const handleFilterByVibe = async (vibe) => {
    setLoading(true);
    setError(null);
    setActiveVibeFilter(vibe);
    try {
      const data = await getAllRestaurants({ vibe });
      setResults({
        restaurants: data.data,
        count: data.count,
        filteredByVibe: vibe
      });
      setCurrentMealTime(data.currentMealTime);
    } catch (err) {
      setError('Failed to filter restaurants. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleClearVibeFilter = async () => {
    setActiveVibeFilter(null);
    setResults(null);
  };
  const handleShowCurrentTime = async () => {
    setLoading(true);
    setError(null);
    setActiveMealFilter(null);
    setActiveVibeFilter(null);
    try {
      const data = await getRestaurantsByCurrentTime();
      setResults({
        restaurants: data.data,
        count: data.count,
        currentTimeResults: true
      });
      setCurrentMealTime(data.currentMealTime);
    } catch (err) {
      setError('Failed to get restaurants. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };
  const closeModal = () => {
    setSelectedRestaurant(null);
  };
  const handleApplyAllergyFilters = async (filters) => {
    setActiveAllergyFilters(filters);
    if (filters.length === 0) {
      if (lastSearchQuery) {
        handleSearch(lastSearchQuery);
      }
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await searchWithAllergyFilters(lastSearchQuery, filters);
      setResults(data);
      setCurrentMealTime(data.currentMealTime);
      setWeather(data.weather);
    } catch (err) {
      setError('Failed to apply allergy filters. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8 shadow-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Utensils size={40} />
              <div>
                <h1 className="text-4xl font-bold">SmartDine</h1>
                <p className="text-orange-100">AI-Powered Food Discovery</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/map')}
                className="flex items-center gap-2 bg-white text-orange-500 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors shadow-md"
              >
                <MapPin size={20} />
                <span>Map View</span>
              </button>
              <UserMenu 
                onOpenLogin={() => setIsLoginOpen(true)}
                onOpenRegister={() => setIsRegisterOpen(true)}
                onOpenPreferences={() => setIsPreferencesOpen(true)}
                onOpenFavorites={() => setIsFavoritesOpen(true)}
                onOpenProfile={() => setIsProfileOpen(true)}
                onOpenReviews={() => setIsReviewsOpen(true)}
              />
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-12">
        <SearchBar 
          onSearch={handleSearch}
          onSurprise={handleSurprise}
          isLoading={loading}
        />
        {currentMealTime && (
          <MealTimeFilter
            currentMealTime={currentMealTime}
            onFilterByTime={handleFilterByTime}
            onClearFilter={handleClearFilter}
            activeFilter={activeMealFilter}
          />
        )}
        <VibeFilter
          onFilterByVibe={handleFilterByVibe}
          onClearFilter={handleClearVibeFilter}
          activeFilter={activeVibeFilter}
        />
        <AllergyFilter
          onApplyFilters={handleApplyAllergyFilters}
          initialFilters={activeAllergyFilters}
        />
        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-xl mb-8">
            <p className="font-semibold">{error}</p>
          </div>
        )}
        {loading && <LoadingSpinner />}
        {results && !loading && (
          <div>
            {results.greeting && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6 text-center">
                <p className="text-xl font-semibold text-gray-800">
                  {results.greeting}
                </p>
              </div>
            )}
            {weather && (
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 mb-6 border-2 border-cyan-200 shadow-lg">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <span className="text-5xl">{weather.emoji}</span>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {weather.description}
                    </h3>
                    <p className="text-lg text-gray-600 font-semibold">
                      {weather.temperature}°C
                    </p>
                  </div>
                </div>
                <div className="bg-white bg-opacity-70 rounded-xl p-4 text-center">
                  <p className="text-gray-700 font-medium text-lg">
                    💡 {weather.suggestions?.description}
                  </p>
                </div>
                {weather.isMockData && (
                  <p className="text-center text-xs text-gray-500 mt-2">
                    Using demo weather data
                  </p>
                )}
              </div>
            )}
            {results.filteredByTime && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                <p className="text-center text-green-800 font-semibold">
                  ⏰ Showing restaurants perfect for {results.filteredByTime}
                </p>
              </div>
            )}
            {results.filteredByVibe && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
                <p className="text-center text-purple-800 font-semibold">
                  ✨ Showing restaurants with {results.filteredByVibe.replace('-', ' ')} vibe
                </p>
              </div>
            )}
            {results.currentTimeResults && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-center text-blue-800 font-semibold">
                  🕐 Perfect restaurants for right now ({currentMealTime})
                </p>
              </div>
            )}
            {activeAllergyFilters.length > 0 && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                <div className="text-center">
                  <p className="text-green-800 font-bold text-lg mb-2">
                    ✓ Allergy Filters Active
                  </p>
                  <p className="text-green-700">
                    Showing {results?.count || 0} restaurants safe for people avoiding:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {activeAllergyFilters.map((filter, idx) => (
                      <span key={idx} className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {filter}
                      </span>
                    ))}
                  </div>
                  {results?.excludedIngredients && (
                    <p className="text-green-600 text-sm mt-2">
                      {results.totalFiltered && `Filtered from ${results.totalFiltered} total restaurants`}
                    </p>
                  )}
                </div>
              </div>
            )}
            {results.surprise ? (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border-2 border-purple-200 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    🎉 Your Surprise Pick!
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {results.data.pitch}
                  </p>
                </div>
                <div className="grid grid-cols-1 max-w-2xl mx-auto">
                  <RestaurantCard 
                    restaurant={results.data.restaurant}
                    onClick={handleRestaurantClick}
                    currentMealTime={currentMealTime}
                    weather={weather}
                    showAllergyInfo={activeAllergyFilters.length > 0}
                    onLoginRequired={() => setIsLoginOpen(true)}
                  />
                </div>
              </div>
            ) : (
              <>
                {results.aiRecommendation && (
                  <AIRecommendation 
                    recommendation={results.aiRecommendation}
                    usingFallback={results.usingFallback}
                  />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.restaurants?.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant._id}
                      restaurant={restaurant}
                      onClick={handleRestaurantClick}
                      currentMealTime={currentMealTime}
                      weather={weather}
                      showAllergyInfo={activeAllergyFilters.length > 0}
                      onLoginRequired={() => setIsLoginOpen(true)}
                    />
                  ))}
                </div>
                {results.restaurants?.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-xl">
                      No restaurants found. Try a different search or filter!
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {!results && !loading && !error && (
          <div className="text-center py-12">
            <div className="text-8xl mb-6">🍽️</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              What are you craving today?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
              Tell me what you're in the mood for, and I'll find the perfect restaurant for you.
              Try searching by mood, cuisine, budget, or occasion!
            </p>
            <button
              onClick={handleShowCurrentTime}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 mb-8"
            >
              🕐 Show Perfect Restaurants for Now
            </button>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {['comfort food', 'spicy biryani', 'romantic dinner', 'quick lunch'].map((example) => (
                <button
                  key={example}
                  onClick={() => handleSearch(example)}
                  className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full hover:bg-orange-200 transition-colors duration-200"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
      <RestaurantDetailModal
        isOpen={!!selectedRestaurant}
        onClose={closeModal}
        restaurant={selectedRestaurant}
        onLoginRequired={() => setIsLoginOpen(true)}
      />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />
      {isFavoritesOpen && (
        <FavoritesPage
          onRestaurantClick={handleRestaurantClick}
          onClose={() => setIsFavoritesOpen(false)}
        />
      )}
      {isProfileOpen && (
        <UserProfilePage
          onClose={() => setIsProfileOpen(false)}
        />
      )}
      {isReviewsOpen && (
        <UserReviewsPage
          onClose={() => setIsReviewsOpen(false)}
          onRestaurantClick={handleRestaurantClick}
        />
      )}
      <PreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />
    </div>
  );
}
export default HomePage;
