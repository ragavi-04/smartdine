import { Coffee, Sun, Sunset, Moon, Clock } from 'lucide-react';
const MealTimeFilter = ({ currentMealTime, onFilterByTime, onClearFilter, activeFilter }) => {
  const mealTimes = [
    { value: 'breakfast', label: 'Breakfast', icon: Coffee, emoji: '🌅' },
    { value: 'lunch', label: 'Lunch', icon: Sun, emoji: '☀️' },
    { value: 'snacks', label: 'Snacks', icon: Clock, emoji: '☕' },
    { value: 'dinner', label: 'Dinner', icon: Sunset, emoji: '🌙' },
    { value: 'late-night', label: 'Late Night', icon: Moon, emoji: '🌃' }
  ];
  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Clock size={20} className="text-orange-500" />
            Filter by Meal Time
          </h3>
          {activeFilter && (
            <button
              onClick={onClearFilter}
              className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
            >
              Clear Filter
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {mealTimes.map((time) => {
            const Icon = time.icon;
            const isActive = activeFilter === time.value;
            const isCurrent = currentMealTime === time.value;
            return (
              <button
                key={time.value}
                onClick={() => onFilterByTime(time.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                    : isCurrent
                    ? 'bg-orange-100 text-orange-700 border-2 border-orange-300 hover:bg-orange-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{time.emoji}</span>
                <span>{time.label}</span>
                {isCurrent && !isActive && (
                  <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                    Now
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {currentMealTime && !activeFilter && (
          <p className="text-sm text-gray-600 mt-3 text-center">
            💡 It's <span className="font-semibold text-orange-600">{currentMealTime}</span> time now!
            Click a meal time to filter restaurants.
          </p>
        )}
      </div>
    </div>
  );
};
export default MealTimeFilter;