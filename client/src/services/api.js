import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);
export const searchRestaurants = async (query) => {
  const response = await api.post('/search', { query });
  return response.data;
};
export const getAllRestaurants = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await api.get(`/restaurants?${params}`);
  return response.data;
};
export const getRestaurantById = async (id) => {
  const response = await api.get(`/restaurants/${id}`);
  return response.data;
};
export const surpriseMe = async () => {
  const response = await api.get('/search/surprise');
  return response.data;
};
export const getRestaurantsByCurrentTime = async () => {
  const response = await api.get('/restaurants/current-time');
  return response.data;
};
export const searchWithAllergyFilters = async (query, excludeIngredients) => {
  const response = await api.post('/search/exclude-ingredients', { 
    query, 
    excludeIngredients 
  });
  return response.data;
};
export const getRestaurantsForMap = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await api.get(`/restaurants/map?${params}`);
  return response.data;
};
export const getNearbyRestaurants = async (latitude, longitude, radius = 5) => {
  const response = await api.post('/restaurants/nearby', {
    latitude,
    longitude,
    radius
  });
  return response.data;
};
export default api;
