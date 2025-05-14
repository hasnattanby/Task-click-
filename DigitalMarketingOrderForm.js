import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../services/orderService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';
import { Alert } from '../ui/alert';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';

const DigitalMarketingOrderForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    orderType: 'DIGITAL_MARKETING',
    platform: '',
    link: '',
    workerCount: 10,
    ratePerWorker: 0.05,
    proofType: 'screenshot',
    instructions: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculatedBudget, setCalculatedBudget] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Calculate total budget with admin fee
  const calculateBudget = (workers, rate) => {
    const subtotal = workers * rate;
    const adminFee = subtotal * 0.02;
    return subtotal + adminFee;
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    
    // Recalculate budget if worker count or rate changes
    if (name === 'workerCount' || name === 'ratePerWorker') {
      const workers = name === 'workerCount' ? parseInt(value) || 0 : formData.workerCount;
      const rate = name === 'ratePerWorker' ? parseFloat(value) || 0 : formData.ratePerWorker;
      setCalculatedBudget(calculateBudget(workers, rate));
    }
    
    setFormData(newFormData);
  };
  
  // Initialize budget calculation
  React.useEffect(() => {
    setCalculatedBudget(calculateBudget(formData.workerCount, formData.ratePerWorker));
  }, []);
  
  // Form validation
  const validateForm = () => {
    if (!formData.title || !formData.platform || !formData.link) {
      setError('টাইটেল, প্ল্যাটফর্ম এবং লিংক আবশ্যক');
      return false;
    }
    
    if (formData.workerCount <= 0) {
      setError('ওয়ার্কার সংখ্যা সঠিক নয়');
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError('');
      
      const result = await createOrder(formData);
      
      if (result.success) {
        navigate(`/orders/${result.order.id}/payment`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'অর্ডার তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };
  
  // Check if user is complete
  if (user && !user.isCompleteProfile) {
    return (
      <Alert variant="warning" className="mb-4">
        অর্ডার দেওয়ার আগে প্রোফাইল সম্পূর্ণ করুন। <a href="/complete-profile" className="font-bold underline">এখানে ক্লিক করুন</a>
      </Alert>
    );
  }
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">ডিজিটাল মার্কেটিং অর্ডার</CardTitle>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">কাজের শিরোনাম</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="উদাহরণ: ইউটিউব চ্যানেলে সাবস্ক্রাইব"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">কাজের ধরন</label>
                <Select
                  name="taskType"
                  value={formData.taskType}
                  onChange={handleChange}
                  required
                >
                  <option value="subscribe">সাবস্ক্রাইব/ফলো</option>
                  <option value="like">লাইক-কমেন্ট-শেয়ার</option>
                  <option value="watch">ভিডিও ওয়াচ</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">প্ল্যাটফর্ম</label>
                <Input
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  placeholder="উদাহরণ: YouTube, Facebook, Instagram"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">লিংক</label>
              <Input
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="https://..."
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ওয়ার্কার সংখ্যা</label>
                <Input
                  name="workerCount"
                  type="number"
                  min="1"
                  value={formData.workerCount}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">প্রতি ওয়ার্কারের রেট (USD)</label>
                <Input
                  name="ratePerWorker"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.ratePerWorker}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">প্রুফ টাইপ</label>
              <Select
                name="proofType"
                value={formData.proofType}
                onChange={handleChange}
                required
              >
                <option value="screenshot">স্ক্রিনশট</option>
                <option value="username">ইউজারনেম</option>
                <option value="email">জিমেইল</option>
                <option value="video">ভিডিও</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">অতিরিক্ত নির্দেশনা</label>
              <Textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="ওয়ার্কারদের জন্য বিশেষ নির্দেশনা..."
                rows={3}
              />
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span>সাবটোটাল:</span>
                <span>${(formData.workerCount * formData.ratePerWorker).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>অ্যাডমিন ফি (2%):</span>
                <span>${((formData.workerCount * formData.ratePerWorker) * 0.02).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center font-bold mt-2">
                <span>মোট বাজেট:</span>
                <span>${calculatedBudget.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'অপেক্ষা করুন...' : 'অর্ডার দিন'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DigitalMarketingOrderForm;
