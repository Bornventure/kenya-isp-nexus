
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  Users, 
  BarChart3, 
  Shield, 
  Zap, 
  Globe,
  ArrowRight,
  Check,
  Star,
  Phone,
  Mail,
  MapPin,
  User
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/29dec1bf-11a7-44c4-b61f-4cdfe1cbdc5c.png" 
              alt="DataDefender Logo" 
              className="h-8 w-8"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DataDefender ISP
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/client-portal">
              <Button variant="outline" className="gap-2">
                <User className="h-4 w-4" />
                Client Portal
              </Button>
            </Link>
            <Link to="/login">
              <Button className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            🚀 Professional ISP Management Platform
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            Complete ISP Management Solution
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline your Internet Service Provider operations with our comprehensive management platform. 
            From client management to network monitoring, billing, and support - all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="gap-2 min-w-[200px]">
                <ArrowRight className="h-5 w-5" />
                Get Started
              </Button>
            </Link>
            <Link to="/client-portal">
              <Button size="lg" variant="outline" className="gap-2 min-w-[200px]">
                <User className="h-5 w-5" />
                Client Access
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Features for Modern ISPs</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to run a successful Internet Service Provider business, 
            from small operations to enterprise-level deployments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Client Management</CardTitle>
              <CardDescription>
                Complete customer lifecycle management with registration, onboarding, and service tracking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Customer registration & KYC
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Service package management
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Installation tracking
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Wifi className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Network Management</CardTitle>
              <CardDescription>
                Monitor and manage your network infrastructure with real-time insights and controls.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  MikroTik integration
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  RADIUS authentication
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Bandwidth monitoring
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Billing & Payments</CardTitle>
              <CardDescription>
                Automated billing system with multiple payment gateways and comprehensive reporting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  M-Pesa integration
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Automated invoicing
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Payment tracking
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-10 w-10 text-red-600 mb-2" />
              <CardTitle>Equipment Management</CardTitle>
              <CardDescription>
                Track and manage all your network equipment with detailed inventory and maintenance logs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Equipment tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Maintenance scheduling
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Warranty management
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="h-10 w-10 text-yellow-600 mb-2" />
              <CardTitle>Hotspot Management</CardTitle>
              <CardDescription>
                Deploy and manage Wi-Fi hotspots with voucher systems and usage analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Voucher generation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Usage monitoring
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Captive portal
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Globe className="h-10 w-10 text-indigo-600 mb-2" />
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>
                Comprehensive analytics and reporting tools to drive business insights and growth.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Revenue analytics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Network performance
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Custom reports
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Trusted by ISPs Across Kenya</h2>
            <p className="text-gray-600">See what our customers are saying about DataDefender ISP</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "DataDefender has transformed how we manage our ISP operations. The automation features 
                  have saved us countless hours and improved our customer satisfaction significantly."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    JK
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">John Kamau</p>
                    <p className="text-sm text-gray-600">CEO, NetLink ISP</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The billing automation and M-Pesa integration have streamlined our payment processes. 
                  Our clients love the self-service portal and real-time payment confirmations."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    MW
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">Mary Wanjiku</p>
                    <p className="text-sm text-gray-600">Operations Manager, SpeedNet</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "From network monitoring to customer management, DataDefender provides everything 
                  we need in one platform. It's reliable, user-friendly, and constantly improving."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                    PO
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">Peter Ochieng</p>
                    <p className="text-sm text-gray-600">Technical Director, FastConnect</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your ISP Operations?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of ISPs who have already streamlined their operations with DataDefender. 
            Start your journey today with our comprehensive management platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="gap-2 min-w-[200px]">
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/client-portal">
              <Button size="lg" variant="outline" className="gap-2 min-w-[200px]">
                <User className="h-5 w-5" />
                Existing Client Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/lovable-uploads/29dec1bf-11a7-44c4-b61f-4cdfe1cbdc5c.png" 
                  alt="DataDefender Logo" 
                  className="h-6 w-6"
                />
                <span className="text-lg font-bold">DataDefender ISP</span>
              </div>
              <p className="text-gray-400 text-sm">
                Professional ISP management platform for modern internet service providers.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Client Management</li>
                <li>Network Monitoring</li>
                <li>Billing & Payments</li>
                <li>Equipment Tracking</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Documentation</li>
                <li>Training</li>
                <li>Technical Support</li>
                <li>Community Forum</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  +254 700 123 456
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  support@datadefender.co.ke
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Nairobi, Kenya
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 DataDefender ISP Management Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
