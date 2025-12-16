const { getRecommendations } = require('../services/rag');
const { generateRecommendation, generateSurprise } = require('../services/groq');
const Restaurant = require('../models/Restaurant');
const { getCurrentMealTime, getTimeBasedGreeting } = require('../utils/timeHelper');
const { getCurrentWeather, getWeatherFoodSuggestions, getWeatherEmoji } = require('../services/weather');
const generateFallbackRecommendation = (query, restaurants, currentMealTime, weatherData) => {
  const top3 = restaurants.slice(0, 3);
  const greeting = getTimeBasedGreeting();
  let response = `${greeting}\n\n`;
  if (weatherData) {
    const weatherEmoji = getWeatherEmoji(weatherData.category);
    const weatherSuggestions = getWeatherFoodSuggestions(weatherData.category);
    response += `${weatherEmoji} Weather: ${weatherData.description} (${Math.round(weatherData.temperature)}°C)\n`;
    response += `💡 ${weatherSuggestions.description}\n\n`;
  }
  response += `Based on your search for "${query}", here are my top recommendations:\n\n`;
  top3.forEach((restaurant) => {
    const perfectTiming = restaurant.mealTimes.includes(currentMealTime) 
      ? ` ⏰ Perfect for ${currentMealTime}!` 
      : '';
    let weatherMatch = '';
    if (weatherData && restaurant.weatherTags && restaurant.weatherTags.length > 0) {
      const weatherSuggestions = getWeatherFoodSuggestions(weatherData.category);
      const matchesWeather = restaurant.weatherTags.some(tag => 
        weatherSuggestions.tags.includes(tag)
      );
      if (matchesWeather) {
        weatherMatch = ` ${getWeatherEmoji(weatherData.category)} Great for this weather!`;
      }
    }
    response += `**${restaurant.name}**${perfectTiming}${weatherMatch}\n`;
    response += `🎯 Why it's perfect: ${restaurant.description.substring(0, 150)}...\n`;
    response += `💰 Price: ${restaurant.priceRange} | 🍽️ Must-try: ${restaurant.specialtyDishes[0]}\n`;
    response += `⭐ Rating: ${restaurant.rating}/5\n\n`;
  });
  return response;
};
const searchRestaurants = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }
    console.log('🔍 Search query:', query);
    const currentMealTime = getCurrentMealTime();
    console.log('⏰ Current meal time:', currentMealTime);
    let weatherData = null;
    try {
      weatherData = await getCurrentWeather();
      console.log(`🌤️ Weather: ${weatherData.category} - ${weatherData.description} (${Math.round(weatherData.temperature)}°C)`);
    } catch (error) {
      console.log('⚠️ Weather data unavailable, continuing without it');
    }
    let relevantRestaurants = await getRecommendations(query, weatherData);
    relevantRestaurants = relevantRestaurants.map(restaurant => {
      const matchesTime = restaurant.mealTimes.includes(currentMealTime);
      let matchesWeather = false;
      if (weatherData && restaurant.weatherTags && restaurant.weatherTags.length > 0) {
        const weatherSuggestions = getWeatherFoodSuggestions(weatherData.category);
        matchesWeather = restaurant.weatherTags.some(tag => 
          weatherSuggestions.tags.includes(tag)
        );
      }
      return {
        ...restaurant.toObject(),
        matchesCurrentTime: matchesTime,
        matchesWeather: matchesWeather
      };
    });
    relevantRestaurants.sort((a, b) => {
      const aScore = (a.matchesCurrentTime ? 2 : 0) + (a.matchesWeather ? 1 : 0);
      const bScore = (b.matchesCurrentTime ? 2 : 0) + (b.matchesWeather ? 1 : 0);
      if (aScore !== bScore) return bScore - aScore;
      return b.rating - a.rating;
    });
    if (relevantRestaurants.length === 0) {
      return res.json({
        success: true,
        message: 'No restaurants found matching your query',
        data: []
      });
    }
    console.log(`✅ Found ${relevantRestaurants.length} relevant restaurants`);
    let aiResponse;
    let usingFallback = false;
    try {
      aiResponse = await generateRecommendation(query, relevantRestaurants);
      console.log('🤖 AI recommendation generated');
    } catch (error) {
      console.log('⚠️ AI failed, using fallback recommendations');
      aiResponse = generateFallbackRecommendation(query, relevantRestaurants, currentMealTime, weatherData);
      usingFallback = true;
    }
    res.json({
      success: true,
      query: query,
      currentMealTime: currentMealTime,
      weather: weatherData ? {
        temperature: Math.round(weatherData.temperature),
        condition: weatherData.condition,
        description: weatherData.description,
        category: weatherData.category,
        emoji: getWeatherEmoji(weatherData.category),
        suggestions: getWeatherFoodSuggestions(weatherData.category),
        isMockData: weatherData.isMockData
      } : null,
      greeting: getTimeBasedGreeting(),
      aiRecommendation: aiResponse,
      restaurants: relevantRestaurants,
      count: relevantRestaurants.length,
      usingFallback: usingFallback
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing search',
      error: error.message
    });
  }
};
const surpriseMe = async (req, res) => {
  try {
    const currentMealTime = getCurrentMealTime();
    let restaurants = await Restaurant.find({ 
      rating: { $gte: 4.3 },
      mealTimes: { $in: [currentMealTime] }
    });
    if (restaurants.length === 0) {
      restaurants = await Restaurant.find({ rating: { $gte: 4.3 } });
    }
    const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
    let surprise;
    let usingFallback = false;
    try {
      surprise = await generateSurprise(randomRestaurant);
    } catch (error) {
      console.log('⚠️ AI failed for surprise, using fallback');
      surprise = {
        restaurant: randomRestaurant,
        pitch: `🎉 Surprise! Try ${randomRestaurant.name}! ${randomRestaurant.description.substring(0, 120)}... Don't miss their ${randomRestaurant.specialtyDishes[0]}!`
      };
      usingFallback = true;
    }
    res.json({
      success: true,
      currentMealTime: currentMealTime,
      data: surprise,
      usingFallback: usingFallback
    });
  } catch (error) {
    console.error('Surprise error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating surprise',
      error: error.message
    });
  }
};
const excludeIngredients = async (req, res) => {
  try {
    const { query, excludeIngredients } = req.body;
    if (!excludeIngredients || !Array.isArray(excludeIngredients) || excludeIngredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide ingredients to exclude as an array'
      });
    }
    console.log('🚫 Excluding ingredients:', excludeIngredients);
    const currentMealTime = getCurrentMealTime();
    let weatherData = null;
    try {
      weatherData = await getCurrentWeather();
      console.log(`🌤️ Weather: ${weatherData.category} - ${weatherData.description} (${Math.round(weatherData.temperature)}°C)`);
    } catch (error) {
      console.log('⚠️ Weather data unavailable, continuing without it');
    }
    let relevantRestaurants;
    if (query && query.trim() !== '') {
      relevantRestaurants = await getRecommendations(query, weatherData);
    } else {
      relevantRestaurants = await Restaurant.find({});
    }
    const normalizedExclusions = excludeIngredients.map(item => item.toLowerCase().trim());
    const safeRestaurants = relevantRestaurants.filter(restaurant => {
      const hasExcludedIngredient = restaurant.ingredients && restaurant.ingredients.some(ingredient => 
        normalizedExclusions.includes(ingredient.toLowerCase())
      );
      const hasExcludedAllergen = restaurant.allergens && restaurant.allergens.some(allergen => 
        normalizedExclusions.includes(allergen.toLowerCase())
      );
      return !hasExcludedIngredient && !hasExcludedAllergen;
    });
    console.log(`✅ Found ${safeRestaurants.length} safe restaurants (filtered from ${relevantRestaurants.length})`);
    if (safeRestaurants.length === 0) {
      return res.json({
        success: true,
        message: `No restaurants found that avoid ${excludeIngredients.join(', ')}. Try excluding fewer ingredients or contact restaurants directly for custom options.`,
        data: [],
        count: 0,
        excludedIngredients: excludeIngredients
      });
    }
    const safeRestaurantsWithIndicators = safeRestaurants.map(restaurant => {
      const matchesTime = restaurant.mealTimes && restaurant.mealTimes.includes(currentMealTime);
      let matchesWeather = false;
      if (weatherData && restaurant.weatherTags && restaurant.weatherTags.length > 0) {
        const weatherSuggestions = getWeatherFoodSuggestions(weatherData.category);
        matchesWeather = restaurant.weatherTags.some(tag => 
          weatherSuggestions.tags.includes(tag)
        );
      }
      const safeForItems = excludeIngredients.map(item => 
        item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()
      );
      return {
        ...restaurant.toObject(),
        matchesCurrentTime: matchesTime,
        matchesWeather: matchesWeather,
        allergySafe: true,
        safeFor: safeForItems,
        safeForMessage: `Safe: No ${safeForItems.join(', No ')}`
      };
    });
    safeRestaurantsWithIndicators.sort((a, b) => {
      const aScore = (a.matchesCurrentTime ? 2 : 0) + (a.matchesWeather ? 1 : 0);
      const bScore = (b.matchesCurrentTime ? 2 : 0) + (b.matchesWeather ? 1 : 0);
      if (aScore !== bScore) return bScore - aScore;
      return b.rating - a.rating;
    });
    let aiResponse;
    let usingFallback = false;
    try {
      const enhancedQuery = query 
        ? `${query} (avoiding ${excludeIngredients.join(', ')})` 
        : `Restaurants safe for people avoiding ${excludeIngredients.join(', ')}`;
      aiResponse = await generateRecommendation(enhancedQuery, safeRestaurantsWithIndicators);
      console.log('🤖 AI recommendation generated with allergy filters');
    } catch (error) {
      console.log('⚠️ AI failed, using fallback recommendations');
      const greeting = getTimeBasedGreeting();
      aiResponse = `${greeting}\n\n`;
      aiResponse += `✅ Great news! I found ${safeRestaurantsWithIndicators.length} restaurants that avoid ${excludeIngredients.join(', ')}.\n\n`;
      aiResponse += `Here are your top allergy-safe options:\n\n`;
      safeRestaurantsWithIndicators.slice(0, 3).forEach(restaurant => {
        aiResponse += `**${restaurant.name}** ✓ ${restaurant.safeForMessage}\n`;
        aiResponse += `${restaurant.description.substring(0, 120)}...\n`;
        if (restaurant.allergenFriendly && restaurant.allergenFriendly.length > 0) {
          aiResponse += `💚 ${restaurant.allergenFriendly.join(', ')}\n`;
        }
        aiResponse += `⭐ ${restaurant.rating}/5 | 💰 ${restaurant.priceRange}\n\n`;
      });
      usingFallback = true;
    }
    res.json({
      success: true,
      query: query || 'All restaurants',
      excludedIngredients: excludeIngredients,
      currentMealTime: currentMealTime,
      weather: weatherData ? {
        temperature: Math.round(weatherData.temperature),
        condition: weatherData.condition,
        description: weatherData.description,
        category: weatherData.category,
        emoji: getWeatherEmoji(weatherData.category),
        suggestions: getWeatherFoodSuggestions(weatherData.category),
        isMockData: weatherData.isMockData
      } : null,
      greeting: getTimeBasedGreeting(),
      aiRecommendation: aiResponse,
      restaurants: safeRestaurantsWithIndicators,
      count: safeRestaurantsWithIndicators.length,
      totalFiltered: relevantRestaurants.length,
      usingFallback: usingFallback
    });
  } catch (error) {
    console.error('Ingredient exclusion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing ingredient exclusion',
      error: error.message
    });
  }
};
module.exports = {
  searchRestaurants,
  surpriseMe,
  excludeIngredients
};