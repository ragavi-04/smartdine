import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import RestaurantCard from './RestaurantCard';
import LoadingSpinner from './LoadingSpinner';
import './FavoritesPage.css';
const FavoritesPage = ({ onRestaurantClick, onClose }) => {
  const { getFavorites, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    loadFavorites();
  }, []);
  const loadFavorites = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getFavorites();
      if (result.success) {
        setFavorites(result.favorites || []);
      } else {
        setError(result.message || 'Failed to load favorites');
      }
    } catch (err) {
      setError('Failed to load favorites');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleRemoveFavorite = () => {
    loadFavorites();
  };
  if (!isAuthenticated) {
    return (
      <div className="favorites-page-overlay" onClick={onClose}>
        <div className="favorites-page" onClick={(e) => e.stopPropagation()}>
          <div className="favorites-header">
            <h2>My Favorites</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="favorites-empty">
            <span className="empty-icon">🔒</span>
            <h3>Login Required</h3>
            <p>Please login to view your favorite restaurants</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="favorites-page-overlay" onClick={onClose}>
      <div className="favorites-page" onClick={(e) => e.stopPropagation()}>
        <div className="favorites-header">
          <h2>
            My Favorites
            {favorites.length > 0 && (
              <span className="favorites-count">{favorites.length}</span>
            )}
          </h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        {loading && (
          <div className="favorites-loading">
            <LoadingSpinner />
          </div>
        )}
        {error && !loading && (
          <div className="favorites-error">
            <p>{error}</p>
            <button onClick={loadFavorites} className="retry-button">
              Try Again
            </button>
          </div>
        )}
        {!loading && !error && favorites.length === 0 && (
          <div className="favorites-empty">
            <span className="empty-icon">❤️</span>
            <h3>No Favorites Yet</h3>
            <p>Start exploring and save your favorite restaurants!</p>
            <button onClick={onClose} className="explore-button">
              Explore Restaurants
            </button>
          </div>
        )}
        {!loading && !error && favorites.length > 0 && (
          <div className="favorites-grid">
            {favorites.map((restaurant) => (
              <div key={restaurant._id} className="favorite-item">
                <RestaurantCard
                  restaurant={restaurant}
                  onClick={onRestaurantClick}
                  onFavoriteChange={handleRemoveFavorite}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default FavoritesPage;
