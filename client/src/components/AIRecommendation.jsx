import { Sparkles, Star, DollarSign, MapPin, TrendingUp } from 'lucide-react';
import './AIRecommendation.css';
const AIRecommendation = ({ recommendation, usingFallback }) => {
  const parseRecommendation = (text) => {
    const restaurants = [];
    const lines = text.split('\n');
    let currentRestaurant = null;
    let introText = '';
    let inIntro = true;
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        inIntro = false;
        if (currentRestaurant) {
          restaurants.push(currentRestaurant);
        }
        currentRestaurant = {
          name: trimmed.replace(/\*\*/g, ''),
          description: '',
          price: '',
          mustTry: '',
          rating: ''
        };
      }
      else if (trimmed.startsWith('Why it\'s perfect:') || trimmed.startsWith("Why it's perfect:")) {
        if (currentRestaurant) {
          currentRestaurant.description = trimmed.replace(/Why it'?s perfect:\s*/i, '');
        }
      }
      else if (trimmed.startsWith('Price:')) {
        if (currentRestaurant) {
          const parts = trimmed.split('|');
          currentRestaurant.price = parts[0].replace('Price:', '').trim();
          if (parts[1]) {
            currentRestaurant.mustTry = parts[1].replace('Must-try:', '').trim();
          }
        }
      }
      else if (trimmed.startsWith('Rating:')) {
        if (currentRestaurant) {
          currentRestaurant.rating = trimmed.replace('Rating:', '').trim();
        }
      }
      else if (inIntro && trimmed && !trimmed.startsWith('**')) {
        introText += (introText ? ' ' : '') + trimmed;
      }
    });
    if (currentRestaurant) {
      restaurants.push(currentRestaurant);
    }
    return { introText, restaurants };
  };
  const { introText, restaurants } = parseRecommendation(recommendation);
  if (restaurants.length === 0) {
    return (
      <div className="ai-recommendation-container">
        <div className="ai-recommendation-header">
          <Sparkles className="ai-icon" size={28} />
          <h2 className="ai-title">
            {usingFallback ? 'Smart Recommendations' : 'AI Recommendations'}
          </h2>
        </div>
        <div className="ai-intro-text">
          {recommendation}
        </div>
      </div>
    );
  }
  return (
    <div className="ai-recommendation-container">
      <div className="ai-recommendation-header">
        <div className="ai-header-content">
          <div className="ai-icon-wrapper">
            <Sparkles className="ai-icon animate-pulse" size={28} />
          </div>
          <div>
            <h2 className="ai-title">
              {usingFallback ? 'Smart Recommendations' : 'AI-Powered Recommendations'}
            </h2>
            <p className="ai-subtitle">Handpicked just for you</p>
          </div>
        </div>
        {!usingFallback && (
          <div className="ai-badge">
            <TrendingUp size={16} />
            <span>Top Picks</span>
          </div>
        )}
      </div>
      {introText && (
        <div className="ai-intro-text">
          <p>{introText}</p>
        </div>
      )}
      <div className="ai-restaurants-grid">
        {restaurants.map((restaurant, index) => (
          <div key={index} className="ai-restaurant-card">
            <div className="ai-card-number">{index + 1}</div>
            <h3 className="ai-restaurant-name">{restaurant.name}</h3>
            <div className="ai-restaurant-description">
              {restaurant.description}
            </div>
            <div className="ai-restaurant-meta">
              {restaurant.rating && (
                <div className="ai-meta-item rating">
                  <Star size={16} fill="#f59e0b" strokeWidth={0} />
                  <span>{restaurant.rating}</span>
                </div>
              )}
            </div>
            {restaurant.mustTry && (
              <div className="ai-must-try">
                <span className="ai-must-try-label">Must Try:</span>
                <span className="ai-must-try-dish">{restaurant.mustTry}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="ai-recommendation-footer">
        <p>💡 Scroll down to explore these restaurants and more</p>
      </div>
    </div>
  );
};
export default AIRecommendation;