import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './FavoriteButton.css';
const FavoriteButton = ({ restaurantId, onLoginRequired, size = 'medium', showTooltip = true }) => {
  const { isAuthenticated, isFavorite, addFavorite, removeFavorite } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginTooltip, setShowLoginTooltip] = useState(false);
  const favorited = isFavorite(restaurantId);
  const handleClick = async (e) => {
    e.stopPropagation(); // Prevent card click
    if (!isAuthenticated) {
      if (onLoginRequired) {
        onLoginRequired();
      } else {
        setShowLoginTooltip(true);
        setTimeout(() => setShowLoginTooltip(false), 2000);
      }
      return;
    }
    setIsLoading(true);
    try {
      if (favorited) {
        await removeFavorite(restaurantId);
      } else {
        await addFavorite(restaurantId);
      }
    } catch (error) {
      console.error('Favorite toggle error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const sizeClasses = {
    small: 'favorite-btn-small',
    medium: 'favorite-btn-medium',
    large: 'favorite-btn-large'
  };
  return (
    <div className="favorite-button-wrapper">
      <button
        className={`favorite-button ${sizeClasses[size]} ${favorited ? 'favorited' : ''} ${isLoading ? 'loading' : ''}`}
        onClick={handleClick}
        disabled={isLoading}
        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        title={!isAuthenticated ? 'Login to favorite' : (favorited ? 'Remove from favorites' : 'Add to favorites')}
      >
        <span className="heart-icon">
          {favorited ? '❤️' : '🤍'}
        </span>
      </button>
      {!isAuthenticated && showTooltip && showLoginTooltip && (
        <div className="login-tooltip">
          Login to favorite
        </div>
      )}
    </div>
  );
};
export default FavoriteButton;
