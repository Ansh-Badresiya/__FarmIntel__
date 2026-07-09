import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from API if token exists
  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem('access_token');
      if (token) {
        try {
          // Verify token and get user info
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          if (error.response && error.response.status === 401) {
            console.error('Session expired or invalid token');
            sessionStorage.removeItem('access_token');
          } else {
            console.error('Network error or server restarting, keeping token');
          }
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;
      sessionStorage.setItem('access_token', access_token);
      
      // Fetch user profile immediately after login
      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
      return userRes.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Login failed';
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      // Auto-login after registration
      return await login(userData.email, userData.password);
    } catch (error) {
      throw error.response?.data?.detail || 'Registration failed';
    }
  };

  const logout = () => {
    sessionStorage.removeItem('access_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
