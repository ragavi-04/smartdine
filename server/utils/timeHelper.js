const getCurrentMealTime = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) {
    return 'breakfast';
  } else if (hour >= 11 && hour < 16) {
    return 'lunch';
  } else if (hour >= 16 && hour < 19) {
    return 'snacks';
  } else if (hour >= 19 && hour < 23) {
    return 'dinner';
  } else {
    return 'late-night';
  }
};
const getMealTimeDisplay = (mealTime) => {
  const displays = {
    'breakfast': '🌅 Breakfast',
    'lunch': '☀️ Lunch',
    'snacks': '☕ Snacks',
    'dinner': '🌙 Dinner',
    'late-night': '🌃 Late Night',
    'dessert': '🍰 Dessert'
  };
  return displays[mealTime] || mealTime;
};
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good morning! Looking for breakfast?';
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon! Time for lunch?';
  } else if (hour >= 17 && hour < 21) {
    return 'Good evening! Dinner plans?';
  } else {
    return 'Late night cravings?';
  }
};
const getMealTimeEmoji = (mealTime) => {
  const emojis = {
    'breakfast': '🌅',
    'lunch': '☀️',
    'snacks': '☕',
    'dinner': '🌙',
    'late-night': '🌃',
    'dessert': '🍰'
  };
  return emojis[mealTime] || '🍽️';
};
module.exports = {
  getCurrentMealTime,
  getMealTimeDisplay,
  getTimeBasedGreeting,
  getMealTimeEmoji
};