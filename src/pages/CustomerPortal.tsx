
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Globe, CreditCard, User } from 'lucide-react';
import CustomerRegistrationForm from '@/components/customers/CustomerRegistrationForm';

const CustomerPortal: React.FC = () => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  const handleRegistrationSuccess = (client: any) => {
    console.log('Registration successful:', client);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to NetFlow ISP
          </h1>
          <p className="text-xl text-gray-600">
            High-speed internet solutions for your home and business
          </p>
        </div>

        {/* Hero Section */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  Lightning-Fast Internet
                </h2>
                <p className="text-lg mb-6 text-blue-100">
                  Experience blazing-fast internet speeds with our fiber-optic network. 
                  Perfect for streaming, gaming, and working from home.
                </p>
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  onClick={() => setShowRegistrationForm(true)}
                >
                  Get Connected Today
                </Button>
              </div>
              <div className="hidden md:block">
                <div className="text-center">
                  <Globe className="h-32 w-32 mx-auto mb-4 text-blue-200" />
                  <p className="text-blue-100">99.9% Uptime Guarantee</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Packages */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-center">Basic</CardTitle>
              <div className="text-center">
                <span className="text-3xl font-bold">KSh 2,500</span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  10 Mbps Speed
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  100 GB Data
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  24/7 Support
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Free Installation
                </li>
              </ul>
              <Button className="w-full mt-4" onClick={() => setShowRegistrationForm(true)}>
                Choose Plan
              </Button>
            </CardContent>
          </Card>

          <Card className="relative border-2 border-blue-500">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500 text-white">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-center">Standard</CardTitle>
              <div className="text-center">
                <span className="text-3xl font-bold">KSh 4,000</span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  25 Mbps Speed
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  500 GB Data
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  24/7 Priority Support
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Free Installation & Router
                </li>
              </ul>
              <Button className="w-full mt-4" onClick={() => setShowRegistrationForm(true)}>
                Choose Plan
              </Button>
            </CardContent>
          </Card>

          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-center">Premium</CardTitle>
              <div className="text-center">
                <span className="text-3xl font-bold">KSh 7,500</span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  100 Mbps Speed
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Unlimited Data
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  24/7 VIP Support
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Premium Equipment
                </li>
              </ul>
              <Button className="w-full mt-4" onClick={() => setShowRegistrationForm(true)}>
                Choose Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <Phone className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-semibold mb-1">Call Us</h3>
                <p className="text-gray-600">+254 700 000 000</p>
              </div>
              <div className="flex flex-col items-center">
                <Mail className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-semibold mb-1">Email Us</h3>
                <p className="text-gray-600">info@netflowisp.com</p>
              </div>
              <div className="flex flex-col items-center">
                <MapPin className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-semibold mb-1">Visit Us</h3>
                <p className="text-gray-600">Nairobi, Kenya</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showRegistrationForm && (
        <CustomerRegistrationForm
          onClose={() => setShowRegistrationForm(false)}
          onSave={handleRegistrationSuccess}
        />
      )}
    </div>
  );
};

export default CustomerPortal;
