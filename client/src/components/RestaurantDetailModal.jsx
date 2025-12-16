import React, { useState, useEffect } from 'react';
import { X, MapPin, Star, Clock, Phone, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ReviewButton from './ReviewButton';
import ReviewModal from './ReviewModal';
import ReviewsList from './ReviewsList';
import FavoriteButton from './FavoriteButton';
import api from '../services/api';
import './RestaurantDetailModal.css';
const RestaurantDetailModal = ({ isOpen, onClose, restaurant, onLoginRequired }) => {
  const { user } = useAuth();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0);
  useEffect(() => {
    if (isOpen && user && restaurant) {
      checkUserReview();
    }
  }, [isOpen, user, restaurant]);
  const checkUserReview = async () => {
    try {
      const response = await api.get('/reviews/user');
      const existingReview = response.data.reviews.find(
        r => r.restaurantId === restaurant._id
      );
      setUserReview(existingReview || null);
    } catch (err) {
      console.error('Check user review error:', err);
    }
  };
  const handleReviewSubmitted = () => {
    setShowReviewModal(false);
    checkUserReview();
    setReviewsRefreshTrigger(prev => prev + 1);
  };
  const handleEditReview = (review) => {
    setUserReview(review);
    setShowReviewModal(true);
  };
  if (!isOpen || !restaurant) return null;
  return (
    <>
      <div className="restaurant-detail-overlay" onClick={onClose}>
        <div className="restaurant-detail-content" onClick={(e) => e.stopPropagation()}>
          <button className="restaurant-detail-close" onClick={onClose}>
            <X size={24} />
          </button>
          {/* Header Image */}
          <div className="restaurant-detail-header">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="restaurant-detail-image"
            />
            <div className="restaurant-detail-overlay-info">
              <div className="restaurant-rating-badge">
                <Star fill="#FFD700" stroke="#FFD700" size={20} />
                <span>{restaurant.rating}</span>
              </div>
              <div className="restaurant-favorite-badge">
                <FavoriteButton
                  restaurantId={restaurant._id}
                  onLoginRequired={onLoginRequired}
                  size="large"
                />
              </div>
            </div>
          </div>
          {/* Content */}
          <div className="restaurant-detail-body">
            <h2 className="restaurant-detail-title">{restaurant.name}</h2>
            {/* Cuisines */}
            <div className="restaurant-cuisines">
              {restaurant.cuisine.map((c, idx) => (
                <span key={idx} className="cuisine-badge">
                  {c}
                </span>
              ))}
            </div>
            {/* Price Range */}
            <div className="restaurant-price">
              <span className="price-label">Price:</span>
              <span className="price-value">{restaurant.priceRange}</span>
            </div>
            {/* Description */}
            <p className="restaurant-description">{restaurant.description}</p>
            {/* Info Grid */}
            <div className="restaurant-info-grid">
              <div className="info-item">
                <MapPin size={18} />
                <div>
                  <span className="info-label">Location</span>
                  <span className="info-value">{restaurant.location}</span>
                </div>
              </div>
              <div className="info-item">
                <Clock size={18} />
                <div>
                  <span className="info-label">Hours</span>
                  <span className="info-value">{restaurant.openingHours}</span>
                </div>
              </div>
              {restaurant.phone && (
                <div className="info-item">
                  <Phone size={18} />
                  <div>
                    <span className="info-label">Phone</span>
                    <span className="info-value">{restaurant.phone}</span>
                  </div>
                </div>
              )}
              {restaurant.website && (
                <div className="info-item">
                  <Globe size={18} />
                  <div>
                    <span className="info-label">Website</span>
                    <a
                      href={restaurant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="info-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Visit Website
                    </a>
                  </div>
                </div>
              )}
            </div>
            {/* Specialty Dishes */}
            {restaurant.specialtyDishes && restaurant.specialtyDishes.length > 0 && (
              <div className="restaurant-section">
                <h3 className="section-title">Must Try Dishes</h3>
                <div className="specialty-dishes">
                  {restaurant.specialtyDishes.map((dish, idx) => (
                    <span key={idx} className="specialty-dish">
                      {dish}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Meal Times */}
            {restaurant.mealTimes && restaurant.mealTimes.length > 0 && (
              <div className="restaurant-section">
                <h3 className="section-title">Available For</h3>
                <div className="meal-times">
                  {restaurant.mealTimes.map((time, idx) => (
                    <span key={idx} className="meal-time-badge">
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Review Button */}
            <div className="review-button-container">
              <ReviewButton
                restaurantId={restaurant._id}
                restaurantName={restaurant.name}
                hasReviewed={!!userReview}
                onReviewSubmit={() => setShowReviewModal(true)}
              />
            </div>
            {/* Reviews List */}
            <ReviewsList
              restaurantId={restaurant._id}
              onEditReview={handleEditReview}
              refreshTrigger={reviewsRefreshTrigger}
            />
          </div>
        </div>
      </div>
      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          restaurantId={restaurant._id}
          restaurantName={restaurant.name}
          existingReview={userReview}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </>
  );
};
export default RestaurantDetailModal;
