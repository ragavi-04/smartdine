const express = require('express');
const router = express.Router();
const { searchRestaurants, surpriseMe, excludeIngredients } = require('../controllers/searchController');
router.post('/', searchRestaurants);
router.get('/surprise', surpriseMe);
router.post('/exclude-ingredients', excludeIngredients);
module.exports = router;