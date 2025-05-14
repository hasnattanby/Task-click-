import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { FaLink, FaMoneyBillWave, FaUsers, FaFileAlt, FaInfoCircle } from 'react-icons/fa';

const CreateDigitalMarketingOrder = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: '',
    link: '',
    workerCount: 10,
    ratePerWorker: 5,
    proofType: 'স্ক্রিনশট',
    instructions: ''
  });
  
  // Calculate total budget with 2% fee
  const subtotal = formData.workerCount * formData.ratePerWorker;
  const adminFee = subtotal * 0.02;
  const totalBudget = subtotal + adminFee;
  
  const createOrderMutation = useMutation(
    async () => {
      const orderData = {
        ...formData,
        orderType: 'DIGITAL_MARKETING'
      };
      
      const res = await axios.post('/api/orders', orderData);
      return res.data;
    },
    {
      onSuccess: (data) => {
        toast.success('অর্ডার সফলভাবে তৈরি করা হয়েছে');
        navigate(`/orders/${data.order.id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'অর্ডার তৈরি করতে সমস্যা হয়েছে');
        console.error('Error creating order:', error);
      }
    }
  );
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Parse numeric values
    if (name === 'workerCount' || name === 'ratePerWorker') {
      setFormData({
        ...formData,
        [name]: Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    createOrderMutation.mutate();
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-indigo-700 py-6 px-6">
          <h1 className="text-2xl font-bold text-white">
            ডিজিটাল মার্কেটিং অর্ডার তৈরি করুন
          </h1>
          <p className="text-indigo-100 mt-1">
            সাবস্ক্রাইব/ফলো/জয়েন/সাইন আপ, লাইক-কমেন্ট-শেয়ার, ভিডিও ওয়াচ, ইত্যাদি
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              অর্ডার টাইটেল *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="আপনার অর্ডারের একটি সংক্ষিপ্ত শিরোনাম"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              বিস্তারিত বিবরণ *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="আপনার কাজের বিস্তারিত বিবরণ দিন"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Platform */}
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                প্ল্যাটফর্ম নাম *
              </label>
              <input
                type="text"
                id="platform"
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                required
                placeholder="যেমন: YouTube, Facebook, Instagram, ইত্যাদি"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {/* Link */}
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
                লিংক *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLink className="text-gray-400" />
                </div>
                <input
                  type="url"
                  id="link"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  required
                  placeholder="https://example.com"
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Worker Count */}
            <div>
              <label htmlFor="workerCount" className="block text-sm font-medium text-gray-700 mb-1">
                ওয়ার্কার সংখ্যা *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUsers className="text-gray-400" />
                </div>
                <input
                  type="number"
                  id="workerCount"
                  name="workerCount"
                  value={formData.workerCount}
                  onChange={handleChange}
                  required
                  min="1"
                  max="1000"
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                কত জন ওয়ার্কার লাগবে
              </p>
            </div>
            
            {/* Rate Per Worker */}
            <div>
              <label htmlFor="ratePerWorker" className="block text-sm font-medium text-gray-700 mb-1">
                প্রতি ওয়ার্কার রেট (৳) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMoneyBillWave className="text-gray-400" />
                </div>
                <input
                  type="number"
                  id="ratePerWorker"
                  name="ratePerWorker"
                  value={formData.ratePerWorker}
                  onChange={handleChange}
                  required
                  min="1"
                  step="0.5"
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                প্রতি ওয়ার্কারকে কত টাকা দিবেন
              </p>
            </div>
          </div>
          
          {/* Proof Type */}
          <div className="mb-6">
            <label htmlFor="proofType" className="block text-sm font-medium text-gray-700 mb-1">
              প্রুফের ধরন *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFileAlt className="text-gray-400" />
              </div>
              <input
                type="text"
                id="proofType"
                name="proofType"
                value={formData.proofType}
                onChange={handleChange}
                required
                placeholder="যেমন: স্ক্রিনশট, ইউজারনেম, ইমেইল, ইত্যাদি"
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
