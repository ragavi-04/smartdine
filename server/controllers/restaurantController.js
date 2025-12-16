const Restaurant = require('../models/Restaurant');
const { getCurrentMealTime } = require('../utils/timeHelper');
const getAllRestaurants = async (req, res) => {
  try {
    const { cuisine, priceRange, area, mealTime, vibe } = req.query;
    const filters = {};
    if (cuisine) filters.cuisine = { $in: [cuisine] };
    if (priceRange) filters.priceRange = priceRange;
    if (area) filters.area = area;
    if (mealTime) filters.mealTimes = { $in: [mealTime] };
    if (vibe) filters.vibes = { $in: [vibe] };
    const restaurants = await Restaurant.find(filters);
    const currentMealTime = getCurrentMealTime();
    res.json({
      success: true,
      count: restaurants.length,
      currentMealTime: currentMealTime,
      data: restaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurants',
      error: error.message
    });
  }
};
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    res.json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant',
      error: error.message
    });
  }
};
const getRandomRestaurant = async (req, res) => {
  try {
    const count = await Restaurant.countDocuments();
    const random = Math.floor(Math.random() * count);
    const restaurant = await Restaurant.findOne().skip(random);
    res.json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting random restaurant',
      error: error.message
    });
  }
};
const getRestaurantsByCurrentTime = async (req, res) => {
  try {
    const currentMealTime = getCurrentMealTime();
    const restaurants = await Restaurant.find({
      mealTimes: { $in: [currentMealTime] }
    }).sort({ rating: -1 });
    res.json({
      success: true,
      currentMealTime: currentMealTime,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching time-based restaurants',
      error: error.message
    });
  }
};
const getAllRestaurantsForMap = async (req, res) => {
  try {
    const { cuisine, priceRange, mealTime, minRating } = req.query;
    const filters = {};
    if (cuisine) filters.cuisine = { $in: [cuisine] };
    if (priceRange) filters.priceRange = priceRange;
    if (mealTime) filters.mealTimes = { $in: [mealTime] };
    if (minRating) filters.rating = { $gte: parseFloat(minRating) };
    const restaurants = await Restaurant.find(filters)
      .select('name cuisine priceRange rating coordinates mapAddress imageUrl specialtyDishes');
    res.json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching map data',
      error: error.message
    });
  }
};
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
const getNearbyRestaurants = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.body; // radius in km
    const restaurants = await Restaurant.find({});
    const nearbyRestaurants = restaurants
      .map(restaurant => {
        const distance = calculateDistance(
          latitude,
          longitude,
          restaurant.coordinates.latitude,
          restaurant.coordinates.longitude
        );
        return {
          ...restaurant.toObject(),
          distance: distance.toFixed(2)
        };
      })
      .filter(r => r.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
    res.json({
      success: true,
      count: nearbyRestaurants.length,
      userLocation: { latitude, longitude },
      data: nearbyRestaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error finding nearby restaurants',
      error: error.message
    });
  }
};
module.exports = {
  getAllRestaurants,
  getRestaurantById,
  getRandomRestaurant,
  getRestaurantsByCurrentTime,
  getAllRestaurantsForMap,
  getNearbyRestaurants
};