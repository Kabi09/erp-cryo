import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cryo_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // On mount: check token validity if present
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('cryo_token');
      if (storedToken) {
        try {
          const response = await api.get('/employees/me');
          if (response.data?.success) {
            setUser(response.data.data);
            setToken(storedToken);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.success) {
      const { token: newToken, user: userData } = response.data.data;
      localStorage.setItem('cryo_token', newToken);
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(response.data?.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('cryo_token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

