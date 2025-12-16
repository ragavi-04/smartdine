const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviewText: {
    type: String,
    maxlength: [500, 'Review cannot exceed 500 characters'],
    trim: true
  },
  visitDate: {
    type: Date
  },
  tags: [{
    type: String,
    enum: ['great-food', 'good-service', 'nice-ambiance', 'good-value', 'fast-service', 'clean', 'friendly-staff']
  }],
  helpfulCount: {
    type: Number,
    default: 0
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  userName: {
    type: String,
    required: true
  },
  userAvatar: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
reviewSchema.index({ restaurantId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ restaurantId: 1, userId: 1 }, { unique: true }); // One review per user per restaurant
reviewSchema.pre('save', function() {
  this.updatedAt = Date.now();
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
