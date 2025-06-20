
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, LogIn, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AccessDenied: React.FC = () => {
  const { logout } = useAuth();

  const handleGoToCustomerPortal = () => {
    // Auto-detect current domain and redirect to client portal
    const currentDomain = window.location.hostname;
    if (currentDomain.includes('localhost') || currentDomain.includes('127.0.0.1')) {
      // Development environment
      window.location.href = '/customer-portal';
    } else {
      // Production environment - redirect to client subdomain
      window.location.href = `https://client.${currentDomain}/login`;
    }
  };

  const handleRetryLogin = async () => {
    // First logout the current user, then redirect to login
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-900">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 mb-6">
            You don't have permission to access the ISP management system. 
            This could be because you're using the wrong credentials or your account doesn't have the required permissions.
          </p>
          
          <div className="space-y-3">
            <Button onClick={handleRetryLogin} className="w-full" variant="default">
              <LogOut className="h-4 w-4 mr-2" />
              Logout & Try Again
            </Button>
            
            <Button onClick={handleGoToCustomerPortal} variant="outline" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Go to Customer Portal
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs text-blue-800">
              <p className="font-semibold mb-2">Need Help?</p>
              <p>• ISP Staff: Contact your system administrator</p>
              <p>• Customers: Use the Customer Portal button above</p>
              <p>• Wrong account? Use "Logout & Try Again" to login with different credentials</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;
