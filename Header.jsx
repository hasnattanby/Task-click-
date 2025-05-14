import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { FaBell, FaUserCircle, FaSignOutAlt, FaCog, FaWallet } from 'react-icons/fa';

const Header = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-indigo-600">SteadyClick</span>
          </Link>
          
          {/* Right Side Nav */}
          {user ? (
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <Link to="/notifications" className="relative text-gray-600 hover:text-indigo-600">
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              
              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                    {user.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="w-full h-full text-gray-400" />
                    )}
                  </div>
                  <span className="hidden md:inline-block text-gray-700 text-sm font-medium">
                    {user.name?.split(' ')[0]}
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaUserCircle className="mr-2" />
                      প্রোফাইল
                    </Link>
                    
                    {user.role === 'WORKER' && (
                      <Link
                        to="/worker/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FaWallet className="mr-2" />
                        আয় এবং কাজ
                      </Link>
                    )}
                    
                    {user.role === 'ORDER_GIVER' && (
                      <Link
                        to="/ordergiver/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FaWallet className="mr-2" />
                        অর্ডার ইতিহাস
                      </Link>
                    )}
                    
                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FaWallet className="mr-2" />
                        অ্যাডমিন প্যানেল
                      </Link>
                    )}
                    
                    <Link
                      to="/profile/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaCog className="mr-2" />
                      সেটিংস
                    </Link>
                    
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <FaSignOutAlt className="mr-2" />
                      লগআউট
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link 
                to="/login" 
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                লগইন
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                রেজিস্ট্রেশন
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
