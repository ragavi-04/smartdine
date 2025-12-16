import React, { useState } from 'react';
import { X, User, Mail, Calendar, Heart, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './UserProfilePage.css';
const UserProfilePage = ({ onClose }) => {
  const { user } = useAuth();
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-content" onClick={(e) => e.stopPropagation()}>
        <button className="profile-close" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="profile-header">
          <div className="profile-avatar-large">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="profile-avatar-fallback">
                {getInitials(user?.name || 'User')}
              </div>
            )}
          </div>
          <h2 className="profile-name">{user?.name || 'User'}</h2>
          <p className="profile-email">{user?.email || 'email@example.com'}</p>
        </div>
        <div className="profile-body">
          <div className="profile-section">
            <h3 className="profile-section-title">Account Information</h3>
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <User size={20} />
                </div>
                <div className="profile-info-details">
                  <span className="profile-info-label">Full Name</span>
                  <span className="profile-info-value">{user?.name || 'Not set'}</span>
                </div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <Mail size={20} />
                </div>
                <div className="profile-info-details">
                  <span className="profile-info-label">Email</span>
                  <span className="profile-info-value">{user?.email || 'Not set'}</span>
                </div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <Calendar size={20} />
                </div>
                <div className="profile-info-details">
                  <span className="profile-info-label">Member Since</span>
                  <span className="profile-info-value">{formatDate(user?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="profile-section">
            <h3 className="profile-section-title">Activity Stats</h3>
            <div className="profile-stats-grid">
              <div className="profile-stat-card">
                <div className="profile-stat-icon favorites">
                  <Heart size={24} />
                </div>
                <div className="profile-stat-details">
                  <span className="profile-stat-value">
                    {user?.favoriteRestaurants?.length || 0}
                  </span>
                  <span className="profile-stat-label">Favorites</span>
                </div>
              </div>
              <div className="profile-stat-card">
                <div className="profile-stat-icon reviews">
                  <Star size={24} />
                </div>
                <div className="profile-stat-details">
                  <span className="profile-stat-value">
                    {user?.reviewCount || 0}
                  </span>
                  <span className="profile-stat-label">Reviews</span>
                </div>
              </div>
            </div>
          </div>
          {user?.preferences && (
            <div className="profile-section">
              <h3 className="profile-section-title">Dining Preferences</h3>
              <div className="profile-preferences">
                {user.preferences.favoriteCuisines && user.preferences.favoriteCuisines.length > 0 && (
                  <div className="profile-pref-item">
                    <span className="profile-pref-label">Favorite Cuisines:</span>
                    <div className="profile-pref-tags">
                      {user.preferences.favoriteCuisines.map((cuisine, idx) => (
                        <span key={idx} className="profile-pref-tag cuisine">
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {user.preferences.priceRange && (
                  <div className="profile-pref-item">
                    <span className="profile-pref-label">Price Range:</span>
                    <span className="profile-pref-value">{user.preferences.priceRange}</span>
                  </div>
                )}
                {user.preferences.dietaryRestrictions && user.preferences.dietaryRestrictions.length > 0 && (
                  <div className="profile-pref-item">
                    <span className="profile-pref-label">Dietary Restrictions:</span>
                    <div className="profile-pref-tags">
                      {user.preferences.dietaryRestrictions.map((restriction, idx) => (
                        <span key={idx} className="profile-pref-tag dietary">
                          {restriction}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {user.preferences.preferredAmbiance && user.preferences.preferredAmbiance.length > 0 && (
                  <div className="profile-pref-item">
                    <span className="profile-pref-label">Preferred Ambiance:</span>
                    <div className="profile-pref-tags">
                      {user.preferences.preferredAmbiance.map((ambiance, idx) => (
                        <span key={idx} className="profile-pref-tag ambiance">
                          {ambiance}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default UserProfilePage;
