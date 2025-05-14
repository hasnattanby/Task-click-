import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FaUsers, FaMoneyBillWave, FaDollarSign, FaClock } from 'react-icons/fa';

const OrderCard = ({ order }) => {
  // Type badge colors
  const typeBadgeColor = {
    DIGITAL_MARKETING: 'bg-purple-100 text-purple-800',
    APP: 'bg-blue-100 text-blue-800',
    WEB_DEVELOPMENT: 'bg-green-100 text-green-800'
  };
  
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
  
  // Calculate remaining slots
  const remainingSlots = order.workerCount - order.workers.length;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${typeBadgeColor[order.orderType]}`}>
              {formatOrderType(order.orderType)}
            </span>
            
            {/* Date */}
            <div className="flex items-center mt-1 text-gray-500 text-xs">
              <FaClock className="mr-1" />
              {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
            </div>
          </div>
          
          {/* Creator info */}
          <div className="flex items-center">
            <img 
              src={order.creator.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(order.creator.name)}
              alt={order.creator.name}
              className="h-8 w-8 rounded-full object-cover mr-2 border border-gray-200"
            />
            <span className="text-sm font-medium text-gray-800">{order.creator.name}</span>
          </div>
        </div>
        
        <h3 className="mt-3 text-xl font-semibold text-gray-900 line-clamp-2">
          {order.title}
        </h3>
        
        <p className="mt-2 text-gray-600 line-clamp-2">
          {order.description}
        </p>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <FaUsers className="text-indigo-500 mr-2" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {remainingSlots > 0 ? remainingSlots : 'কোনো'} স্লট বাকি
              </div>
              <div className="text-xs text-gray-500">
                মোট {order.workerCount} জন
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <FaDollarSign className="text-green-500 mr-2" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                ৳{order.ratePerWorker} / কাজ
              </div>
              <div className="text-xs text-gray-500">
                মোট ৳{order.totalBudget}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <Link
            to={`/orders/${order.id}`}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            বিস্তারিত দেখুন
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
