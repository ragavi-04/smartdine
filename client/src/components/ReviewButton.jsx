import React, { useState } from 'react';
import { MessageSquare, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ReviewButton.css';
const ReviewButton = ({ restaurantId, restaurantName, hasReviewed, onReviewSubmit }) => {
  const { user } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const handleClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }
    if (onReviewSubmit) {
      onReviewSubmit();
    }
  };
  return (
    <>
      <button 
        className="review-button"
        onClick={handleClick}
        title={hasReviewed ? "Edit your review" : "Write a review"}
      >
        {hasReviewed ? (
          <>
            <Edit3 size={18} />
            <span>Edit Review</span>
          </>
        ) : (
          <>
            <MessageSquare size={18} />
            <span>Write a Review</span>
          </>
        )}
      </button>
      {showLoginPrompt && !user && (
        <div className="login-prompt">
          Please log in to write a review
        </div>
      )}
    </>
  );
};
export default ReviewButton;
