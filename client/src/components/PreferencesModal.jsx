import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import './PreferencesModal.css';
const PreferencesModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('cuisine');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preferences, setPreferences] = useState({
    favoriteCuisines: [],
    priceRange: [],
    dietaryRestrictions: [],
    excludeIngredients: [],
    preferredAmbiance: []
  });
  useEffect(() => {
    if (user?.preferences) {
      setPreferences({
        favoriteCuisines: user.preferences.favoriteCuisines || [],
        priceRange: user.preferences.priceRange || [],
        dietaryRestrictions: user.preferences.dietaryRestrictions || [],
        excludeIngredients: user.preferences.excludeIngredients || [],
        preferredAmbiance: user.preferences.preferredAmbiance || []
      });
    }
  }, [user]);
  const cuisineOptions = [
    'Italian', 'Chinese', 'Japanese', 'Mexican', 'Indian', 
    'Thai', 'French', 'American', 'Mediterranean', 'Korean',
    'Vietnamese', 'Greek', 'Spanish', 'Middle Eastern', 'Brazilian'
  ];
  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 
    'Nut-Free', 'Halal', 'Kosher', 'Keto', 'Paleo'
  ];
  const ambianceOptions = [
    'Casual', 'Fine Dining', 'Romantic', 'Family-Friendly',
    'Quick Service', 'Outdoor Seating', 'Bar/Lounge', 'Quiet'
  ];
  const allergenOptions = [
    'Peanuts', 'Tree Nuts', 'Shellfish', 'Fish', 'Eggs',
    'Milk', 'Soy', 'Wheat', 'Sesame', 'Gluten'
  ];
  const toggleArrayItem = (array, item) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };
  const handleCuisineToggle = (cuisine) => {
    setPreferences(prev => ({
      ...prev,
      favoriteCuisines: toggleArrayItem(prev.favoriteCuisines, cuisine)
    }));
  };
  const handlePriceToggle = (price) => {
    setPreferences(prev => ({
      ...prev,
      priceRange: toggleArrayItem(prev.priceRange, price)
    }));
  };
  const handleDietaryToggle = (restriction) => {
    setPreferences(prev => ({
      ...prev,
      dietaryRestrictions: toggleArrayItem(prev.dietaryRestrictions, restriction)
    }));
  };
  const handleAllergenToggle = (allergen) => {
    setPreferences(prev => ({
      ...prev,
      excludeIngredients: toggleArrayItem(prev.excludeIngredients, allergen)
    }));
  };
  const handleAmbianceToggle = (ambiance) => {
    setPreferences(prev => ({
      ...prev,
      preferredAmbiance: toggleArrayItem(prev.preferredAmbiance, ambiance)
    }));
  };
  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await updateProfile({ preferences });
      setSuccess('Preferences saved successfully!');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };
  const handleReset = () => {
    setPreferences({
      favoriteCuisines: [],
      priceRange: [],
      dietaryRestrictions: [],
      excludeIngredients: [],
      preferredAmbiance: []
    });
  };
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="preferences-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preferences-header">
          <h2>My Preferences</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <div className="preferences-tabs">
          <button
            className={`tab ${activeTab === 'cuisine' ? 'active' : ''}`}
            onClick={() => setActiveTab('cuisine')}
          >
            🍽️ Cuisine
          </button>
          <button
            className={`tab ${activeTab === 'dietary' ? 'active' : ''}`}
            onClick={() => setActiveTab('dietary')}
          >
            🥗 Dietary
          </button>
          <button
            className={`tab ${activeTab === 'priceAmbiance' ? 'active' : ''}`}
            onClick={() => setActiveTab('priceAmbiance')}
          >
            💰 Price & Vibe
          </button>
        </div>
        <div className="preferences-content">
          {activeTab === 'cuisine' && (
            <div className="tab-panel">
              <h3>Favorite Cuisines</h3>
              <p className="tab-description">
                Select your favorite cuisines. We'll boost these in your search results.
              </p>
              <div className="options-grid">
                {cuisineOptions.map(cuisine => (
                  <label key={cuisine} className="option-checkbox">
                    <input
                      type="checkbox"
                      checked={preferences.favoriteCuisines.includes(cuisine)}
                      onChange={() => handleCuisineToggle(cuisine)}
                    />
                    <span>{cuisine}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'dietary' && (
            <div className="tab-panel">
              <h3>Dietary Restrictions</h3>
              <p className="tab-description">
                Select dietary preferences and allergens to avoid.
              </p>
              <div className="dietary-section">
                <h4>Dietary Preferences</h4>
                <div className="options-grid">
                  {dietaryOptions.map(restriction => (
                    <label key={restriction} className="option-checkbox">
                      <input
                        type="checkbox"
                        checked={preferences.dietaryRestrictions.includes(restriction)}
                        onChange={() => handleDietaryToggle(restriction)}
                      />
                      <span>{restriction}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="dietary-section">
                <h4>Allergens to Avoid</h4>
                <div className="options-grid">
                  {allergenOptions.map(allergen => (
                    <label key={allergen} className="option-checkbox danger">
                      <input
                        type="checkbox"
                        checked={preferences.excludeIngredients.includes(allergen)}
                        onChange={() => handleAllergenToggle(allergen)}
                      />
                      <span>{allergen}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'priceAmbiance' && (
            <div className="tab-panel">
              <div className="dietary-section">
                <h3>Price Range</h3>
                <p className="tab-description">
                  Select your preferred price ranges (per person).
                </p>
                <div className="price-options">
                  {[
                    { symbol: '₹', label: 'Budget (Under ₹300)' },
                    { symbol: '₹₹', label: 'Moderate (₹300-600)' },
                    { symbol: '₹₹₹', label: 'Upscale (₹600-1200)' },
                    { symbol: '₹₹₹₹', label: 'Fine Dining (₹1200+)' }
                  ].map(price => (
                    <label key={price.symbol} className="option-checkbox price" title={price.label}>
                      <input
                        type="checkbox"
                        checked={preferences.priceRange.includes(price.symbol)}
                        onChange={() => handlePriceToggle(price.symbol)}
                      />
                      <div className="price-content">
                        <span className="price-symbol">{price.symbol}</span>
                        <span className="price-label">{price.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="dietary-section">
                <h3>Preferred Ambiance</h3>
                <p className="tab-description">
                  Select the vibes you enjoy most.
                </p>
                <div className="options-grid">
                  {ambianceOptions.map(ambiance => (
                    <label key={ambiance} className="option-checkbox">
                      <input
                        type="checkbox"
                        checked={preferences.preferredAmbiance.includes(ambiance)}
                        onChange={() => handleAmbianceToggle(ambiance)}
                      />
                      <span>{ambiance}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="preferences-footer">
          <button className="btn-reset" onClick={handleReset}>
            Reset All
          </button>
          <div className="footer-actions">
            <button className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-save" onClick={handleSave} disabled={loading}>
              {loading ? <LoadingSpinner size="small" /> : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PreferencesModal;
