import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { format } from 'date-fns';
import { FaBell, FaCheck, FaSpinner } from 'react-icons/fa';

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const navigate = useNavigate();
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_ORDER':
        return <span className="bg-blue-100 p-2 rounded-full text-blue-500">🛍️</span>;
      case 'PROOF_STATUS':
        return <span className="bg-green-100 p-2 rounded-full text-green-500">✅</span>;
      case 'PROOF_SUBMITTED':
        return <span className="bg-purple-100 p-2 rounded-full text-purple-500">📤</span>;
      case 'ORDER_COMPLETED':
        return <span className="bg-green-100 p-2 rounded-full text-green-500">🎉</span>;
      case 'PAYMENT_UPDATE':
        return <span className="bg-yellow-100 p-2 rounded-full text-yellow-500">💰</span>;
      case 'WITHDRAW_STATUS':
        return <span className="bg-indigo-100 p-2 rounded-full text-indigo-500">💳</span>;
      case 'URGENT_NOTICE':
        return <span className="bg-red-100 p-2 rounded-full text-red-500">⚠️</span>;
      default:
        return <span className="bg-gray-100 p-2 rounded-full text-gray-500">📢</span>;
    }
  };
  
  const handleClick = () => {
    // Mark as read
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    
    // Navigate to linked page if available
    if (notification.link) {
      navigate(notification.link);
    }
  };
  
  return (
    <div 
      className={`p-4 border-b ${notification.read ? 'bg-white' : 'bg-blue-50'} hover:bg-gray-50 cursor-pointer`}
      onClick={handleClick}
    >
      <div className="flex items-start">
        <div className="mr-4">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1">
          <p className={`text-sm ${notification.read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {format(new Date(notification.createdAt), 'PPpp')}
          </p>
        </div>
      </div>
    </div>
  );
};

const NotificationPage = () => {
  const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotification();
  
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  return (
    <div className="container mx-auto max-w-2xl pb-16">
      <div className="bg-white shadow-md rounded-md overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex justify-between items-center">
          <div className="flex items-center text-white">
            <FaBell className="mr-2" />
            <h1 className="text-xl font-semibold">নোটিফিকেশন</h1>
          </div>
          
          <button 
            onClick={markAllAsRead}
            className="text-white text-sm flex items-center hover:bg-indigo-700 py-1 px-3 rounded"
          >
            <FaCheck className="mr-1" />
            সব পঠিত হিসেবে চিহ্নিত করুন
          </button>
        </div>
        
        {/* Notification List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <FaSpinner className="text-indigo-600 text-2xl animate-spin mb-2" />
              <p className="text-gray-500">নোটিফিকেশন লোড হচ্ছে...</p>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map(notification => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
                onMarkAsRead={markAsRead}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
                <FaBell className="text-gray-400 text-2xl" />
              </div>
              <p className="text-gray-500">কোনো নোটিফিকেশন নেই</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
