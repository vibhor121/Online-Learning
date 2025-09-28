import api from './api';

const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  PROFILE: '/auth/profile',
  UPDATE_PROFILE: '/auth/profile',
  CHANGE_PASSWORD: '/auth/change-password',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
};

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
    const { token, user } = response.data;
    
    // Store token and user data
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
    const { token, user } = response.data;
    
    // Store token and user data
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      await api.post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get(AUTH_ENDPOINTS.PROFILE);
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put(AUTH_ENDPOINTS.UPDATE_PROFILE, userData);
    
    // Update stored user data
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, passwordData);
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post(AUTH_ENDPOINTS.REFRESH_TOKEN);
    const { token } = response.data;
    
    if (token) {
      localStorage.setItem('token', token);
    }
    
    return response.data;
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      return null;
    }
  },

  // Get current token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Check if user has specific role
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user && user.role === role;
  },

  // Check if user has any of the specified roles
  hasAnyRole: (roles) => {
    const user = authService.getCurrentUser();
    return user && roles.includes(user.role);
  },
};

export default authService;



