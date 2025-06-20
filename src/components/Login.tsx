
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, Mail, Shield, Users } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(email, password);
    if (!success) {
      setError('Invalid credentials. Please check your email and password.');
    }
  };

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/bfa196dc-eae7-40b2-826b-7a96fffbd83d.png" 
              alt="DataDefender Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <CardTitle className="text-2xl">DataDefender</CardTitle>
          <CardDescription>
            ISP Management Portal - For technicians and administrative staff
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleGoToCustomerPortal}
            >
              <Users className="h-4 w-4 mr-2" />
              Access Customer Portal
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs text-blue-800">
              <p className="font-semibold mb-2">🔧 For ISP Staff Only</p>
              <p>• This portal is for technicians and administrators</p>
              <p>• Use this to register new internet customers</p>
              <p>• Manage existing client accounts and billing</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-600">
              <p className="font-semibold mb-2">Default Admin Access:</p>
              <p>Email: admin@system.local</p>
              <p>Password: AdminPass123!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
