const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const createReview = async (req, res) => {
  try {
    const { restaurantId, rating, reviewText, visitDate, tags } = req.body;
    if (!restaurantId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID and rating are required'
      });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    const existingReview = await Review.findOne({
      userId: req.user._id,
      restaurantId
    });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this restaurant. You can edit your existing review.'
      });
    }
    const user = await User.findById(req.user._id);
    const review = await Review.create({
      userId: req.user._id,
      restaurantId,
      rating,
      reviewText: reviewText || '',
      visitDate: visitDate || null,
      tags: tags || [],
      userName: user.name,
      userAvatar: user.avatar
    });
    await updateRestaurantRating(restaurantId);
    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating review'
    });
  }
};
const getRestaurantReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { sort = 'recent', page = 1, limit = 10 } = req.query;
    let sortOption = {};
    switch (sort) {
      case 'recent':
        sortOption = { createdAt: -1 };
        break;
      case 'highest':
        sortOption = { rating: -1, createdAt: -1 };
        break;
      case 'helpful':
        sortOption = { helpfulCount: -1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    const skip = (page - 1) * limit;
    const reviews = await Review.find({ restaurantId: id })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    const totalReviews = await Review.countDocuments({ restaurantId: id });
    res.status(200).json({
      success: true,
      reviews,
      total: totalReviews,
      page: parseInt(page),
      pages: Math.ceil(totalReviews / limit)
    });
  } catch (error) {
    console.error('Get restaurant reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching reviews'
    });
  }
};
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('restaurantId', 'name imageUrl location');
    res.status(200).json({
      success: true,
      reviews,
      count: reviews.length
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user reviews'
    });
  }
};
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, reviewText, visitDate, tags } = req.body;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own reviews'
      });
    }
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
      review.rating = rating;
    }
    if (reviewText !== undefined) review.reviewText = reviewText;
    if (visitDate !== undefined) review.visitDate = visitDate;
    if (tags !== undefined) review.tags = tags;
    await review.save();
    await updateRestaurantRating(review.restaurantId);
    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating review'
    });
  }
};
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }
    const restaurantId = review.restaurantId;
    await Review.findByIdAndDelete(id);
    await updateRestaurantRating(restaurantId);
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting review'
    });
  }
};
const markReviewHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    if (review.helpfulBy.includes(req.user._id)) {
      review.helpfulBy = review.helpfulBy.filter(
        userId => userId.toString() !== req.user._id.toString()
      );
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      review.helpfulBy.push(req.user._id);
      review.helpfulCount += 1;
    }
    await review.save();
    res.status(200).json({
      success: true,
      helpfulCount: review.helpfulCount,
      isHelpful: review.helpfulBy.includes(req.user._id)
    });
  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating review'
    });
  }
};
const updateRestaurantRating = async (restaurantId) => {
  try {
    const reviews = await Review.find({ restaurantId });
    if (reviews.length === 0) {
      await Restaurant.findByIdAndUpdate(restaurantId, {
        rating: 4, // Default rating
        reviewCount: 0
      });
      return;
    }
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating: parseFloat(averageRating.toFixed(1)),
      reviewCount: reviews.length
    });
  } catch (error) {
    console.error('Update restaurant rating error:', error);
  }
};
module.exports = {
  createReview,
  getRestaurantReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  markReviewHelpful
};
