import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_BACKEND_URL + '/api';

  useEffect(() => {
    // Only verify token on initial load if we have a stored token
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken && !token) {
      setToken(storedToken);
    } else if (!storedToken) {
      setLoading(false);
    }
  }, []); // Remove token dependency to avoid infinite loops

  useEffect(() => {
    // Verify token when it changes (but not on initial empty state)
    if (token) {
      verifyToken();
    }
  }, [token]); // Separate effect for token verification

  const verifyToken = async () => {
    try {
      const response = await axios.post(
        `${API_BASE}/auth/verify-token`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.valid) {
        setUser({
          id: response.data.user_id,
          username: response.data.username,
          role: response.data.role
        });
      } else {
        // Token is invalid, clear it
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        username,
        password
      });

      const { access_token } = response.data;
      
      // Store token in localStorage first
      localStorage.setItem('auth_token', access_token);
      
      // Then update state
      setToken(access_token);
      
      // Wait a moment to ensure token is set before verification
      setTimeout(async () => {
        try {
          // Verify the token to get user info
          await verifyToken();
        } catch (verifyError) {
          console.error('Token verification failed:', verifyError);
        }
      }, 500);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post(
        `${API_BASE}/auth/refresh-token`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { access_token } = response.data;
      setToken(access_token);
      localStorage.setItem('auth_token', access_token);
      
      return access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return null;
    }
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    refreshToken,
    isAdmin,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};