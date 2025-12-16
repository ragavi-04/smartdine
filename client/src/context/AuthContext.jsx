import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
const AuthContext = createContext(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };
  useEffect(() => {
    checkAuth();
  }, []);
  const checkAuth = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setLoading(false);
      return;
    }
    if (isTokenExpired(savedToken)) {
      console.log('Token expired, logging out');
      logout();
      return;
    }
    try {
      const response = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${savedToken}`
        }
      });
      if (response.data.success) {
        setUser(response.data.user);
        setToken(savedToken);
        setIsAuthenticated(true);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password
      });
      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(newUser);
        setIsAuthenticated(true);
        return { success: true, message: response.data.message };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(newUser);
        setIsAuthenticated(true);
        return { success: true, message: response.data.message };
      }
      return { success: false, message: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid email or password'
      };
    }
  };
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    api.post('/auth/logout').catch(err => console.error('Logout error:', err));
  };
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/update-profile', profileData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true, message: response.data.message };
      }
      return { success: false, message: 'Update failed' };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile'
      };
    }
  };
  const addFavorite = async (restaurantId) => {
    try {
      const response = await api.post(
        `/auth/favorites/${restaurantId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        setUser(prev => ({
          ...prev,
          favoriteRestaurants: response.data.favoriteRestaurants
        }));
        return { success: true, message: response.data.message };
      }
      return { success: false, message: 'Failed to add favorite' };
    } catch (error) {
      console.error('Add favorite error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add favorite'
      };
    }
  };
  const removeFavorite = async (restaurantId) => {
    try {
      const response = await api.delete(
        `/auth/favorites/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        setUser(prev => ({
          ...prev,
          favoriteRestaurants: response.data.favoriteRestaurants
        }));
        return { success: true, message: response.data.message };
      }
      return { success: false, message: 'Failed to remove favorite' };
    } catch (error) {
      console.error('Remove favorite error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove favorite'
      };
    }
  };
  const isFavorite = (restaurantId) => {
    if (!user || !user.favoriteRestaurants) return false;
    return user.favoriteRestaurants.some(
      fav => fav._id === restaurantId || fav === restaurantId
    );
  };
  const getFavorites = async () => {
    try {
      const response = await api.get('/auth/favorites', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        return {
          success: true,
          favorites: response.data.favorites,
          count: response.data.count
        };
      }
      return { success: false, favorites: [] };
    } catch (error) {
      console.error('Get favorites error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get favorites',
        favorites: []
      };
    }
  };
  const addSearchHistory = async (query, resultCount = 0, clickedRestaurants = []) => {
    if (!isAuthenticated) return;
    try {
      await api.post('/auth/search-history', {
        query,
        resultCount,
        clickedRestaurants
      });
    } catch (error) {
      console.error('Add search history error:', error);
    }
  };
  const getSearchHistory = async () => {
    try {
      const response = await api.get('/auth/search-history');
      return response.data.searchHistory || [];
    } catch (error) {
      console.error('Get search history error:', error);
      return [];
    }
  };
  const clearSearchHistory = async () => {
    try {
      await api.delete('/auth/search-history');
      return { success: true };
    } catch (error) {
      console.error('Clear search history error:', error);
      return { success: false };
    }
  };
  const deleteSearchHistoryItem = async (id) => {
    try {
      const response = await api.delete(`/auth/search-history/${id}`);
      return { success: true, searchHistory: response.data.searchHistory };
    } catch (error) {
      console.error('Delete search history item error:', error);
      return { success: false };
    }
  };
  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
    checkAuth,
    addFavorite,
    removeFavorite,
    isFavorite,
    getFavorites,
    addSearchHistory,
    getSearchHistory,
    clearSearchHistory,
    deleteSearchHistoryItem
  };
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
