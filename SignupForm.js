import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert } from '../ui/alert';
import { getDeviceId } from '../../utils/deviceUtils';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await getDeviceId();
      setDeviceId(id);
    };
    
    fetchDeviceId();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.country || !formData.password) {
      setError('সবগুলো ফিল্ড পূরণ করুন');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('পাসওয়ার্ড মিলেনি');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('সঠিক ইমেইল দিন');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError('');
      
      const result = await signup({
        ...formData,
        deviceId
      });
      
      if (result.success) {
        navigate('/complete-profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'সাইন আপ করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">একাউন্ট খুলুন</h2>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">পূর্ণ নাম</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="আপনার নাম"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">ইমেইল</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">ফোন নম্বর</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="country">দেশ</Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="বাংলাদেশ"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password">পাসওয়ার্ড</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="******"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="******"
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'অপেক্ষা করুন...' : 'সাইন আপ করুন'}
          </Button>
          
          <p className="text-center mt-4">
            ইতিমধ্যে একাউন্ট আছে?{' '}
            <a 
              href="/login" 
              className="text-blue-600 hover:underline"
            >
              লগইন করুন
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
