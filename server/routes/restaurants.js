const express = require('express');
const router = express.Router();
const {
  getAllRestaurants,
  getRestaurantById,
  getRandomRestaurant,
  getRestaurantsByCurrentTime,
  getAllRestaurantsForMap,
  getNearbyRestaurants
} = require('../controllers/restaurantController');
router.get('/', getAllRestaurants);
router.get('/random', getRandomRestaurant);
router.get('/current-time', getRestaurantsByCurrentTime);
router.get('/map', getAllRestaurantsForMap);
router.post('/nearby', getNearbyRestaurants);
router.get('/:id', getRestaurantById);
module.exports = router;