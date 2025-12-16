import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './UserMenu.css';
const UserMenu = ({ onOpenLogin, onOpenRegister, onOpenFavorites, onOpenPreferences, onOpenProfile, onOpenReviews }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  if (!isAuthenticated) {
    return (
      <div className="user-menu-guest">
        <button className="login-btn" onClick={onOpenLogin}>
          Login
        </button>
        <button className="signup-btn" onClick={onOpenRegister}>
          Sign Up
        </button>
      </div>
    );
  }
  return (
    <div className="user-menu" ref={dropdownRef}>
      <button
        className="user-menu-trigger"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-label="User menu"
        aria-expanded={isDropdownOpen}
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="user-avatar"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="user-avatar-fallback"
          style={{ display: user?.avatar ? 'none' : 'flex' }}
        >
          {getInitials(user?.name || 'User')}
        </div>
        <span className="user-name">{user?.name || 'User'}</span>
        <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
      </button>
      {isDropdownOpen && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <div className="dropdown-user-info">
              <div className="dropdown-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <div className="dropdown-avatar-fallback">
                    {getInitials(user?.name || 'User')}
                  </div>
                )}
              </div>
              <div className="dropdown-user-details">
                <div className="dropdown-user-name">{user?.name}</div>
                <div className="dropdown-user-email">{user?.email}</div>
              </div>
            </div>
          </div>
          <div className="dropdown-divider"></div>
          <div className="dropdown-menu">
            <button 
              className="dropdown-item" 
              onClick={() => {
                setIsDropdownOpen(false);
                onOpenProfile?.();
              }}
            >
              <span className="dropdown-icon">👤</span>
              <span>My Profile</span>
            </button>
            <button 
              className="dropdown-item" 
              onClick={() => {
                setIsDropdownOpen(false);
                onOpenFavorites?.();
              }}
            >
              <span className="dropdown-icon">❤️</span>
              <span>My Favorites</span>
              {user?.favoriteRestaurants?.length > 0 && (
                <span className="dropdown-badge">
                  {user.favoriteRestaurants.length}
                </span>
              )}
            </button>
            <button 
              className="dropdown-item" 
              onClick={() => {
                setIsDropdownOpen(false);
                onOpenReviews?.();
              }}
            >
              <span className="dropdown-icon">⭐</span>
              <span>My Reviews</span>
            </button>
            <button 
              className="dropdown-item" 
              onClick={() => {
                setIsDropdownOpen(false);
                onOpenPreferences?.();
              }}
            >
              <span className="dropdown-icon">⚙️</span>
              <span>Preferences</span>
            </button>
          </div>
          <div className="dropdown-divider"></div>
          <div className="dropdown-footer">
            <button className="dropdown-item logout-item" onClick={handleLogout}>
              <span className="dropdown-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default UserMenu;
