
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const AccessDenied: React.FC = () => {
  const handleGoToCustomerPortal = () => {
    window.location.href = '/customer-portal';
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
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            You don't have permission to access the ISP management system. 
            Please contact your administrator if you believe this is an error.
          </p>
          <Button onClick={handleGoToCustomerPortal}>
            Go to Customer Portal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;
