import { useState, useEffect } from 'react';
import './AllergyFilter.css';
const COMMON_ALLERGENS = [
  { id: 'dairy', label: 'Dairy', icon: '🥛' },
  { id: 'nuts', label: 'Nuts', icon: '🥜' },
  { id: 'gluten', label: 'Gluten', icon: '🌾' },
  { id: 'eggs', label: 'Eggs', icon: '🥚' },
  { id: 'soy', label: 'Soy', icon: '🫘' },
  { id: 'shellfish', label: 'Shellfish', icon: '🦐' },
  { id: 'fish', label: 'Fish', icon: '🐟' },
  { id: 'peanuts', label: 'Peanuts', icon: '🥜' }
];
const AllergyFilter = ({ onApplyFilters, initialFilters = [] }) => {
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [customIngredient, setCustomIngredient] = useState('');
  const [customIngredients, setCustomIngredients] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('allergyPreferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelectedAllergens(parsed.allergens || []);
        setCustomIngredients(parsed.custom || []);
      } else if (initialFilters.length > 0) {
        setSelectedAllergens(initialFilters);
      }
    } catch (error) {
      console.error('Error loading allergy preferences:', error);
    }
  }, [initialFilters]);
  useEffect(() => {
    if (selectedAllergens.length > 0 || customIngredients.length > 0) {
      const preferences = {
        allergens: selectedAllergens,
        custom: customIngredients
      };
      localStorage.setItem('allergyPreferences', JSON.stringify(preferences));
    }
  }, [selectedAllergens, customIngredients]);
  const handleAllergenToggle = (allergenId) => {
    setSelectedAllergens(prev => {
      if (prev.includes(allergenId)) {
        return prev.filter(id => id !== allergenId);
      } else {
        return [...prev, allergenId];
      }
    });
  };
  const handleAddCustomIngredient = () => {
    const ingredient = customIngredient.trim().toLowerCase();
    if (ingredient && !customIngredients.includes(ingredient)) {
      setCustomIngredients(prev => [...prev, ingredient]);
      setCustomIngredient('');
    }
  };
  const handleRemoveCustomIngredient = (ingredient) => {
    setCustomIngredients(prev => prev.filter(item => item !== ingredient));
  };
  const handleApply = () => {
    const allExclusions = [...selectedAllergens, ...customIngredients];
    onApplyFilters(allExclusions);
  };
  const handleClear = () => {
    setSelectedAllergens([]);
    setCustomIngredients([]);
    localStorage.removeItem('allergyPreferences');
    onApplyFilters([]);
  };
  const activeFilterCount = selectedAllergens.length + customIngredients.length;
  return (
    <div className="allergy-filter">
      <div className="allergy-filter-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="allergy-filter-title">
          <span className="allergy-icon">🚫</span>
          <span>Allergy & Ingredient Filters</span>
          {activeFilterCount > 0 && (
            <span className="active-count">{activeFilterCount} active</span>
          )}
        </div>
        <button className="expand-toggle" type="button">
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>
      {isExpanded && (
        <div className="allergy-filter-content">
          <p className="allergy-filter-description">
            Select allergens or ingredients to exclude from your search results
          </p>
          {/* Common Allergens */}
          <div className="allergen-grid">
            {COMMON_ALLERGENS.map(allergen => (
              <label 
                key={allergen.id} 
                className={`allergen-checkbox ${selectedAllergens.includes(allergen.id) ? 'checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedAllergens.includes(allergen.id)}
                  onChange={() => handleAllergenToggle(allergen.id)}
                />
                <span className="allergen-icon">{allergen.icon}</span>
                <span className="allergen-label">{allergen.label}</span>
                {selectedAllergens.includes(allergen.id) && (
                  <span className="check-mark">✓</span>
                )}
              </label>
            ))}
          </div>
          {/* Custom Ingredient Input */}
          <div className="custom-ingredient-section">
            <label className="custom-label">Other ingredients to avoid:</label>
            <div className="custom-input-group">
              <input
                type="text"
                value={customIngredient}
                onChange={(e) => setCustomIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomIngredient()}
                placeholder="e.g., mushrooms, cilantro"
                className="custom-input"
              />
              <button 
                type="button"
                onClick={handleAddCustomIngredient}
                className="add-button"
                disabled={!customIngredient.trim()}
              >
                Add
              </button>
            </div>
            {/* Custom Ingredient Pills */}
            {customIngredients.length > 0 && (
              <div className="custom-ingredients-list">
                {customIngredients.map(ingredient => (
                  <span key={ingredient} className="ingredient-pill">
                    {ingredient}
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomIngredient(ingredient)}
                      className="remove-pill"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="active-filters-display">
              <span className="active-filters-label">Excluding:</span>
              <div className="active-filters-tags">
                {selectedAllergens.map(id => {
                  const allergen = COMMON_ALLERGENS.find(a => a.id === id);
                  return (
                    <span key={id} className="filter-tag allergen-tag">
                      {allergen.icon} {allergen.label}
                    </span>
                  );
                })}
                {customIngredients.map(ingredient => (
                  <span key={ingredient} className="filter-tag custom-tag">
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Action Buttons */}
          <div className="allergy-filter-actions">
            <button 
              type="button"
              onClick={handleApply}
              className="apply-button"
              disabled={activeFilterCount === 0}
            >
              {activeFilterCount === 0 ? 'Select filters to apply' : `Apply ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''}`}
            </button>
            {activeFilterCount > 0 && (
              <button 
                type="button"
                onClick={handleClear}
                className="clear-button"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default AllergyFilter;
