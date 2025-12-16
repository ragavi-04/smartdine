import React, { useState, useEffect } from 'react';
import { X, Star, Calendar, Edit3, Trash2, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ReviewModal from './ReviewModal';
import api from '../services/api';
import './UserReviewsPage.css';
const UserReviewsPage = ({ onClose, onRestaurantClick }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  useEffect(() => {
    fetchUserReviews();
  }, []);
  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reviews/user');
      setReviews(response.data.reviews);
    } catch (err) {
      setError('Failed to load your reviews');
      console.error('Fetch user reviews error:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(prev => prev.filter(r => r._id !== reviewId));
    } catch (err) {
      alert('Failed to delete review');
      console.error('Delete review error:', err);
    }
  };
  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewModal(true);
  };
  const handleReviewSubmitted = () => {
    setShowReviewModal(false);
    setEditingReview(null);
    fetchUserReviews();
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const formatTagLabel = (tag) => {
    return tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  return (
    <>
      <div className="user-reviews-overlay" onClick={onClose}>
        <div className="user-reviews-content" onClick={(e) => e.stopPropagation()}>
          <button className="user-reviews-close" onClick={onClose}>
            <X size={24} />
          </button>
          <div className="user-reviews-header">
            <h2>My Reviews</h2>
            <p className="user-reviews-subtitle">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          <div className="user-reviews-body">
            {loading ? (
              <div className="user-reviews-loading">
                <div className="spinner"></div>
                <p>Loading your reviews...</p>
              </div>
            ) : error ? (
              <div className="user-reviews-error">{error}</div>
            ) : reviews.length === 0 ? (
              <div className="user-reviews-empty">
                <Star size={64} />
                <h3>No reviews yet</h3>
                <p>Start exploring restaurants and share your experiences!</p>
              </div>
            ) : (
              <div className="user-reviews-list">
                {reviews.map((review) => (
                  <div key={review._id} className="user-review-card">
                    {/* Restaurant Info */}
                    <div 
                      className="user-review-restaurant"
                      onClick={() => onRestaurantClick?.(review.restaurantId)}
                    >
                      {review.restaurantId?.imageUrl && (
                        <img
                          src={review.restaurantId.imageUrl}
                          alt={review.restaurantId.name}
                          className="user-review-restaurant-image"
                        />
                      )}
                      <div className="user-review-restaurant-info">
                        <h3>{review.restaurantId?.name || 'Restaurant'}</h3>
                        {review.restaurantId?.location && (
                          <div className="user-review-location">
                            <MapPin size={14} />
                            <span>{review.restaurantId.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Review Content */}
                    <div className="user-review-content">
                      <div className="user-review-header">
                        <div className="user-review-stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={20}
                              fill={star <= review.rating ? '#FFD700' : 'none'}
                              stroke={star <= review.rating ? '#FFD700' : '#ddd'}
                            />
                          ))}
                          <span className="user-review-rating-text">{review.rating}/5</span>
                        </div>
                        <div className="user-review-date">
                          <Calendar size={14} />
                          <span>{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                      {review.reviewText && (
                        <p className="user-review-text">{review.reviewText}</p>
                      )}
                      {review.tags && review.tags.length > 0 && (
                        <div className="user-review-tags">
                          {review.tags.map((tag) => (
                            <span key={tag} className="user-review-tag">
                              {formatTagLabel(tag)}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="user-review-stats">
                        {review.helpfulCount > 0 && (
                          <span className="user-review-helpful">
                            👍 {review.helpfulCount} found this helpful
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="user-review-actions">
                      <button
                        className="user-review-action-btn edit"
                        onClick={() => handleEditReview(review)}
                      >
                        <Edit3 size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        className="user-review-action-btn delete"
                        onClick={() => handleDeleteReview(review._id)}
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Review Modal */}
      {showReviewModal && editingReview && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setEditingReview(null);
          }}
          restaurantId={editingReview.restaurantId._id || editingReview.restaurantId}
          restaurantName={editingReview.restaurantId?.name || 'Restaurant'}
          existingReview={editingReview}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </>
  );
};
export default UserReviewsPage;
