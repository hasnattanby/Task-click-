import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaArrowLeft, FaUsers, FaDollarSign, FaLink, FaClipboard, FaCheckCircle, FaTimesCircle, FaClock, FaImage, FaUser } from 'react-icons/fa';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proof, setProof] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`/api/orders/${id}`);
        setOrder(response.data.order);
        setWorkers(response.data.order.workers || []);
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast.error('অর্ডার বিবরণ লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id]);
  
  // Check if user has already joined this order
  const userHasJoined = () => {
    return workers.some(worker => worker.workerId === user.id);
  };
  
  // Get user's work status in this order
  const getUserWorkStatus = () => {
    const work = workers.find(worker => worker.workerId === user.id);
    return work ? work.status : null;
  };
  
  // Copy link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(order.link);
    toast.success('লিংক কপি করা হয়েছে');
  };
  
  // Join order (start task)
  const handleJoinOrder = async () => {
    if (userHasJoined()) {
      setActiveTab('mywork');
      return;
    }
    
    setIsJoining(true);
    try {
      await axios.post(`/api/orders/${id}/join`);
      toast.success('আপনি সফলভাবে কাজে যোগ দিয়েছেন');
      
      // Refresh workers list
      const response = await axios.get(`/api/orders/${id}`);
      setWorkers(response.data.order.workers || []);
      setActiveTab('mywork');
    } catch (error) {
      console.error('Error joining order:', error);
      toast.error(error.response?.data?.message || 'কাজে যোগ দিতে সমস্যা হয়েছে');
    } finally {
      setIsJoining(false);
    }
  };
  
  // Submit proof
  const handleSubmitProof = async (e) => {
    e.preventDefault();
    
    if (!proof) {
      toast.error('প্রুফ দিতে হবে');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await axios.post(`/api/orders/${id}/proof`, { proof });
      toast.success('প্রুফ সফলভাবে জমা দেওয়া হয়েছে');
      
      // Refresh workers list
      const response = await axios.get(`/api/orders/${id}`);
      setWorkers(response.data.order.workers || []);
      setProof('');
    } catch (error) {
      console.error('Error submitting proof:', error);
      toast.error(error.response?.data?.message || 'প্রুফ জমা দিতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Verify worker proof
  const handleVerifyProof = async (workerId, status) => {
    try {
      await axios.put(`/api/orders/${id}/verify/${workerId}`, { status });
      toast.success(status === 'APPROVED' ? 'প্রুফ অনুমোদিত হয়েছে' : 'প্রুফ প্রত্যাখ্যাত হয়েছে');
      
      // Refresh workers list
      const response = await axios.get(`/api/orders/${id}`);
      setWorkers(response.data.order.workers || []);
    } catch (error) {
      console.error('Error verifying proof:', error);
      toast.error('প্রুফ ভেরিফাই করতে সমস্যা হয়েছে');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-150px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
            <FaTimesCircle className="text-3xl text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">অর্ডার পাওয়া যায়নি</h3>
          <p className="text-gray-500 mb-4">এই আইডি দিয়ে কোন অর্ডার খুঁজে পাওয়া যায়নি</p>
          <Link to="/orders" className="text-indigo-600 hover:text-indigo-800">
            সব অর্ডার দেখুন
          </Link>
        </div>
      </div>
    );
  }
  
  const workStatus = getUserWorkStatus();
  const canSubmitProof = userHasJoined() && (!workStatus || workStatus === 'PENDING');
  const canJoinOrder = !userHasJoined() && 
                      order.status === 'ACTIVE' && 
                      user.role === 'WORKER' && 
                      workers.length < order.workerCount;
  const isOrderCreator = order.creatorId === user.id;
  
  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 text-gray-600 hover:text-indigo-600"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 truncate">{order.title}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">বিবরণ</TabsTrigger>
              {userHasJoined() && <TabsTrigger value="mywork">আমার কাজ</TabsTrigger>}
              {isOrderCreator && <TabsTrigger value="workers">ওয়ার্কারস</TabsTrigger>}
            </TabsList>
            
            {/* Details Tab */}
            <TabsContent value="details" className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'ACTIVE' ? 'অ্যাকটিভ' :
                       order.status === 'PENDING' ? 'বিচারাধীন' :
                       order.status === 'COMPLETED' ? 'সম্পন্ন' : 'বাতিল'}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    তৈরি: {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <div className="rounded-full bg-indigo-100 p-2 mt-1">
                      <FaLink className="text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">লিংক:</p>
                      <div className="flex items-center">
                        <a 
                          href={order.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-indigo-600 hover:text-indigo-800 truncate mr-2"
                        >
                          {order.link}
                        </a>
                        <button 
                          onClick={handleCopyLink}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FaClipboard />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="rounded-full bg-green-100 p-2 mt-1">
                      <FaUsers className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">ওয়ার্কার:</p>
                      <p className="font-medium">
                        {workers.length} / {order.workerCount} জন
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="rounded-full bg-purple-100 p-2 mt-1">
                      <FaDollarSign className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">প্রতি ওয়ার্কার রেট:</p>
                      <p className="font-medium">${order.ratePerWorker}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="rounded-full bg-blue-100 p-2 mt-1">
                      <FaImage className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">প্রুফ টাইপ:</p>
                      <p className="font-medium">
                        {order.proofType === 'SCREENSHOT' ? 'স্ক্রিনশট' : 
                         order.proofType === 'USERNAME' ? 'ইউজারনেম/ইমেইল' : 'ভিডিও রেকর্ডিং'}
                      </p>
                    </div>
                  </div>
                  
                  {order.description && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">বিবরণ:</h3>
                      <p className="text-gray-600 whitespace-pre-line">{order.description}</p>
                    </div>
                  )}
                  
                  {order.instructions && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">নির্দেশনা:</h3>
                      <p className="text-gray-600 whitespace-pre-line">{order.instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* My Work Tab */}
            {userHasJoined() && (
              <TabsContent value="mywork" className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">আমার কাজের স্টেটাস</h2>
                  
                  <div className="mb-6">
                    <div className={`p-4 rounded-md ${
                      workStatus === 'APPROVED' ? 'bg-green-50' :
                      workStatus === 'REJECTED' ? 'bg-red-50' : 'bg-yellow-50'
                    }`}>
                      <div className="flex items-center">
                        {workStatus === 'APPROVED' ? (
                          <FaCheckCircle className="text-xl text-green-500 mr-3" />
                        ) : workStatus === 'REJECTED' ? (
                          <FaTimesCircle className="text-xl text-red-500 mr-3" />
                        ) : (
                          <FaClock className="text-xl text-yellow-500 mr-3" />
                        )}
                        
                        <div>
                          <p className={`font-medium ${
                            workStatus === 'APPROVED' ? 'text-green-800' :
                            workStatus === 'REJECTED' ? 'text-red-800' : 'text-yellow-800'
                          }`}>
                            {workStatus === 'APPROVED' ? 'অনুমোদিত!' :
                             workStatus === 'REJECTED' ? 'প্রত্যাখ্যাত' : 'বিচারাধীন'}
                          </p>
                          <p className="text-sm mt-1 text-gray-600">
                            {workStatus === 'APPROVED' ? 'আপনার প্রুফ অনুমোদিত হয়েছে! আপনি টাকা পাবেন।' :
                             workStatus === 'REJECTED' ? 'আপনার প্রুফ প্রত্যাখ্যাত হয়েছে। কারণ জানতে অর্ডার প্রদানকারীর সাথে যোগাযোগ করুন।' : 'আপনার প্রুফ পর্যালোচনা করা হচ্ছে। কিছুক্ষণ অপেক্ষা করুন।'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Proof submission form */}
                  {canSubmitProof && (
                    <div>
                      <h3 className="text-md font-medium text-gray-700 mb-3">আপনার প্রুফ জমা দিন:</h3>
                      
                      <form onSubmit={handleSubmitProof}>
                        <div className="mb-4">
                          <label htmlFor="proof" className="block text-sm font-medium text-gray-700 mb-1">
                            {order.proofType === 'SCREENSHOT' ? 'স্ক্রিনশট লিংক' : 
                             order.proofType === 'USERNAME' ? 'ইউজারনেম/ইমেইল' : 'ভিডিও রেকর্ডিং লিংক'}
                          </label>
                          <input
                            type="text"
                            id="proof"
                            value={proof}
                            onChange={(e) => setProof(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder={order.proofType === 'SCREENSHOT' ? 'স্ক্রিনশট লিংক দিন' : 
                                         order.proofType === 'USERNAME' ? 'ব্যবহৃত ইউজারনেম/ইমেইল লিখুন' : 'ভিডিও রেকর্ডিং লিংক দিন'}
                            required
                          />
                        </div>
                        
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              প্রক্রিয়াকরণ হচ্ছে...
                            </>
                          ) : 'প্রুফ জমা দিন'}
                        </button>
                      </form>
                    </div>
                  )}
                  
                  {/* Show submitted proof */}
                  {userHasJoined() && workers.find(w => w.workerId === user.id)?.proof && (
                    <div className="mt-6">
                      <h3 className="text-md font-medium text-gray-700 mb-3">জমা দেওয়া প্রুফ:</h3>
                      <div className="p-4 bg-gray-50 rounded-md">
                        <p className="text-gray-700">{workers.find(w => w.workerId === user.id)?.proof}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          জমা দেওয়া হয়েছে: {new Date(workers.find(w => w.workerId === user.id)?.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            )}
            
            {/* Workers Tab (for order creator) */}
            {isOrderCreator && (
              <TabsContent value="workers" className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">ওয়ার্কারস ({workers.length}/{order.workerCount})</h2>
                  
                  {workers.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="inline-block p-3 bg-gray-100 rounded-full mb-3">
                        <FaUsers className="text-2xl text-gray-400" />
                      </div>
                      <p className="text-gray-500">এখনও কোন ওয়ার্কার কাজে যোগ দেয়নি</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {workers.map((worker) => (
                        <div key={worker.id} className="py-4">
                          <div className="flex items-start">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                              {worker.worker?.profileImage ? (
                                <img 
                                  src={worker.worker.profileImage} 
                                  alt={worker.worker.name} 
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <FaUser className="text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">{worker.worker?.name}</span>
                                <div>
                                  {worker.status === 'APPROVED' ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <FaCheckCircle className="mr-1" /> অনুমোদিত
                                    </span>
                                  ) : worker.status === 'REJECTED' ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      <FaTimesCircle className="mr-1" /> প্রত্যাখ্যাত
                                    </span>
                                  ) : worker.proof ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      <FaClock className="mr-1" /> পর্যালোচনা বাকি
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      <FaClock className="mr-1" /> কাজ চলছে
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {worker.proof && (
                           
