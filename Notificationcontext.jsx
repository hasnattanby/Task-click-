import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Configure axios with token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);
  
  // Check user on mount
  useEffect(() => {
    const getUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await axios.get('/api/users/me');
        setUser(res.data.user);
      } catch (err) {
        console.error('Auth error:', err);
        setToken(null);
        setError(err.response?.data?.message || 'Authentication error');
      } finally {
        setLoading(false);
      }
    };
    
    getUser();
  }, [token]);
  
  // Register user
  const register = async (userData) => {
    setLoading(true);
    try {
      // Get device ID (generate unique ID for this device)
      const deviceId = localStorage.getItem('deviceId') || 
                      crypto.randomUUID();
      localStorage.setItem('deviceId', deviceId);
      
      const res = await axios.post('/api/auth/register', {
        ...userData,
        deviceId
      });
      
      setToken(res.data.token);
      setUser(res.data.user);
      toast.success('রেজিস্ট্রেশন সফল হয়েছে');
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Login user
  const login = async (credentials) => {
    setLoading(true);
    try {
      // Get device ID
      const deviceId = localStorage.getItem('deviceId') || 
                      crypto.randomUUID();
      localStorage.setItem('deviceId', deviceId);
      
      const res = await axios.post('/api/auth/login', {
        ...credentials,
        deviceId
      });
      
      setToken(res.data.token);
      setUser(res.data.user);
      toast.success('লগইন সফল হয়েছে');
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'লগইন ব্যর্থ হয়েছে';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Complete user profile
  const completeProfile = async (profileData) => {
    setLoading(true);
    try {
      const res = await axios.put('/api/auth/complete-profile', profileData);
      setUser(res.data.user);
      toast.success('প্রোফাইল আপডেট সফল হয়েছে');
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'প্রোফাইল আপডেট ব্যর্থ হয়েছে';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
    toast.success('লগআউট সফল হয়েছে');
  };
  
  // Update profile image
  const updateProfileImage = (imageUrl) => {
    setUser((prev) => ({ ...prev, profileImage: imageUrl }));
  };
  
  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    register,
    login,
    logout,
    completeProfile,
    updateProfileImage
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
