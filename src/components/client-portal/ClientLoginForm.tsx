
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const ClientLoginForm = () => {
  const [email, setEmail] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [showIdNumber, setShowIdNumber] = useState(false);
  const { login, isLoading } = useClientAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !idNumber) return;
    
    const success = await login(email, idNumber);
    if (success) {
      // Navigation will be handled by the parent component
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/29dec1bf-11a7-44c4-b61f-4cdfe1cbdc5c.png" 
              alt="DataDefender Logo" 
              className="h-20 w-20 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            DataDefender Client Portal
          </h1>
          <p className="text-gray-600">
            Access your account to manage services and payments
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Login to Your Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number</Label>
                <div className="relative">
                  <Input
                    id="idNumber"
                    type={showIdNumber ? 'text' : 'password'}
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="Enter your ID number"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowIdNumber(!showIdNumber)}
                  >
                    {showIdNumber ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !email || !idNumber}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Need help? Contact support for assistance with your login credentials.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientLoginForm;
