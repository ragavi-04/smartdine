const axios = require('axios');
const MOCK_WEATHER_DATA = {
  temp: 25,
  condition: 'clear',
  description: 'Clear sky'
};
const getWeatherCategory = (temp, condition) => {
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm')) {
    return 'rainy';
  }
  if (temp >= 30) {
    return 'hot';
  } else if (temp <= 15) {
    return 'cold';
  } else {
    return 'pleasant';
  }
};
const getCurrentWeather = async (city = 'Coimbatore') => {
  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!API_KEY) {
      console.log('⚠️ No OpenWeather API key found. Using mock weather data.');
      console.log('💡 To use real weather: Add OPENWEATHER_API_KEY to your .env file');
      console.log('📝 Get free API key at: https://openweathermap.org/api');
      const conditions = [
        { temp: 35, condition: 'clear', description: 'Hot sunny day' },
        { temp: 28, condition: 'rain', description: 'Light rain' },
        { temp: 12, condition: 'clear', description: 'Cold and clear' },
        { temp: 22, condition: 'clear', description: 'Pleasant weather' }
      ];
      const mockWeather = conditions[Math.floor(Math.random() * conditions.length)];
      const category = getWeatherCategory(mockWeather.temp, mockWeather.condition);
      return {
        temperature: mockWeather.temp,
        condition: mockWeather.condition,
        description: mockWeather.description,
        category: category,
        city: city,
        isMockData: true
      };
    }
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const weatherData = response.data;
    const temp = weatherData.main.temp;
    const condition = weatherData.weather[0].main.toLowerCase();
    const description = weatherData.weather[0].description;
    const category = getWeatherCategory(temp, condition);
    return {
      temperature: temp,
      condition: condition,
      description: description,
      category: category,
      city: city,
      isMockData: false
    };
  } catch (error) {
    console.error('Weather API error:', error.message);
    const mockWeather = { temp: 25, condition: 'clear', description: 'Pleasant weather' };
    const category = getWeatherCategory(mockWeather.temp, mockWeather.condition);
    return {
      temperature: mockWeather.temp,
      condition: mockWeather.condition,
      description: mockWeather.description,
      category: category,
      city: city,
      isMockData: true,
      error: 'Using fallback weather data'
    };
  }
};
const getWeatherFoodSuggestions = (weatherCategory) => {
  const suggestions = {
    rainy: {
      tags: ['hot-soup', 'chai', 'pakoras', 'hot-beverages', 'comfort-food'],
      description: 'Perfect weather for hot soups, chai, and crispy pakoras!'
    },
    hot: {
      tags: ['cold-desserts', 'ice-cream', 'juices', 'refreshing', 'chilled'],
      description: 'Beat the heat with cold desserts, ice cream, and refreshing drinks!'
    },
    cold: {
      tags: ['hot-meals', 'soups', 'warm-food', 'comfort-food', 'hot-beverages'],
      description: 'Warm up with hot meals, soups, and comforting dishes!'
    },
    pleasant: {
      tags: [],
      description: 'Great weather for any cuisine!'
    }
  };
  return suggestions[weatherCategory] || suggestions.pleasant;
};
const getWeatherEmoji = (weatherCategory) => {
  const emojis = {
    rainy: '🌧️',
    hot: '☀️',
    cold: '❄️',
    pleasant: '⛅'
  };
  return emojis[weatherCategory] || '🌤️';
};
module.exports = {
  getCurrentWeather,
  getWeatherCategory,
  getWeatherFoodSuggestions,
  getWeatherEmoji
};
