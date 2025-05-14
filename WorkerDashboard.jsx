import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FaMoneyBillWave, FaTasks, FaRegCheckCircle, FaRegClock, FaRegTimesCircle, FaChartLine, FaTrophy, FaWallet, FaHistory, FaExclamationCircle, FaArrowRight } from 'react-icons/fa';
import { format } from 'date-fns';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('PAYPAL');
  const [accountInfo, setAccountInfo] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [newComplaint, setNewComplaint] = useState({ subject: '', description: '' });
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch earnings data
        const earningsRes = await axios.get('/api/workers/earnings');
        setEarnings(earningsRes.data.earnings);
        
        // Fetch task history
        const tasksRes = await axios.get('/api/workers/tasks');
        setTasks(tasksRes.data.tasks);
        
        // Fetch complaints
        const complaintsRes = await axios.get('/api/workers/complaints');
        setComplaints(complaintsRes.data.complaints);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('সঠিক উত্তোলনের পরিমাণ দিন');
      return;
    }
    
    if (parseFloat(withdrawAmount) > (earnings?.approvedBalance || 0)) {
      alert('আপনার ব্যালেন্সের চেয়ে বেশি উত্তোলন করা যাবে না');
      return;
    }
    
    if (!accountInfo) {
      alert('অ্যাকাউন্ট তথ্য দিন');
      return;
    }
    
    setWithdrawLoading(true);
    try {
      const res = await axios.post('/api/workers/withdraw', {
        amount: parseFloat(withdrawAmount),
        method: withdrawMethod,
        accountInfo
      });
      
      alert('উত্তোলনের অনুরোধ সফলভাবে পাঠানো হয়েছে');
      
      // Reset form
      setWithdrawAmount('');
      setAccountInfo('');
      
      // Update earnings
      setEarnings(prev => ({
        ...prev,
        approvedBalance: prev.approvedBalance - parseFloat(withdrawAmount),
        remainingBalance: prev.remainingBalance - parseFloat(withdrawAmount)
      }));
    } catch (error) {
      console.error('Withdraw error:', error);
      alert('উত্তোলনের অনুরোধে সমস্যা হয়েছে');
    } finally {
      setWithdrawLoading(false);
    }
  };
  
  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComplaint.subject || !newComplaint.description) {
      alert('বিষয় এবং বিবরণ দিন');
      return;
    }
    
    try {
      const res = await axios.post('/api/workers/complaints', newComplaint);
      
      // Add new complaint to list
      setComplaints([res.data.complaint, ...complaints]);
      
      // Reset form
      setNewComplaint({ subject: '', description: '' });
      
      alert('অভিযোগ সফলভাবে পাঠানো হয়েছে');
    } catch (error) {
      console.error('Complaint submission error:', error);
      alert('অভিযোগ পাঠাতে সমস্যা হয়েছে');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ওয়ার্কার ড্যাশবোর্ড</h1>
      
      {/* Dashboard Tabs */}
      <div className="flex overflow-x-auto mb-6 bg-white rounded-lg shadow">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'summary' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
        >
          সারসংক্ষেপ
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'tasks' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
        >
          কাজের ইতিহাস
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'withdraw' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
        >
          টাকা তোলা
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'complaints' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
        >
          অভিযোগ
        </button>
      </div>
      
      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Earnings Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <FaMoneyBillWave className="text-green-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">মোট আয়</h3>
                <p className="text-2xl font-bold text-green-600">${earnings?.totalEarned.toFixed(2) || '0.00'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600">অনুমোদিত</p>
                <p className="text-gray-900 font-medium">${earnings?.approvedBalance.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600">পেন্ডিং</p>
                <p className="text-gray-900 font-medium">${earnings?.pendingBalance.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
          
          {/* Tasks Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <FaTasks className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">কাজের সংখ্যা</h3>
                <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600">সম্পন্ন</p>
                <p className="text-gray-900 font-medium">{tasks.filter(t => t.status === 'APPROVED').length}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600">পেন্ডিং</p>
                <p className="text-gray-900 font-medium">{tasks.filter(t => t.status === 'PENDING').length}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600">বাতিল</p>
                <p className="text-gray-900 font-medium">{tasks.filter(t => t.status === 'REJECTED').length}</p>
              </div>
            </div>
          </div>
          
          {/* Ranking Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                <FaTrophy className="text-yellow-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">র‌্যাংকিং</h3>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-yellow-600">#12</p>
                  <p className="text-sm text-gray-500 ml-2">এই মাসে</p>
                </div>
              </div>
            </div>
            <div className="text-sm">
              <div className="bg-gray-50 p-2 rounded mb-2">
                <p className="text-gray-600">স্টার রেটিং</p>
                <div className="flex text-yellow-500 mt-1">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span className="text-gray-300">★</span>
                  <span className="text-gray-700 ml-1">4.2/5</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Withdraw Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                <FaWallet className="text-purple-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">টাকা তোলা</h3>
                <p className="text-2xl font-bold text-purple-600">${earnings?.withdrawnAmount.toFixed(2) || '0.00'}</p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">তোলার যোগ্য ব্যালেন্স</p>
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold text-gray-800">${earnings?.approvedBalance.toFixed(2) || '0.00'}</p>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 flex items-center"
                >
                  টাকা তুলুন <FaArrowRight className="ml-1" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Recent Activity Section */}
          <div className="md:col-span-2 lg:col-span-4 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-medium text-gray-800">সাম্প্রতিক কার্যক্রম</h3>
            </div>
            <div className="p-4">
              <div className="flow-root">
                <ul className="-mb-8">
                  {tasks.slice(0, 5).map((task, index) => (
                    <li key={task.id}>
                      <div className="relative pb-8">
                        {index < 4 && (
                          <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                        )}
                        <div className="relative flex items-start space-x-3">
                          <div className="relative">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              task.status === 'APPROVED' ? 'bg-green-100' : 
                              task.status === 'PENDING' ? 'bg-yellow-100' : 'bg-red-100'
                            }`}>
                              {task.status === 'APPROVED' ? (
                                <FaRegCheckCircle className="text-green-600" />
                              ) : task.status === 'PENDING' ? (
                                <FaRegClock className="text-yellow-600" />
                              ) : (
                                <FaRegTimesCircle className="text-red-600" />
                              )}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                <Link to={`/orders/${task.orderId}`} className="hover:underline">
                                  {task.orderTitle}
                                </Link>
                              </div>
                              <p className="mt-0.5 text-sm text-gray-500">
                                {format(new Date(task.completedAt || task.createdAt), 'dd/MM/yyyy hh:mm a')}
                              </p>
                            </div>
                            <div className="mt-2 text-sm text-gray-700">
                              <p>{task.taskType} কাজ সম্পন্ন করা হয়েছে</p>
                            </div>
                            <div className="mt-2 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                task.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                                task.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {task.status === 'APPROVED' ? 'অনুমোদিত' : 
                                 task.status === 'PENDING' ? 'পেন্ডিং' : 'বাতিল'}
                              </span>
                              {task.status === 'APPROVED' && (
                                <span className="ml-2 text-green-600 font-medium">${task.amount.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  সব কার্যক্রম দেখুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tasks History Tab */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium text-gray-800">কাজের ইতিহাস</h3>
            
            {/* Filter options could go here */}
            <div className="flex space-x-2">
              <select className="text-sm border-gray-300 rounded">
                <option>সব কাজ</option>
                <option>অনুমোদিত</option>
                <option>পেন্ডিং</option>
                <option>বাতিল</option>
              </select>
            </div>
          </div>
          
          {tasks.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                <FaTasks className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">কোন কাজ নেই</h3>
              <p className="text-gray-500 mb-4">আপনি এখনও কোন কাজ শুরু করেননি</p>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                কাজ খুঁজুন
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      অর্ডার
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      তারিখ
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      পরিমাণ
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      স্ট্যাটাস
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      প্রুফ
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      অ্যাকশন
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/orders/${task.orderId}`} className="text-sm text-indigo-600 hover:text-indigo-900 hover:underline">
                          {task.orderTitle}
                        </Link>
                        <p className="text-xs text-gray-500">{task.taskType}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(task.completedAt || task.createdAt), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${task.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                          task.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {task.status === 'APPROVED' ? 'অনুমোদিত' : 
                           task.status === 'PENDING' ? 'পেন্ডিং' : 'বাতিল'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.proof ? (
                          <button className="text-indigo-600 hover:text-indigo-900">
                            দেখুন
                          </button>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link to={`/orders/${task.orderId}`} className="text-indigo-600 hover:text-indigo-900">
                          বিস্তারিত
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Withdraw Tab */}
      {activeTab === 'withdraw' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Balance Info */}
   
