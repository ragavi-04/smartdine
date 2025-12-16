import React, { useState, useEffect } from 'react';
import { X, Star, Calendar, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ReviewModal.css';
const REVIEW_TAGS = [
  'great-food',
  'good-service',
  'nice-ambiance',
  'good-value',
  'fast-service',
  'clean',
  'friendly-staff'
];
const ReviewModal = ({ isOpen, onClose, restaurantId, restaurantName, existingReview, onReviewSubmitted }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(existingReview?.reviewText || '');
  const [visitDate, setVisitDate] = useState(existingReview?.visitDate || '');
  const [selectedTags, setSelectedTags] = useState(existingReview?.tags || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setReviewText(existingReview.reviewText || '');
      setVisitDate(existingReview.visitDate ? existingReview.visitDate.split('T')[0] : '');
      setSelectedTags(existingReview.tags || []);
    }
  }, [existingReview]);
  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  const formatTagLabel = (tag) => {
    return tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (reviewText.trim().length > 500) {
      setError('Review text must be 500 characters or less');
      return;
    }
    setLoading(true);
    try {
      const reviewData = {
        restaurantId,
        rating,
        reviewText: reviewText.trim(),
        visitDate: visitDate || null,
        tags: selectedTags
      };
      if (existingReview) {
        await api.put(`/reviews/${existingReview._id}`, reviewData);
        setSuccess('Review updated successfully!');
      } else {
        await api.post('/reviews', reviewData);
        setSuccess('Review submitted successfully!');
      }
      setTimeout(() => {
        if (onReviewSubmitted) onReviewSubmitted();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;
  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="review-modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="review-modal-header">
          <h2>{existingReview ? 'Edit Your Review' : 'Write a Review'}</h2>
          <p className="review-restaurant-name">{restaurantName}</p>
        </div>
        <form onSubmit={handleSubmit} className="review-form">
          {/* Star Rating */}
          <div className="review-section">
            <label className="review-label">
              <Star size={20} />
              <span>Your Rating *</span>
            </label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star size={32} fill={star <= (hoverRating || rating) ? '#FFD700' : 'none'} />
                </button>
              ))}
            </div>
            <span className="rating-text">
              {rating === 0 ? 'Select a rating' : `${rating} out of 5 stars`}
            </span>
          </div>
          {/* Review Text */}
          <div className="review-section">
            <label className="review-label">
              <span>Your Review</span>
            </label>
            <textarea
              className="review-textarea"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience... What did you like? What could be better?"
              rows={6}
              maxLength={500}
            />
            <div className="char-count">
              {reviewText.length}/500 characters
            </div>
          </div>
          {/* Visit Date */}
          <div className="review-section">
            <label className="review-label">
              <Calendar size={20} />
              <span>Visit Date (Optional)</span>
            </label>
            <input
              type="date"
              className="review-date-input"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          {/* Tags */}
          <div className="review-section">
            <label className="review-label">
              <Tag size={20} />
              <span>Tags (Optional)</span>
            </label>
            <div className="review-tags">
              {REVIEW_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`review-tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {formatTagLabel(tag)}
                </button>
              ))}
            </div>
          </div>
          {/* Error/Success Messages */}
          {error && <div className="review-error">{error}</div>}
          {success && <div className="review-success">{success}</div>}
          {/* Submit Button */}
          <button
            type="submit"
            className="review-submit-btn"
            disabled={loading || rating === 0}
          >
            {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default ReviewModal;
