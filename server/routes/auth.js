const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
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
} = require('../controllers/authController');
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyToken, getMe);
router.put('/update-profile', verifyToken, updateProfile);
router.get('/preferences', verifyToken, getPreferences);
router.get('/favorites', verifyToken, getFavorites);
router.post('/favorites/:restaurantId', verifyToken, addFavorite);
router.delete('/favorites/:restaurantId', verifyToken, removeFavorite);
router.post('/search-history', verifyToken, addSearchHistory);
router.get('/search-history', verifyToken, getSearchHistory);
router.delete('/search-history', verifyToken, clearSearchHistory);
router.delete('/search-history/:id', verifyToken, deleteSearchHistoryItem);
module.exports = router;
