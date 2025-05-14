import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../services/adminService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Alert } from '../../components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Spinner } from '../../components/ui/spinner';
import { BarChart, LineChart, DoughnutChart } from '../../components/charts';
import {
  UsersIcon,
  OrdersIcon,
  MoneyIcon,
  ChartIcon
} from '../../components/icons';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const result = await getDashboardStats();
        
        if (result.success) {
          setStats(result.stats);
        }
      } catch (err) {
        setError('ড্যাশবোর্ড ডেটা লোড করতে সমস্যা হয়েছে');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  // Check if user is admin
  if (user?.role !== 'ADMIN') {
    return (
      <Alert variant="error" className="my-8">
        এডমিন প্যানেলে আপনার অ্যাকসেস নেই
      </Alert>
    );
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="error" className="my-8">
        {error}
      </Alert>
    );
  }
  
  if (!stats) {
    return null;
  }
  
  const { users, orders, financial } = stats;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">এডমিন ড্যাশবোর্ড</h1>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full mr-4">
                <UsersIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">মোট ইউজার</p>
                <h3 className="text-2xl font-bold">{users.total}</h3>
                <p className="text-xs text-green-600">+{users.today} আজ</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full mr-4">
                <OrdersIcon className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">মোট অর্ডার</p>
                <h3 className="text-2xl font-bold">{orders.total}</h3>
                <p className="text-xs text-blue-600">{orders.active} অ্যাকটিভ</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-full mr-4">
                <ChartIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">অ্যাকটিভ ওয়ার্কার</p>
                <h3 className="text-2xl font-bold">{users.activeUsers}</h3>
                <p className="text-xs text-gray-500">মোট {users.workerCount} ওয়ার্কার</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-full mr-4">
                <MoneyIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">মোট লাভ</p>
                <h3 className="text-2xl font-bold">${financial.totalProfit.toFixed(2)}</h3>
                <p className="text-xs text-gray-500">মোট ${financial.totalIncome.toFixed(2)} আয়</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Stats Tabs */}
      <Tabs defaultValue="users" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="users">ইউজার স্ট্যাটিস্টিক্স</TabsTrigger>
          <TabsTrigger value="orders">অর্ডার স্ট্যাটিস্টিক্স</TabsTrigger>
          <TabsTrigger value="financial">আর্থিক স্ট্যাটিস্টিক্স</TabsTrigger>
        </TabsList>
        
        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ইউজার ধরণ</CardTitle>
              </CardHeader>
              <CardContent>
                <DoughnutChart
                  data={{
                    labels: ['ওয়ার্কার', 'অর্ডার দাতা', 'অ্যাডমিন'],
                    datasets: [{
                      data: [users.workerCount, users.orderGiverCount, 1],
                      backgroundColor: ['#4338ca', '#0891b2', '#c026d3']
                    }]
                  }}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>সক্রিয় বনাম নিষ্ক্রিয় ইউজার</CardTitle>
              </CardHeader>
              <CardContent>
                <DoughnutChart
                  data={{
                    labels: ['সক্রিয়', 'নিষ্ক্রিয়'],
                    datasets: [{
                      data: [users.activeUsers, users.inactiveUsers],
                      backgroundColor: ['#22c55e', '#f43f5e']
                    }]
                  }}
                />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>দেশ অনুযায়ী ইউজার</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={{
                  labels: users.byCountry.map(item => item.country || 'অজানা'),
                  datasets: [{
                    label: 'ইউজার সংখ্যা',
                    data: users.byCountry.map(item => item._count.id),
                    backgroundColor: '#3b82f6'
                  }]
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>মোট অর্ডার</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center">{orders.total}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>এক্টিভ অর্ডার</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center text-green-600">{orders.active}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>গত ২৪ ঘন্টায়</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center text-blue-600">{orders.last24Hours}</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>অর্ডার ট্রেন্ড (Last 30 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={{
                  labels: Array.from({ length: 30 }, (_, i) => i + 1),
                  datasets: [{
                    label: 'অর্ডার সংখ্যা',
                    data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 10)), // Example data
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)'
                  }]
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>মোট আয়</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center text-green-600">${financial.totalIncome.toFixed(2)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>মোট ব্যয়</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center text-red-600">${financial.totalExpense.toFixed(2)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>মোট লাভ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center text-blue-600">${financial.totalProfit.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>আয়-ব্যয় বিশ্লেষণ</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={{
                  labels: ['আয়', 'ব্যয়', 'লাভ'],
                  datasets: [{
                    label: 'Amount (USD)',
                    data: [
                      financial.totalIncome,
                      financial.totalExpense,
                      financial.totalProfit
                    ],
                    backgroundColor: ['#22c55e', '#ef4444', '#3b82f6']
                  }]
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
