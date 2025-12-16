import { MapPin, Star, Clock } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
const RestaurantCard = ({ restaurant, onClick, currentMealTime, weather, showAllergyInfo = false, onFavoriteChange, onLoginRequired }) => {
  const matchesCurrentTime = restaurant.mealTimes?.includes(currentMealTime);
  const matchesWeather = restaurant.matchesWeather;
  const isAllergySafe = restaurant.allergySafe;
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
  return (
    <div 
      onClick={() => onClick(restaurant)}
      className="card cursor-pointer transform hover:scale-105 transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        {/* Favorite Button */}
        <div className="absolute top-4 right-4 z-10">
          <FavoriteButton 
            restaurantId={restaurant._id}
            onLoginRequired={onLoginRequired}
            size="medium"
          />
        </div>
        <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <Star className="text-yellow-500 fill-yellow-500" size={16} />
          <span className="font-bold text-gray-800">{restaurant.rating}</span>
        </div>
        <div className="absolute top-14 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          {restaurant.priceRange}
        </div>
        {matchesWeather && weather && (
          <div className="absolute top-14 left-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
            <span>{weather.emoji}</span>
            Perfect for weather!
          </div>
        )}
        {matchesCurrentTime && (
          <div className="absolute bottom-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg animate-pulse">
            <Clock size={14} />
            Perfect Now!
          </div>
        )}
        {isAllergySafe && showAllergyInfo && (
          <div className="absolute bottom-4 right-4 bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
            <span>✓</span>
            Safe
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {restaurant.name}
        </h3>
        {restaurant.mealTimes && restaurant.mealTimes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {restaurant.mealTimes.map((mealTime, idx) => (
              <span
                key={idx}
                className={`text-xs px-2 py-1 rounded-full ${
                  mealTime === currentMealTime
                    ? 'bg-green-100 text-green-700 font-semibold'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {getMealTimeEmoji(mealTime)} {mealTime}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-3">
          {restaurant.cuisine.map((c, idx) => (
            <span
              key={idx}
              className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium"
            >
              {c}
            </span>
          ))}
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {restaurant.description}
        </p>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-orange-500" />
            <span>{restaurant.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-orange-500" />
            <span>{restaurant.openingHours}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 font-medium">Must Try:</p>
          <p className="text-orange-600 font-semibold">
            {restaurant.specialtyDishes.slice(0, 2).join(', ')}
          </p>
        </div>
        {/* Allergy Safe Indicator */}
        {isAllergySafe && showAllergyInfo && restaurant.safeForMessage && (
          <div className="mt-4 pt-4 border-t border-gray-200 bg-green-50 -mx-5 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-lg">✓</span>
              <div>
                <p className="text-sm font-bold text-green-700">Allergy Safe</p>
                <p className="text-xs text-green-600">{restaurant.safeForMessage}</p>
              </div>
            </div>
          </div>
        )}
        {/* Allergen Information (always show if restaurant has allergens) */}
        {!isAllergySafe && restaurant.allergens && restaurant.allergens.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-500 font-medium mb-1 flex items-center gap-1">
              <span className="text-red-500">⚠️</span>
              Contains:
            </p>
            <div className="flex flex-wrap gap-1">
              {restaurant.allergens.map((allergen, idx) => (
                <span
                  key={idx}
                  className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium border border-red-200"
                >
                  {allergen}
                </span>
              ))}
            </div>
          </div>
        )}
        {/* Allergen Friendly Options */}
        {restaurant.allergenFriendly && restaurant.allergenFriendly.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-500 font-medium mb-1 flex items-center gap-1">
              <span className="text-green-500">💚</span>
              Available:
            </p>
            <div className="flex flex-wrap gap-1">
              {restaurant.allergenFriendly.map((option, idx) => (
                <span
                  key={idx}
                  className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium"
                >
                  {option.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
        {restaurant.weatherTags && restaurant.weatherTags.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-500 font-medium mb-1">Weather Perfect:</p>
            <div className="flex flex-wrap gap-1">
              {restaurant.weatherTags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full text-xs font-medium"
                >
                  {tag.replace('-', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default RestaurantCard;