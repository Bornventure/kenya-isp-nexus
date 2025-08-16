
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CustomerRegistrationForm from '@/components/customers/CustomerRegistrationForm';
import { Wifi, UserPlus, LogIn } from 'lucide-react';

const CustomerPortal = () => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <Wifi className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Qorion Innovations Internet Services
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fast, reliable internet connectivity for homes and businesses across Kenya
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Registration Card */}
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <CardHeader className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">New Customer</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Ready to get connected? Register for our internet services and enjoy high-speed connectivity.
              </p>
              <ul className="text-left space-y-2 text-sm text-gray-600">
                <li>• Fiber optic connections available</li>
                <li>• Multiple speed packages</li>
                <li>• Professional installation</li>
                <li>• 24/7 customer support</li>
              </ul>
              <Button 
                onClick={() => setShowRegistrationForm(true)}
                className="w-full gap-2"
                size="lg"
              >
                <UserPlus className="h-5 w-5" />
                Register Now
              </Button>
            </CardContent>
          </Card>

          {/* Login Card */}
          <Card className="border-2 border-gray-200 hover:border-gray-400 transition-colors">
            <CardHeader className="text-center">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                <LogIn className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Existing Customer</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Already a customer? Access your account to view billing, make payments, and manage your service.
              </p>
              <ul className="text-left space-y-2 text-sm text-gray-600">
                <li>• View your current balance</li>
                <li>• Make payments via M-Pesa</li>
                <li>• Submit support tickets</li>
                <li>• Track your usage</li>
              </ul>
              <Button 
                variant="outline"
                className="w-full gap-2"
                size="lg"
              >
                <LogIn className="h-5 w-5" />
                Customer Login
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Choose Our Services?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-4">
                <Wifi className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">High-Speed Internet</h3>
              <p className="text-gray-600">Experience blazing fast speeds with our fiber optic network infrastructure.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Setup</h3>
              <p className="text-gray-600">Quick and professional installation by our certified technicians.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-fit mx-auto mb-4">
                <LogIn className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer support to keep you connected.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <CustomerRegistrationForm
          onClose={() => setShowRegistrationForm(false)}
          onSuccess={(client) => {
            console.log('Client registered successfully:', client);
          }}
        />
      )}
    </div>
  );
};

export default CustomerPortal;
