const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d' // Token expires in 7 days
  });
};
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }
    if (name.length < 3 || name.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 3 and 50 characters'
      });
    }
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password
    });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        favoriteRestaurants: user.favoriteRestaurants,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('favoriteRestaurants');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        favoriteRestaurants: user.favoriteRestaurants,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favoriteRestaurants')
      .select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        favoriteRestaurants: user.favoriteRestaurants,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user data'
    });
  }
};
const updateProfile = async (req, res) => {
  try {
    const { name, avatar, preferences } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    if (name) {
      if (name.length < 3 || name.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Name must be between 3 and 50 characters'
        });
      }
      user.name = name;
    }
    if (avatar) {
      user.avatar = avatar;
    }
    if (preferences) {
      if (preferences.favoriteCuisines) {
        user.preferences.favoriteCuisines = preferences.favoriteCuisines;
      }
      if (preferences.priceRange !== undefined) {
        user.preferences.priceRange = preferences.priceRange;
      }
      if (preferences.dietaryRestrictions) {
        user.preferences.dietaryRestrictions = preferences.dietaryRestrictions;
      }
      if (preferences.excludeIngredients) {
        user.preferences.excludeIngredients = preferences.excludeIngredients;
      }
    }
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        favoriteRestaurants: user.favoriteRestaurants,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};
const getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(200).json({
      success: true,
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching preferences'
    });
  }
};
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favoriteRestaurants')
      .select('favoriteRestaurants');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(200).json({
      success: true,
      count: user.favoriteRestaurants.length,
      favorites: user.favoriteRestaurants
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching favorites'
    });
  }
};
const addFavorite = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    if (user.favoriteRestaurants.includes(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant already in favorites'
      });
    }
    user.favoriteRestaurants.push(restaurantId);
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Restaurant added to favorites',
      favoriteRestaurants: user.favoriteRestaurants
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding favorite'
    });
  }
};
const removeFavorite = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    user.favoriteRestaurants = user.favoriteRestaurants.filter(
      id => id.toString() !== restaurantId
    );
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Restaurant removed from favorites',
      favoriteRestaurants: user.favoriteRestaurants
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing favorite'
    });
  }
};
const addSearchHistory = async (req, res) => {
  try {
    const { query, resultCount, clickedRestaurants } = req.body;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    user.searchHistory.unshift({
      query,
      timestamp: Date.now(),
      resultCount: resultCount || 0,
      clickedRestaurants: clickedRestaurants || []
    });
    if (user.searchHistory.length > 50) {
      user.searchHistory = user.searchHistory.slice(0, 50);
    }
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Search history updated',
      searchHistory: user.searchHistory
    });
  } catch (error) {
    console.error('Add search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating search history'
    });
  }
};
const getSearchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('searchHistory');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(200).json({
      success: true,
      searchHistory: user.searchHistory
    });
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching search history'
    });
  }
};
const clearSearchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    user.searchHistory = [];
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Search history cleared'
    });
  } catch (error) {
    console.error('Clear search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error clearing search history'
    });
  }
};
const deleteSearchHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    user.searchHistory = user.searchHistory.filter(
      search => search._id.toString() !== id
    );
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Search deleted',
      searchHistory: user.searchHistory
    });
  } catch (error) {
    console.error('Delete search history item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting search'
    });
  }
};
module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  logout,
  getPreferences,
  getFavorites,
  addFavorite,
  removeFavorite,
  addSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  deleteSearchHistoryItem
};
