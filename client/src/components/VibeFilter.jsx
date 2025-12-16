import { Users, BookOpen, Heart, Baby, Coffee } from 'lucide-react';
const VibeFilter = ({ onFilterByVibe, onClearFilter, activeFilter }) => {
  const vibes = [
    { value: 'group-hangout', label: 'Group Hangout', icon: Users, emoji: '👥' },
    { value: 'quiet-study', label: 'Quiet Study', icon: BookOpen, emoji: '📚' },
    { value: 'romantic', label: 'Romantic', icon: Heart, emoji: '💕' },
    { value: 'family-friendly', label: 'Family-Friendly', icon: Baby, emoji: '👨‍👩‍👧‍👦' },
    { value: 'fun-cafe', label: 'Fun Cafe', icon: Coffee, emoji: '☕' }
  ];
  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Heart size={20} className="text-pink-500" />
            Filter by Vibe
          </h3>
          {activeFilter && (
            <button
              onClick={onClearFilter}
              className="text-sm text-gray-600 hover:text-pink-500 transition-colors"
            >
              Clear Filter
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {vibes.map((vibe) => {
            const Icon = vibe.icon;
            const isActive = activeFilter === vibe.value;
            return (
              <button
                key={vibe.value}
                onClick={() => onFilterByVibe(vibe.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-pink-100 hover:to-purple-100 hover:text-pink-700'
                }`}
              >
                <span className="text-xl">{vibe.emoji}</span>
                <span>{vibe.label}</span>
              </button>
            );
          })}
        </div>
        {!activeFilter && (
          <p className="text-sm text-gray-600 mt-3 text-center">
            💡 Click a vibe to find restaurants matching your mood!
          </p>
        )}
      </div>
    </div>
  );
};
export default VibeFilter;
