import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaUser, FaPhone, FaBirthdayCake, FaImage, FaBriefcase, FaWhatsapp } from 'react-icons/fa';

const CompleteProfile = () => {
  const { user, completeProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    whatsapp: '',
    age: '',
    interests: [],
    profileImage: user?.profileImage || ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || '');
  
  // Interests options
  const interestOptions = [
    'ডিজিটাল মার্কেটিং',
    'সোশ্যাল মিডিয়া',
    'ওয়েব ডেভেলপমেন্ট',
    'মোবাইল অ্যাপ',
    'ভিডিও এডিটিং',
    'কন্টেন্ট ক্রিয়েশন',
    'গ্রাফিক ডিজাইন',
    'অ্যাফিলিয়েট মার্কেটিং'
  ];
  
  // Redirect if profile already complete
  useEffect(() => {
    if (isAuthenticated && user?.isCompleteProfile) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleInterestChange = (interest) => {
    setFormData(prev => {
      // Check if already selected
      if (prev.interests.includes(interest)) {
        return {
          ...prev,
          interests: prev.interests.filter(i => i !== interest)
        };
      } else {
        return {
          ...prev,
          interests: [...prev.interests, interest]
        };
      }
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          profileImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!formData.whatsapp) {
      toast.error('WhatsApp নম্বর দিতে হবে');
      return;
    }
    
    if (!formData.age || formData.age < 15) {
      toast.error('সঠিক বয়স দিতে হবে (কমপক্ষে ১৫ বছর)');
      return;
    }
    
    if (formData.interests.length < 1) {
      toast.error('কমপক্ষে একটি আগ্রহের বিষয় নির্বাচন করুন');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await completeProfile(formData);
      toast.success('প্রোফাইল আপডেট সফল হয়েছে');
      navigate('/');
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            প্রোফাইল সম্পূর্ণ করুন
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            আপনার প্রোফাইল সম্পূর্ণ করুন কাজ শুরু করার জন্য
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border-2 border-indigo-300">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="text-gray-400 text-5xl" />
              )}
            </div>
            
            <label htmlFor="profileImage" className="cursor-pointer text-indigo-600 hover:text-indigo-800 flex items-center space-x-2">
              <FaImage className="mr-2" />
              <span>প্রোফাইল ছবি আপলোড করুন</span>
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          
          {/* Form Fields */}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                নাম
              </label>
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <FaUser />
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm h-10"
                  placeholder="পূর্ণ নাম"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp নম্বর
              </label>
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <FaWhatsapp />
                </span>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  required
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm h-10"
                  placeholder="WhatsApp নম্বর"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                বয়স
              </label>
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <FaBirthdayCake />
                </span>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="15"
                  max="80"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm h-10"
                  placeholder="আপনার বয়স"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                আপনার আগ্রহের বিষয়
              </label>
              <div className="grid grid-cols-2 gap-2">
                {interestOptions.map((interest) => (
                  <div key={interest} className="flex items-center">
                    <input
                      id={`interest-${interest}`}
                      type="checkbox"
                      checked={formData.interests.includes(interest)}
                      onChange={() => handleInterestChange(interest)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`interest-${interest}`} className="ml-2 block text-sm text-gray-700">
                      {interest}
                    </label>
                  </div>
                ))}
              </div>
            </div>
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
              প্রোফাইল সম্পূর্ণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
