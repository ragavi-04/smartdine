const express = require('express');
const router = express.Router();
const {
  createReview,
  getRestaurantReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  markReviewHelpful
} = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/auth');
router.post('/', verifyToken, createReview);
router.get('/restaurant/:id', getRestaurantReviews);
router.get('/user', verifyToken, getUserReviews);
router.put('/:id', verifyToken, updateReview);
router.delete('/:id', verifyToken, deleteReview);
router.post('/:id/helpful', verifyToken, markReviewHelpful);
module.exports = router;
