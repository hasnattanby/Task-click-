import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaHome, FaVideo, FaPlus, FaComments, FaGlobe, FaMobile, FaCode } from 'react-icons/fa';

const BottomNavigation = () => {
  const { user } = useAuth();
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  
  // Don't show if not logged in
  if (!user) return null;
  
  return (
    <>
      {/* Create Options Menu (Popup) */}
      {showCreateOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-center">
          <div className="bg-white rounded-t-xl w-full max-w-lg p-4 animate-slide-up">
            <h3 className="text-lg font-medium text-center mb-4">অর্ডার তৈরি করুন</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <NavLink 
                to="/create/digital-marketing"
                onClick={() => setShowCreateOptions(false)}
                className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-indigo-50"
              >
                <FaGlobe className="text-2xl text-indigo-600 mb-2" />
                <span className="text-sm text-gray-700">ডিজিটাল মার্কেটিং</span>
              </NavLink>
              
              <NavLink 
                to="/create/app"
                onClick={() => setShowCreateOptions(false)}
                className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-indigo-50"
              >
                <FaMobile className="text-2xl text-indigo-600 mb-2" />
                <span className="text-sm text-gray-700">অ্যাপ</span>
              </NavLink>
              
              <NavLink 
                to="/create/webdev"
                onClick={() => setShowCreateOptions(false)}
                className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-indigo-50"
              >
                <FaCode className="text-2xl text-indigo-600 mb-2" />
                <span className="text-sm text-gray-700">ওয়েব ডেভেলপমেন্ট</span>
              </NavLink>
            </div>
            
            <button 
              onClick={() => setShowCreateOptions(false)}
              className="w-full py-3 text-indigo-600 font-medium rounded-lg hover:bg-gray-50"
            >
              বাতিল করুন
            </button>
          </div>
        </div>
      )}
    
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-30">
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center h-16">
            {/* Home */}
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex flex-col items-center w-1/5 py-1 ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`
              }
            >
              <FaHome className="text-xl mb-1" />
              <span className="text-xs">হোম</span>
            </NavLink>
            
            {/* Videos */}
            <NavLink 
              to="/videos" 
              className={({ isActive }) => 
                `flex flex-col items-center w-1/5 py-1 ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`
              }
            >
              <FaVideo className="text-xl mb-1" />
              <span className="text-xs">ভিডিও</span>
            </NavLink>
            
            {/* Create Button */}
            <button
              onClick={() => setShowCreateOptions(true)}
              className="flex flex-col items-center w-1/5 py-1 text-white"
            >
              <div className="bg-indigo-600 rounded-full w-12 h-12 flex items-center justify-center -mt-5 shadow-lg">
                <FaPlus className="text-xl" />
              </div>
              <span className="text-xs text-gray-600 mt-1">তৈরি করুন</span>
            </button>
            
            {/* Live */}
            <NavLink 
              to="/live" 
              className={({ isActive }) => 
                `flex flex-col items-center w-1/5 py-1 ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`
              }
            >
              <div className="relative">
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                <FaComments className="text-xl mb-1" />
              </div>
              <span className="text-xs">লাইভ</span>
            </NavLink>
            
            {/* Messages */}
            <NavLink 
              to="/messenger" 
              className={({ isActive }) => 
                `flex flex-col items-center w-1/5 py-1 ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`
              }
            >
              <FaComments className="text-xl mb-1" />
              <span className="text-xs">মেসেজ</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </>
  );
};

export default BottomNavigation;
