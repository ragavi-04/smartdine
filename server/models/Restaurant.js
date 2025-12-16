const mongoose = require('mongoose');
const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  cuisine: [{
    type: String,
    required: true
  }],
  priceRange: {
    type: String,
    enum: ['₹', '₹₹', '₹₹₹'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  area: {
    type: String,
    required: true
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  mapAddress: {
    type: String,
    required: true
  },
  landmarks: [{
    type: String
  }],
  specialtyDishes: [{
    type: String
  }],
  ambiance: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 4
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  imageUrl: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String
  },
  openingHours: {
    type: String,
    default: '10:00 AM - 10:00 PM'
  },
  tags: [{
    type: String
  }],
  mealTimes: [{
    type: String,
    enum: ['breakfast', 'lunch', 'snacks', 'dinner', 'late-night', 'dessert']
  }],
  vibes: [{
    type: String,
    enum: ['group-hangout', 'quiet-study', 'romantic', 'family-friendly', 'fun-cafe']
  }],
  tasteTags: [{
    type: String,
    enum: ['spicy', 'sweet', 'tangy', 'savory', 'creamy', 'crispy', 'smoky', 'rich', 'mild', 'flavorful']
  }],
  featureTags: [{
    type: String,
    enum: ['outdoor-seating', 'wifi', 'parking', 'ac', 'takeaway', 'delivery', 'live-music', 'buffet', 'bar', 'pet-friendly']
  }],
  dietaryTags: [{
    type: String,
    enum: ['vegetarian', 'non-veg', 'vegan', 'gluten-free', 'healthy', 'jain']
  }],
  weatherTags: [{
    type: String,
    enum: ['hot-soup', 'chai', 'pakoras', 'hot-beverages', 'comfort-food', 
           'cold-desserts', 'ice-cream', 'juices', 'refreshing', 'chilled',
           'hot-meals', 'soups', 'warm-food']
  }],
  ingredients: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  allergens: [{
    type: String,
    enum: ['dairy', 'nuts', 'gluten', 'eggs', 'soy', 'shellfish', 'fish', 'peanuts'],
    lowercase: true
  }],
  allergenFriendly: [{
    type: String,
    lowercase: true,
    trim: true
  }]
}, {
  timestamps: true
});
module.exports = mongoose.model('Restaurant', restaurantSchema);