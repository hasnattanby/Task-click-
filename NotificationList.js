import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserNotifications, markAsRead, markAllAsRead } from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Spinner } from '../ui/spinner';
import { BellIcon, CheckIcon } from '../icons';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  
  const fetchNotifications = async (pageNum = 0) => {
    try {
      setLoading(true);
      setError('');
      
      const result = await getUserNotifications(pageNum * 20);
      
      if (result.success) {
        if (pageNum === 0) {
          setNotifications(result.notifications);
        } else {
          setNotifications(prev => [...prev, ...result.notifications]);
        }
        setHasMore(result.hasMore);
      }
    } catch (err) {
      setError('নোটিফিকেশন লোড করতে সমস্যা হয়েছে');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchNotifications();
    
    // Set up socket for real-time notifications
    const socket = new WebSocket('ws://localhost:5000');
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'newNotification') {
        setNotifications(prev => [data.notification, ...prev]);
      }
    };
    
    return () => {
      socket.close();
    };
  }, []);
  
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
    fetchNotifications(page + 1);
  };
  
  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };
  
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_ORDER':
        return '🛒';
      case 'PROOF_STATUS':
        return '📝';
      case 'PROOF_SUBMITTED':
        return '📤';
      case 'ORDER_COMPLETED':
        return '✅';
      case 'POLICY_UPDATE':
        return '📜';
      case 'COMPLAINT_RESPONSE':
        return '💬';
      case 'PAYMENT_UPDATE':
        return '💰';
      case 'WITHDRAW_STATUS':
        return '💳';
      case 'RANKING_UPDATE':
        return '🏆';
      case 'REFERRAL_BONUS':
        return '🎁';
      case 'MAINTENANCE':
        return '🔧';
      case 'URGENT_NOTICE':
        return '⚠️';
      case 'ADMIN_NOTIFICATION':
        return '👑';
      default:
        return '🔔';
    }
  };
  
  if (loading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }
  
  if (notifications.length === 0) {
    return (
      <div className="text-center p-8">
        <BellIcon className="w-12 h-12 mx-auto text-gray-400" />
        <p className="mt-4 text-gray-500">কোন নোটিফিকেশন নেই</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">নোটিফিকেশন</h2>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleMarkAllAsRead}
        >
          <CheckIcon className="w-4 h-4 mr-2" />
          সব পঠিত হিসেবে চিহ্নিত করুন
        </Button>
      </div>
      
      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`p-4 cursor-pointer transition-colors ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className={`${notification.read ? 'font-normal' : 'font-medium'}`}>
                    {notification.message}
                  </p>
                  
                  {!notification.read && (
                    <Badge variant="primary" className="ml-2">
                      নতুন
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {hasMore && (
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" className="mr-2" /> : null}
            আরও দেখুন
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
