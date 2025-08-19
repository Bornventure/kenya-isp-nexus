
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Wifi, Zap, Crown } from 'lucide-react';

const ServicePackages = () => {
  const packages = [
    {
      id: 1,
      name: 'Basic Plan',
      speed: '10 Mbps',
      price: '$29.99',
      features: ['Unlimited Data', '24/7 Support', 'Basic Speed'],
      status: 'active',
      icon: Wifi,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      name: 'Premium Plan',
      speed: '50 Mbps',
      price: '$49.99',
      features: ['Unlimited Data', 'Priority Support', 'High Speed', 'Free Installation'],
      status: 'active',
      icon: Zap,
      color: 'bg-green-500'
    },
    {
      id: 3,
      name: 'Enterprise Plan',
      speed: '100 Mbps',
      price: '$99.99',
      features: ['Unlimited Data', 'Dedicated Support', 'Ultra High Speed', 'Free Installation', 'Static IP'],
      status: 'active',
      icon: Crown,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Service Packages</h1>
          <p className="text-muted-foreground">Manage your internet service packages and pricing plans</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const Icon = pkg.icon;
          return (
            <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${pkg.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant={pkg.status === 'active' ? 'default' : 'secondary'}>
                    {pkg.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardDescription>
                  Up to {pkg.speed} internet speed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-primary">
                    {pkg.price}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Features:</h4>
                    <ul className="space-y-1">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center">
                          <div className="h-1.5 w-1.5 bg-primary rounded-full mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button size="sm" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ServicePackages;
