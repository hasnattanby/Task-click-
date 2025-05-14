import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaHome, FaVideo, FaPlus, FaUser, FaMobile, FaCode } from 'react-icons/fa';

const BottomNavigation = () => {
  const { user } = useAuth();
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  
  // Don't show if not logged in
  if (!user) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40">
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center h-16">
          {/* Home */}
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-1/5 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`
            }
          >
            <FaHome className="text-xl" />
            <span className="text-xs mt-1">হোম</span>
          </NavLink>
          
          {/* Videos */}
          <NavLink 
            to="/videos" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-1/5 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`
            }
          >
            <FaVideo className="text-xl" />
            <span className="text-xs mt-1">ভিডিও</span>
          </NavLink>
          
          {/* Create (Plus) Button */}
          <div className="relative w-1/5">
            <button 
              className="flex flex-col items-center justify-center w-full text-indigo-600"
              onClick={() => setShowCreateOptions(!showCreateOptions)}
            >
              <div className="bg-indigo-600 p-3 rounded-full">
                <FaPlus className="text-xl text-white" />
              </div>
            </button>
            
            {/* Create Options Popup */}
            {showCreateOptions && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-60 bg-white rounded-lg shadow-lg z-50 p-2">
                <div className="flex flex-col space-y-1">
                  <NavLink 
                    to="/create/digital-marketing" 
                    className="flex items-center py-2 px-4 text-gray-700 hover:bg-gray-100 rounded"
                    onClick={() => setShowCreateOptions(false)}
                  >
                    <FaUser className="mr-2" />
                    <span>ডিজিটাল মার্কেটিং</span>
                  </NavLink>
                  <NavLink 
                    to="/create/app" 
                    className="flex items-center py-2 px-4 text-gray-700 hover:bg-gray-100 rounded"
                    onClick={() => setShowCreateOptions(false)}
                  >
                    <FaMobile className="mr-2" />
                    <span>অ্যাপ</span>
                  </NavLink>
                  <NavLink 
                    to="/create/webdev" 
                    className="flex items-center py-2 px-4 text-gray-700 hover:bg-gray-100 rounded"
                    onClick={() => setShowCreateOptions(false)}
                  >
                    <FaCode className="mr-2" />
                    <span>ওয়েব ডেভেলপ</span>
                  </NavLink>
                </div>
              </div>
            )}
          </div>
          
          {/* Live Messages */}
          <NavLink 
            to="/live" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-1/5 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="10" r="1" fill="currentColor"></circle>
              <circle cx="8" cy="10" r="1" fill="currentColor"></circle>
              <circle cx="16" cy="10" r="1" fill="currentColor"></circle>
            </svg>
            <span className="text-xs mt-1">লাইভ</span>
          </NavLink>
          
          {/* Messenger */}
          <NavLink 
            to="/messenger" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-1/5 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span className="text-xs mt-1">মেসেঞ্জার</span>
          </NavLink>
        </nav>
      </div>
      
      {/* Backdrop for create options */}
      {showCreateOptions && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowCreateOptions(false)}
        ></div>
      )}
    </div>
  );
};

export default BottomNavigation;
