const Restaurant = require('../models/Restaurant');
const { getCurrentWeather, getWeatherFoodSuggestions } = require('./weather');
const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};
const createSimpleEmbedding = (text) => {
  const keywords = {
    'comfort': 5, 'sad': 5, 'happy': 3, 'celebrate': 4, 'celebration': 4,
    'romantic': 5, 'date': 5, 'cozy': 4, 'relax': 3,
    'cheap': 5, 'budget': 5, 'expensive': 5, 'affordable': 4, 'pricey': 4,
    'spicy': 4, 'cheesy': 5, 'sweet': 4, 'healthy': 4, 'fried': 3,
    'grilled': 3, 'biryani': 5, 'pizza': 5, 'burger': 5, 'pasta': 4,
    'chinese': 4, 'italian': 4, 'indian': 4, 'mexican': 4,
    'quick': 4, 'fast': 4, 'lunch': 3, 'dinner': 3, 'breakfast': 4,
    'group': 3, 'family': 3, 'friends': 3,
    'casual': 3, 'fine': 4, 'elegant': 4, 'traditional': 3,
    'modern': 3, 'authentic': 4,
    'tangy': 4, 'savory': 4, 'creamy': 4, 'crispy': 4, 'smoky': 4, 
    'rich': 4, 'mild': 3, 'flavorful': 4,
    'outdoor': 4, 'wifi': 4, 'parking': 4, 'ac': 3, 'takeaway': 3,
    'delivery': 3, 'live-music': 4, 'music': 4, 'buffet': 4, 'bar': 4,
    'pet-friendly': 4, 'pets': 4,
    'vegetarian': 4, 'veg': 4, 'non-veg': 4, 'meat': 4, 'vegan': 4,
    'gluten-free': 4, 'gluten': 4, 'jain': 4,
    'quiet': 4, 'peaceful': 4, 'lively': 4, 'energetic': 4, 'fun': 4,
    'study': 4, 'work': 4,
    'soup': 4, 'hot-soup': 5, 'chai': 5, 'pakoras': 5, 'hot-beverages': 4,
    'cold-desserts': 5, 'ice-cream': 5, 'juices': 4, 'refreshing': 4, 'chilled': 4,
    'hot-meals': 4, 'warm-food': 4, 'warm': 4
  };
  const lowerText = text.toLowerCase();
  const vector = [];
  for (const [word, weight] of Object.entries(keywords)) {
    if (lowerText.includes(word)) {
      vector.push(weight);
    } else {
      vector.push(0);
    }
  }
  for (let i = 0; i < 20; i++) {
    vector.push(Math.random() * 0.1);
  }
  return vector;
};
const semanticSearch = async (userQuery, weatherData = null) => {
  try {
    const allRestaurants = await Restaurant.find({});
    const queryEmbedding = createSimpleEmbedding(userQuery);
    const restaurantsWithScores = allRestaurants.map(restaurant => {
      const restaurantText = `
        ${restaurant.name} 
        ${restaurant.cuisine.join(' ')} 
        ${restaurant.description} 
        ${restaurant.ambiance} 
        ${restaurant.tags.join(' ')}
        ${restaurant.tasteTags ? restaurant.tasteTags.join(' ') : ''}
        ${restaurant.featureTags ? restaurant.featureTags.join(' ') : ''}
        ${restaurant.dietaryTags ? restaurant.dietaryTags.join(' ') : ''}
        ${restaurant.weatherTags ? restaurant.weatherTags.join(' ') : ''}
        ${restaurant.priceRange}
      `;
      const restaurantEmbedding = createSimpleEmbedding(restaurantText);
      let similarity = cosineSimilarity(queryEmbedding, restaurantEmbedding);
      if (weatherData && restaurant.weatherTags && restaurant.weatherTags.length > 0) {
        const weatherSuggestions = getWeatherFoodSuggestions(weatherData.category);
        const matchesWeather = restaurant.weatherTags.some(tag => 
          weatherSuggestions.tags.includes(tag)
        );
        if (matchesWeather) {
          similarity *= 1.15; // 15% boost for weather-appropriate restaurants
        }
      }
      return {
        restaurant,
        score: similarity
      };
    });
    restaurantsWithScores.sort((a, b) => b.score - a.score);
    const topRestaurants = restaurantsWithScores.slice(0, 5).map(item => item.restaurant);
    return topRestaurants;
  } catch (error) {
    console.error('Semantic search error:', error);
    throw error;
  }
};
const ruleBasedFilter = async (query) => {
  const filters = {};
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes('cheap') || lowerQuery.includes('budget') || lowerQuery.includes('affordable')) {
    filters.priceRange = '₹';
  } else if (lowerQuery.includes('expensive') || lowerQuery.includes('premium') || lowerQuery.includes('fine dining')) {
    filters.priceRange = '₹₹₹';
  }
  if (lowerQuery.includes('pizza') || lowerQuery.includes('italian')) {
    filters.cuisine = { $in: ['Italian'] };
  } else if (lowerQuery.includes('biryani') || lowerQuery.includes('indian')) {
    filters.cuisine = { $in: ['North Indian', 'South Indian', 'Hyderabadi'] };
  } else if (lowerQuery.includes('chinese')) {
    filters.cuisine = { $in: ['Chinese', 'Asian'] };
  } else if (lowerQuery.includes('burger')) {
    filters.cuisine = { $in: ['American', 'Fast Food'] };
  }
  if (lowerQuery.includes('romantic') || lowerQuery.includes('date')) {
    filters.tags = { $in: ['romantic'] };
  } else if (lowerQuery.includes('comfort')) {
    filters.tags = { $in: ['comfort-food'] };
  }
  if (lowerQuery.includes('spicy') || lowerQuery.includes('hot')) {
    filters.tasteTags = { $in: ['spicy'] };
  } else if (lowerQuery.includes('sweet')) {
    filters.tasteTags = { $in: ['sweet'] };
  } else if (lowerQuery.includes('tangy') || lowerQuery.includes('sour')) {
    filters.tasteTags = { $in: ['tangy'] };
  } else if (lowerQuery.includes('creamy') || lowerQuery.includes('rich')) {
    filters.tasteTags = { $in: ['creamy', 'rich'] };
  } else if (lowerQuery.includes('crispy') || lowerQuery.includes('crunchy')) {
    filters.tasteTags = { $in: ['crispy'] };
  } else if (lowerQuery.includes('smoky') || lowerQuery.includes('grilled')) {
    filters.tasteTags = { $in: ['smoky'] };
  }
  if (lowerQuery.includes('outdoor') || lowerQuery.includes('terrace') || lowerQuery.includes('garden')) {
    filters.featureTags = { $in: ['outdoor-seating'] };
  } else if (lowerQuery.includes('wifi') || lowerQuery.includes('internet')) {
    filters.featureTags = { $in: ['wifi'] };
  } else if (lowerQuery.includes('parking')) {
    filters.featureTags = { $in: ['parking'] };
  } else if (lowerQuery.includes('live music') || lowerQuery.includes('music')) {
    filters.featureTags = { $in: ['live-music'] };
  } else if (lowerQuery.includes('buffet') || lowerQuery.includes('unlimited')) {
    filters.featureTags = { $in: ['buffet'] };
  } else if (lowerQuery.includes('bar') || lowerQuery.includes('drinks') || lowerQuery.includes('alcohol')) {
    filters.featureTags = { $in: ['bar'] };
  } else if (lowerQuery.includes('pet') || lowerQuery.includes('dog')) {
    filters.featureTags = { $in: ['pet-friendly'] };
  }
  if (lowerQuery.includes('vegetarian') || lowerQuery.includes('veg only') || lowerQuery.includes('pure veg')) {
    filters.dietaryTags = { $in: ['vegetarian'] };
  } else if (lowerQuery.includes('vegan')) {
    filters.dietaryTags = { $in: ['vegan'] };
  } else if (lowerQuery.includes('non-veg') || lowerQuery.includes('meat') || lowerQuery.includes('chicken') || lowerQuery.includes('fish')) {
    filters.dietaryTags = { $in: ['non-veg'] };
  } else if (lowerQuery.includes('healthy') || lowerQuery.includes('fitness') || lowerQuery.includes('diet')) {
    filters.dietaryTags = { $in: ['healthy'] };
  } else if (lowerQuery.includes('gluten-free') || lowerQuery.includes('gluten free')) {
    filters.dietaryTags = { $in: ['gluten-free'] };
  } else if (lowerQuery.includes('jain')) {
    filters.dietaryTags = { $in: ['jain'] };
  }
  if (lowerQuery.includes('rainy') || lowerQuery.includes('rain')) {
    filters.weatherTags = { $in: ['hot-soup', 'chai', 'pakoras', 'hot-beverages', 'comfort-food'] };
  } else if (lowerQuery.includes('hot weather') || lowerQuery.includes('summer') || lowerQuery.includes('sunny')) {
    filters.weatherTags = { $in: ['cold-desserts', 'ice-cream', 'juices', 'refreshing', 'chilled'] };
  } else if (lowerQuery.includes('cold weather') || lowerQuery.includes('winter') || lowerQuery.includes('chilly')) {
    filters.weatherTags = { $in: ['hot-meals', 'soups', 'warm-food', 'hot-beverages'] };
  } else if (lowerQuery.includes('soup')) {
    filters.weatherTags = { $in: ['hot-soup', 'soups'] };
  } else if (lowerQuery.includes('ice cream') || lowerQuery.includes('ice-cream')) {
    filters.weatherTags = { $in: ['ice-cream', 'cold-desserts'] };
  } else if (lowerQuery.includes('chai') || lowerQuery.includes('tea')) {
    filters.weatherTags = { $in: ['chai', 'hot-beverages'] };
  } else if (lowerQuery.includes('pakora') || lowerQuery.includes('pakoras') || lowerQuery.includes('fritters')) {
    filters.weatherTags = { $in: ['pakoras', 'comfort-food'] };
  }
  if (Object.keys(filters).length > 0) {
    return await Restaurant.find(filters).limit(5);
  }
  return null;
};
const getRecommendations = async (userQuery, weatherData = null) => {
  try {
    let restaurants = await ruleBasedFilter(userQuery);
    if (!restaurants || restaurants.length === 0) {
      restaurants = await semanticSearch(userQuery, weatherData);
    }
    if (weatherData && restaurants.length > 0) {
      const weatherSuggestions = getWeatherFoodSuggestions(weatherData.category);
      restaurants.sort((a, b) => {
        const aMatchesWeather = a.weatherTags && a.weatherTags.some(tag => 
          weatherSuggestions.tags.includes(tag)
        );
        const bMatchesWeather = b.weatherTags && b.weatherTags.some(tag => 
          weatherSuggestions.tags.includes(tag)
        );
        if (aMatchesWeather && !bMatchesWeather) return -1;
        if (!aMatchesWeather && bMatchesWeather) return 1;
        return b.rating - a.rating;
      });
    }
    return restaurants;
  } catch (error) {
    console.error('RAG error:', error);
    throw error;
  }
};
module.exports = {
  getRecommendations,
  semanticSearch
};