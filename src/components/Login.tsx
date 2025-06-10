
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Wifi, AlertCircle, Mail, Shield } from 'lucide-react';

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Wifi className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">ISP Management Portal</CardTitle>
          <CardDescription>
            Administrative access for ISP personnel only
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
          
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-xs text-red-800">
              <p className="font-semibold mb-2">⚠️ Administrative Access Only</p>
              <p>• This portal is for ISP staff members only</p>
              <p>• Client accounts cannot access this system</p>
              <p>• Contact your administrator for access</p>
              <p className="mt-3 text-blue-700 font-medium">
                Are you a customer? <a href="/customer-portal" className="underline">Visit Customer Portal</a>
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs text-blue-800">
              <p className="font-semibold mb-2">System Access Information:</p>
              <p>• This is a secure system for authorized ISP personnel only</p>
              <p>• New admin accounts are created by system administrators</p>
              <p>• Contact your IT administrator if you need access</p>
              <p className="mt-2 font-medium">Default Admin: admin@system.local | Password: AdminPass123!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
