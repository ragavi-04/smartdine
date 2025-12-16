import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Edit3, Trash2, Calendar, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ReviewsList.css';
const ReviewsList = ({ restaurantId, onEditReview, refreshTrigger }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  useEffect(() => {
    fetchReviews();
  }, [restaurantId, sortBy, page, refreshTrigger]);
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reviews/restaurant/${restaurantId}`, {
        params: { sort: sortBy, page, limit: 10 }
      });
      setReviews(response.data.reviews);
      setTotalPages(response.data.pages);
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Fetch reviews error:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleMarkHelpful = async (reviewId) => {
    if (!user) {
      alert('Please log in to mark reviews as helpful');
      return;
    }
    try {
      const response = await api.post(`/reviews/${reviewId}/helpful`);
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review._id === reviewId
            ? {
                ...review,
                helpfulCount: response.data.helpfulCount,
                helpfulBy: response.data.isHelpful
                  ? [...(review.helpfulBy || []), user._id]
                  : (review.helpfulBy || []).filter(id => id !== user._id)
              }
            : review
        )
      );
    } catch (err) {
      console.error('Mark helpful error:', err);
    }
  };
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    try {
      await api.delete(`/reviews/${reviewId}`);
      fetchReviews(); // Refresh the list
    } catch (err) {
      alert('Failed to delete review');
      console.error('Delete review error:', err);
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const formatTagLabel = (tag) => {
    return tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  const isUserReview = (review) => {
    return user && review.userId === user._id;
  };
  const isHelpfulByUser = (review) => {
    return user && review.helpfulBy && review.helpfulBy.includes(user._id);
  };
  if (loading && reviews.length === 0) {
    return (
      <div className="reviews-loading">
        <div className="spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }
  return (
    <div className="reviews-list-container">
      <div className="reviews-header">
        <h3>Customer Reviews</h3>
        <div className="reviews-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>
      {error && <div className="reviews-error">{error}</div>}
      {reviews.length === 0 ? (
        <div className="reviews-empty">
          <Star size={48} />
          <p>No reviews yet</p>
          <span>Be the first to review this restaurant!</span>
        </div>
      ) : (
        <>
          <div className="reviews-list">
            {reviews.map((review) => (
              <div
                key={review._id}
                className={`review-item ${isUserReview(review) ? 'user-review' : ''}`}
              >
                {isUserReview(review) && (
                  <div className="your-review-badge">Your Review</div>
                )}
                <div className="review-header-section">
                  <div className="review-user-info">
                    {review.userAvatar ? (
                      <img src={review.userAvatar} alt={review.userName} className="review-avatar" />
                    ) : (
                      <div className="review-avatar-placeholder">
                        <User size={24} />
                      </div>
                    )}
                    <div className="review-user-details">
                      <span className="review-user-name">{review.userName}</span>
                      <div className="review-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            fill={star <= review.rating ? '#FFD700' : 'none'}
                            stroke={star <= review.rating ? '#FFD700' : '#ddd'}
                          />
                        ))}
                        <span className="review-rating-text">{review.rating}/5</span>
                      </div>
                    </div>
                  </div>
                  <div className="review-meta">
                    <div className="review-date">
                      <Calendar size={14} />
                      <span>{formatDate(review.createdAt)}</span>
                    </div>
                    {isUserReview(review) && (
                      <div className="review-actions">
                        <button
                          className="review-action-btn edit-btn"
                          onClick={() => onEditReview(review)}
                          title="Edit review"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="review-action-btn delete-btn"
                          onClick={() => handleDeleteReview(review._id)}
                          title="Delete review"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {review.reviewText && (
                  <p className="review-text">{review.reviewText}</p>
                )}
                {review.tags && review.tags.length > 0 && (
                  <div className="review-tags-display">
                    {review.tags.map((tag) => (
                      <span key={tag} className="review-tag-badge">
                        {formatTagLabel(tag)}
                      </span>
                    ))}
                  </div>
                )}
                <div className="review-footer">
                  <button
                    className={`helpful-btn ${isHelpfulByUser(review) ? 'active' : ''}`}
                    onClick={() => handleMarkHelpful(review._id)}
                  >
                    <ThumbsUp size={16} />
                    <span>Helpful ({review.helpfulCount || 0})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="reviews-pagination">
              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default ReviewsList;
