import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import MapFilters from '../components/MapFilters';
import LoadingSpinner from '../components/LoadingSpinner';
import RestaurantDetailModal from '../components/RestaurantDetailModal';
import { getRestaurantsForMap, getNearbyRestaurants } from '../services/api';
import { MapPin, Navigation, List } from 'lucide-react';
const MapPage = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({});
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showNearby, setShowNearby] = useState(false);
  useEffect(() => {
    loadRestaurants();
  }, []);
  const loadRestaurants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRestaurantsForMap();
      console.log('📍 Loaded restaurants:', data.data.length);
      console.log('📍 First restaurant:', data.data[0]);
      setRestaurants(data.data);
      setFilteredRestaurants(data.data);
    } catch (err) {
      setError('Failed to load restaurants');
      console.error('❌ Error loading restaurants:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);
    setLoading(true);
    try {
      const data = await getRestaurantsForMap(newFilters);
      setFilteredRestaurants(data.data);
    } catch (err) {
      setError('Failed to filter restaurants');
    } finally {
      setLoading(false);
    }
  };
  const handleClearFilters = () => {
    setFilters({});
    setFilteredRestaurants(restaurants);
  };
  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        try {
          const data = await getNearbyRestaurants(latitude, longitude, 10); // Increased to 10km
          setFilteredRestaurants(data.data);
          setShowNearby(true);
        } catch (err) {
          setError('Failed to find nearby restaurants');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error(error);
        alert('Unable to get your location. Please enable location services.');
        setLoading(false);
      }
    );
  };
  const handleUseDemoLocation = async () => {
    setLoading(true);
    const demoLocation = { latitude: 11.0168, longitude: 76.9558 }; // Coimbatore
    setUserLocation(demoLocation);
    try {
      const data = await getNearbyRestaurants(demoLocation.latitude, demoLocation.longitude, 10);
      setFilteredRestaurants(data.data);
      setShowNearby(true);
    } catch (err) {
      setError('Failed to find nearby restaurants');
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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-6 shadow-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin size={32} />
              <div>
                <h1 className="text-3xl font-bold">Restaurant Map</h1>
                <p className="text-orange-100">Explore restaurants near you</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-white text-orange-500 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
            >
              <List size={20} />
              <span>List View</span>
            </button>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <MapFilters
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
          />
          <button
            onClick={handleFindNearby}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-lg"
          >
            <Navigation size={20} />
            <span>Find Near Me</span>
          </button>
          <button
            onClick={handleUseDemoLocation}
            disabled={loading}
            className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 shadow-lg"
          >
            <MapPin size={20} />
            <span>Demo Location (Coimbatore)</span>
          </button>
          {showNearby && (
            <button
              onClick={() => {
                setShowNearby(false);
                setUserLocation(null);
                loadRestaurants();
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Show All
            </button>
          )}
        </div>
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
            <p className="font-semibold">{error}</p>
          </div>
        )}
        {/* Map */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '70vh' }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            <MapView
              restaurants={filteredRestaurants}
              onRestaurantClick={handleRestaurantClick}
              userLocation={userLocation}
              filters={filters}
            />
          )}
        </div>
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-lg mb-2">📍 Total Restaurants</h3>
            <p className="text-3xl font-bold text-orange-500">{filteredRestaurants.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-lg mb-2">🎯 Active Filters</h3>
            <p className="text-3xl font-bold text-blue-500">
              {Object.keys(filters).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-lg mb-2">⭐ Average Rating</h3>
            <p className="text-3xl font-bold text-yellow-500">
              {filteredRestaurants.length > 0
                ? (
                    filteredRestaurants.reduce((sum, r) => sum + r.rating, 0) /
                    filteredRestaurants.length
                  ).toFixed(1)
                : '0'}
            </p>
          </div>
      {/* Restaurant Detail Modal */}
      <RestaurantDetailModal
        isOpen={!!selectedRestaurant}
        onClose={closeModal}
        restaurant={selectedRestaurant}
      />
        </div>
      </main>
    </div>
  );
};
export default MapPage;
