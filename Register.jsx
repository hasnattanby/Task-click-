import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaUser, FaKey, FaEnvelope, FaPhone, FaFlag } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'Bangladesh',
    password: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/complete-profile');
    }
  }, [isAuthenticated, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('পাসওয়ার্ড মিলছে না!');
      return;
    }
    
    // Validate password strength
    if (formData.password.length < 6) {
      toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      // Auth context will handle redirect
    } catch (error) {
      // Error is handled in auth context
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            নতুন একাউন্ট তৈরি করুন
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ইতিমধ্যে একাউন্ট আছে?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              লগইন করুন
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <FaUser />
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm h-10"
                  placeholder="নাম"
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <FaEnvelope />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm h-10"
                  placeholder="ইমেইল"
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <FaPhone />
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm h-10"
                  placeholder="ফোন নম্বর"
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <FaFlag />
                </span>
                <select
                  id="country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm h-10"
                >
                  <option value="Bangladesh">বাংলাদেশ</option>
                  <option value="India">ভারত</option>
                  <option value="Pakistan">পাকিস্তান</option>
                  <option value="Nepal">নেপাল</option>
                  <option value="Other">অন্যান্য</option>
                </select>
              </div>
            </div>
            
            <div>
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <FaKey />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm h-10"
                  placeholder="পাসওয়ার্ড"
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <FaKey />
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm h-10"
                  placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                />
              </div>
            </div>
          </div>

          <div className="text-sm text-center">
            <p className="text-gray-600">
              রেজিস্ট্রেশন করে আপনি আমাদের <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">শর্তাবলী</a> মেনে নিচ্ছেন
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : null}
              রেজিস্ট্রেশন করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
