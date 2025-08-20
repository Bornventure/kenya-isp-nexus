
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BarChart3, Settings, CreditCard, Wifi, Package } from 'lucide-react';
import UserManagement from '@/components/admin/UserManagement';

const ISPAdminDashboard = () => {
  const [activeView, setActiveView] = useState('overview');

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">145</div>
                <p className="text-xs text-muted-foreground">Active subscribers</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Active Hotspots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Online locations</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES 245,800</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Service Packages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Available plans</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Analytics and reporting for your ISP company operations.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      case 'billing':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Manage billing, invoices, and payment processing for your clients.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      case 'network':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Network Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Monitor and manage your network infrastructure and hotspots.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      case 'services':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Manage service packages, pricing, and client subscriptions.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <div>Select a view</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ISP Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your ISP company operations, users, and services.
        </p>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            <span className="hidden sm:inline">Network</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Services</span>
          </TabsTrigger>
        </TabsList>

        {Object.keys({
          overview: null,
          users: null,
          analytics: null,
          billing: null,
          network: null,
          services: null
        }).map(key => (
          <TabsContent key={key} value={key} className="space-y-4">
            {renderContent()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ISPAdminDashboard;
