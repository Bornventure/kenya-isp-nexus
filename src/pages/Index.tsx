
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();

  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <img 
            src="/lovable-uploads/29dec1bf-11a7-44c4-b61f-4cdfe1cbdc5c.png" 
            alt="DataDefender Logo" 
            className="mx-auto h-32 w-32 object-contain"
          />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">DataDefender</h1>
          <p className="text-xl text-blue-600 dark:text-blue-400 font-semibold">
            Kenya Internet Services
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Professional ISP Management System for Internet Service Providers in Kenya
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Client Management</h3>
            <p className="text-gray-600 dark:text-gray-300">Manage your clients, track installations, and monitor service status.</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Billing & Payments</h3>
            <p className="text-gray-600 dark:text-gray-300">Automated invoicing, M-Pesa integration, and payment tracking.</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Network Management</h3>
            <p className="text-gray-600 dark:text-gray-300">Monitor network status, equipment, and service coverage.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">Please log in to access the system</p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>© 2025 DataDefender Kenya Internet Services. All rights reserved.</p>
            <p>Professional ISP Management Solutions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
