import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { MessageProvider } from './context/MessageContext';

// Layouts
import Header from './components/layout/Header';
import BottomNavigation from './components/layout/BottomNavigation';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CompleteProfile from './pages/auth/CompleteProfile';

// Main Pages
import Home from './pages/Home';
import VideoFeed from './pages/VideoFeed';
import NotificationPage from './pages/notifications/NotificationPage';
import LiveMessageViewer from './pages/messaging/LiveMessageViewer';
import Messenger from './pages/messaging/Messenger';

// Order Pages
import CreateDigitalMarketingOrder from './pages/orders/CreateDigitalMarketingOrder';
import CreateAppOrder from './pages/orders/CreateAppOrder';
import CreateWebDevOrder from './pages/orders/CreateWebDevOrder';
import OrderDetails from './pages/orders/OrderDetails';
import OrderList from './pages/orders/OrderList';

// Profile Pages
import UserProfile from './pages/profile/UserProfile';

// Dashboard Pages
import WorkerDashboard from './pages/dashboard/WorkerDashboard';
import OrderGiverDashboard from './pages/dashboard/OrderGiverDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  return user && user.role === 'ADMIN' ? children : <Navigate to="/" />;
};

// Role Based Dashboard Redirect
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" />;
  } else if (user.role === 'WORKER') {
    return <Navigate to="/worker/dashboard" />;
  } else {
    return <Navigate to="/ordergiver/dashboard" />;
  }
};

// Initialize React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <MessageProvider>
            <Router>
              <div className="flex flex-col min-h-screen bg-gray-50">
                <Toaster position="top-right" />
                <Header />
                
                <main className="flex-grow pb-16">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
                    <Route path="/videos" element={<ProtectedRoute><VideoFeed /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
                    <Route path="/live" element={<ProtectedRoute><LiveMessageViewer /></ProtectedRoute>} />
                    <Route path="/messenger" element={<ProtectedRoute><Messenger /></ProtectedRoute>} />
                    <Route path="/messenger/:userId" element={<ProtectedRoute><Messenger /></ProtectedRoute>} />
                    
                    {/* Order Routes */}
                    <Route path="/orders" element={<ProtectedRoute><OrderList /></ProtectedRoute>} />
                    <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                    <Route path="/create/digital-marketing" element={<ProtectedRoute><CreateDigitalMarketingOrder /></ProtectedRoute>} />
                    <Route path="/create/app" element={<ProtectedRoute><CreateAppOrder /></ProtectedRoute>} />
                    <Route path="/create/webdev" element={<ProtectedRoute><CreateWebDevOrder /></ProtectedRoute>} />
                    
                    {/* Profile Routes */}
                    <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                    
                    {/* Dashboard Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
                    <Route path="/worker/dashboard" element={<ProtectedRoute><WorkerDashboard /></ProtectedRoute>} />
                    <Route path="/ordergiver/dashboard" element={<ProtectedRoute><OrderGiverDashboard /></ProtectedRoute>} />
                    <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                    <Route path="/admin/dashboard/:section" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  </Routes>
                </main>
                
                <BottomNavigation />
              </div>
            </Router>
          </MessageProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
