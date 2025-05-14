import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaUsers, FaMoneyBillWave, FaExternalLinkAlt, FaClock, FaCheck, FaTimes, FaPaperPlane } from 'react-icons/fa';

const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [proof, setProof] = useState('');
  
  // Fetch order details
  const { data, isLoading, isError, error } = useQuery(
    ['order', id],
    async () => {
      const res = await axios.get(`/api/orders/${id}`);
      return res.data.order;
    },
    {
      retry: 1,
      onError: (err) => {
        toast.error('অর্ডারের বিস্তারিত লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching order details:', err);
      }
    }
  );
  
  // Start task mutation
  const startTaskMutation = useMutation(
    async () => {
      const res = await axios.post(`/api/orders/${id}/start`);
      return res.data;
    },
    {
      onSuccess: () => {
        toast.success('আপনি সফলভাবে কাজে যোগ দিয়েছেন');
        queryClient.invalidateQueries(['order', id]);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'কাজে যোগ দিতে সমস্যা হয়েছে');
        console.error('Error starting task:', err);
      }
    }
  );
  
  // Submit proof mutation
  const submitProofMutation = useMutation(
    async () => {
      const res = await axios.post(`/api/orders/${id}/proof`, { proof });
      return res.data;
    },
    {
      onSuccess: () => {
        toast.success('প্রুফ সফলভাবে জমা দেওয়া হয়েছে');
        setProof('');
        queryClient.invalidateQueries(['order', id]);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'প্রুফ জমা দিতে সমস্যা হয়েছে');
        console.error('Error submitting proof:', err);
      }
    }
  );
  
  // Verify proof mutation
  const verifyProofMutation = useMutation(
    async ({ orderWorkerId, status }) => {
      const res = await axios.put(`/api/orders/proof/${orderWorkerId}`, { status });
      return res.data;
    },
    {
      onSuccess: (data, variables) => {
        toast.success(variables.status === 'APPROVED' ? 'প্রুফ অনুমোদিত হয়েছে' : 'প্রুফ প্রত্যাখ্যাত হয়েছে');
        queryClient.invalidateQueries(['order', id]);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'প্রুফ ভেরিফাই করতে সমস্যা হয়েছে');
        console.error('Error verifying proof:', err);
      }
    }
  );
  
  // Format order type
  const formatOrderType = (type) => {
    switch (type) {
      case 'DIGITAL_MARKETING':
        return 'ডিজিটাল মার্কেটিং';
      case 'APP':
        return 'অ্যাপস';
      case 'WEB_DEVELOPMENT':
        return 'ওয়েব ডেভেলপমেন্ট';
      default:
        return type;
    }
  };
  
  // Format order status
  const formatOrderStatus = (status) => {
    switch (status) {
      case 'PENDING':
        return 'অপেক্ষমান';
      case 'ACTIVE':
        return 'সক্রিয়';
      case 'COMPLETED':
        return 'সম্পূর্ণ';
      case 'CANCELLED':
        return 'বাতিল';
      default:
        return status;
    }
  };
  
  // Check if user is already a worker
  const isUserWorker = data?.workers?.some(w => w.worker.id === user?.id);
  
  // Get user's work status if they're a worker
  const userWork = data?.workers?.find(w => w.worker.id === user?.id);
  
  // Check if user is the order creator
  const isOrderCreator = data?.creator?.id === user?.id;
  
  // Handle start task
  const handleStartTask = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    startTaskMutation.mutate();
  };
  
  // Handle submit proof
  const handleSubmitProof = (e) => {
    e.preventDefault();
    if (!proof.trim()) {
      toast.error('প্রুফ দিতে হবে');
      return;
    }
    
    submitProofMutation.mutate();
  };
  
  // Handle verify proof
  const handleVerifyProof = (orderWorkerId, status) => {
    verifyProofMutation.mutate({ orderWorkerId, status });
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">অর্ডারের বিস্তারিত লোড করতে সমস্যা হয়েছে</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            হোম পেজে ফিরে যান
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Order status banner */}
      <div className={`mb-6 py-2 px-4 rounded-md ${
        data.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
        data.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
        data.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="font-medium">স্ট্যাটাস: {formatOrderStatus(data.status)}</span>
          <span className="text-sm">
            {data.status === 'ACTIVE' && (
              <>
                {data.workers.length} / {data.workerCount} জন কাজ করছে
              </>
            )}
            {data.status === 'COMPLETED' && 'অর্ডার সম্পূর্ণ হয়েছে'}
            {data.status === 'PENDING' && 'অর্ডার অপেক্ষমান'}
            {data.status === 'CANCELLED' && 'অর্ডার বাতিল করা হয়েছে'}
          </span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          {/* Order header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {formatOrderType(data.orderType)}
              </span>
              
              {/* Date */}
              <div className="flex items-center mt-1 text-gray-500 text-sm">
                <FaClock className="mr-1" />
                {new Date(data.createdAt).toLocaleDateString('bn-BD')}
              </div>
            </div>
            
            {/* Creator info */}
            <div className="flex items-center">
              <img 
                src={data.creator.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.creator.name)}`}
                alt={data.creator.name}
                className="h-10 w-10 rounded-full object-cover mr-2 border border-gray-200"
              />
              <div>
                <span className="text-sm font-medium text-gray-800">{data.creator.name}</span>
                <p className="text-xs text-gray-500">অর্ডার দাতা</p>
              </div>
            </div>
          </div>
          
          {/* Order title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {data.title}
          </h1>
          
          {/* Order description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">বিবরণ</h3>
            <p className="text-gray-600 whitespace-pre-line">
              {data.description}
            </p>
          </div>
          
          {/* Order details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">অর্ডার বিবরণ</h3>
              
              <div className="space-y-3">
                {data.link && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">লিংক:</span>
                    <a 
                      href={data.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      ভিজিট করুন <FaExternalLinkAlt className="ml-1 text-xs" />
                    </a>
                  </div>
                )}
                
                {data.platform && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">প্লাটফর্ম:</span>
                    <span className="text-gray-900">{data.platform}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">মোট ওয়ার্কার:</span>
                  <span className="text-gray-900">{data.workerCount} জন</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">প্রতি ওয়ার্কার রেট:</span>
                  <span className="text-gray-900">৳{data.ratePerWorker}</span>
                </div>
                
                <div className="flex justify-between font-medium">
                  <span className="text-gray-800">মোট বাজেট:</span>
                  <span className="text-gray-900">৳{data.totalBudget}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">প্রুফ নির্দেশাবলী</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">প্রুফ ধরন:</span>
                  <span className="text-gray-900">{data.proofType || 'স্ক্রিনশট'}</span>
                </div>
                
                {data.instructions && (
                  <div>
                    <span className="text-gray-600 block mb-1">অতিরিক্ত নির্দেশনা:</span>
                    <p className="text-gray-900 whitespace-pre-line">{data.instructions}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action section */}
          {data.status === 'ACTIVE' && !isOrderCreator && !isUserWorker && user?.role === 'WORKER' && (
            <div className="mt-6">
              <button
                onClick={handleStartTask}
                disabled={startTaskMutation.isLoading}
                className={`w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  startTaskMutation.isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {startTaskMutation.isLoading ? (
                  <span className="inline-block mr-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                ) : (
                  <>
                    <FaUsers className="mr-2" />
                  </>
                )}
                কাজে যোগ দিন
              </button>
            </div>
          )}
          
          {/* Proof submission section */}
          {isUserWorker && userWork.status === 'PENDING' && !userWork.proof && (
            <div className="mt-8 bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">প্রুফ জমা দিন</h3>
              
              <form onSubmit={handleSubmitProof}>
                <div className="mb-4">
                  <label htmlFor="proof" className="block text-sm font-medium text-gray-700 mb-1">
                    আপনার প্রুফ ({data.proofType || 'স্ক্রিনশট/লিংক'})
                  </label>
                  <textarea
                    id="proof"
                    value={proof}
                    onChange={(e) => setProof(e.target.value)}
                    placeholder="আপনার প্রুফ এখানে দিন। লিংক, ইউজারনেম, স্ক্রিনশট লিংক ইত্যাদি।"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    rows="4"
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={submitProofMutation.isLoading}
                  className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                    submitProofMutation.isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {submitProofMutation.isLoading ? (
                    <span className="inline-block mr-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" />
                    </>
                  )}
                  প্রুফ জমা দিন
                </button>
              </form>
            </div>
          )}
          
          {/* User's proof status */}
          {isUserWorker && (userWork.proof || userWork.status !== 'PENDING') && (
            <div className={`mt-8 p-6 rounded-lg ${
              userWork.status === 'APPROVED' ? 'bg-green-50' : 
              userWork.status === 'REJECTED' ? 'bg-red-50' : 
              'bg-blue-50'
            }`}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                আপনার কাজের স্ট্যাটাস
              </h3>
              
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-700 mb-1">আপনার জমা দেওয়া প্রুফ:</span>
                <p className="text-gray-800 bg-white p-3 rounded border border-gray-200 whitespace-pre-line">
                  {userWork.proof || 'প্রুফ জমা দেওয়া হয়নি'}
                </p>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium mr-2">স্ট্যাটাস:</span>
                {userWork.status === 'PENDING' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    অপেক্ষমান
                  </span>
                )}
                {userWork.status === 'APPROVED' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    অনুমোদিত
                  </span>
                )}
                {userWork.status === 'REJECTED' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    প্রত্যাখ্যাত
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Proof verification section for creator */}
          {isOrderCreator && data.workers.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                ওয়ার্কারদের প্রুফ ({data.workers.length}/{data.workerCount})
              </h3>
              
              <div className="space-y-4">
                {data.workers.map((worker) => (
                  <div 
                    key={worker.id} 
                    className={`border rounded-lg p-4 ${
                      worker.status === 'APPROVED' ? 'border-green-200 bg-green-50' : 
                      worker.status === 'REJECTED' ? 'border-red-200 bg-red-50' : 
                      'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <img 
                          src={worker.worker.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.worker.name)}`}
                          alt={worker.worker.name}
                          className="h-8 w-8 rounded-full object-cover mr-2 border border-gray-200"
                        />
                        <span className="font-medium text-gray-900">{worker.worker.name}</span>
                      </div>
                      
                      <div className="flex items-center">
                        {worker.status === 'PENDING' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            অপেক্ষমান
                          </span>
                        ) : worker.status === 'APPROVED' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            অনুমোদিত
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            প্রত্যাখ্যাত
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {worker.proof ? (
                      <div className="mb-3">
                        <span className="block text-sm font-medium text-gray-700 mb-1">প্রুফ:</span>
                        <p className="text-gray-800 bg-white p-3 rounded border border-gray-200 whitespace-pre-line">
                          {worker.proof}
                        </p>
                      </div>
                    ) : (
                      <p className="text-yellow-700 mb-3">প্রুফ জমা দেওয়া হয়নি</p>
                    )}
                    
                    {worker.status === 'PENDING' && worker.proof && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleVerifyProof(worker.id, 'APPROVED')}
                          disabled={verifyProofMutation.isLoading}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring
