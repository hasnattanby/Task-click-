import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import OrderCard from '../components/shared/OrderCard';
import { toast } from 'react-hot-toast';
import { FaFilter, FaSync } from 'react-icons/fa';

const Home = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const limit = 10;
  
  const { data, isLoading, isError, error, refetch } = useQuery(
    ['orders', filter, page],
    async () => {
      const res = await axios.get('/api/orders', {
        params: {
          type: filter === 'ALL' ? undefined : filter,
          skip: page * limit,
          take: limit
        }
      });
      return res.data;
    },
    {
      keepPreviousData: true
    }
  );
  
  useEffect(() => {
    if (isError) {
      toast.error('অর্ডার লোড করতে সমস্যা হয়েছে');
      console.error('Error fetching orders:', error);
    }
  }, [isError, error]);
  
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(0);
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {user?.name ? `${user.name}, ` : ''}সকল অর্ডার
        </h1>
        
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600"
        >
          <FaSync /> রিফ্রেশ
        </button>
      </div>
      
      {/* Filter buttons */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => handleFilterChange('ALL')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filter === 'ALL'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          সবগুলো
        </button>
        <button
          onClick={() => handleFilterChange('DIGITAL_MARKETING')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
            filter === 'DIGITAL_MARKETING'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ডিজিটাল মার্কেটিং
        </button>
        <button
          onClick={() => handleFilterChange('APP')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filter === 'APP'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          অ্যাপস
        </button>
        <button
          onClick={() => handleFilterChange('WEB_DEVELOPMENT')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
            filter === 'WEB_DEVELOPMENT'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ওয়েব ডেভেলপমেন্ট
        </button>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {/* Error state */}
      {isError && (
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">কোনো অর্ডার লোড করা যায়নি</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      )}
      
      {/* Orders list */}
      {!isLoading && !isError && data?.orders?.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">কোনো অর্ডার পাওয়া যায়নি</p>
        </div>
      )}
      
      {!isLoading && !isError && data?.orders?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {!isLoading && !isError && data?.orders?.length > 0 && (
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={page === 0}
            className={`px-4 py-2 rounded-md ${
              page === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            আগের পেজ
          </button>
          
          <span className="text-sm text-gray-600">
            পেজ {page + 1} 
            {data.total > 0 ? ` / ${Math.ceil(data.total / limit)}` : ''}
          </span>
          
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!data.hasMore}
            className={`px-4 py-2 rounded-md ${
              !data.hasMore
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            পরের পেজ
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
