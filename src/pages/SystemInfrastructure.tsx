
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wrench, Network, Shield, Settings, Router } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import TechnicalInstallationManager from '@/components/onboarding/TechnicalInstallationManager';
import NetworkInfrastructureManager from '@/components/infrastructure/NetworkInfrastructureManager';

const SystemInfrastructure = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('infrastructure');

  // Check if user has access to technical installations
  const canManageInstallations = profile?.role === 'technician' || 
                                  profile?.role === 'network_engineer' || 
                                  profile?.role === 'isp_admin' ||
                                  profile?.role === 'super_admin';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Infrastructure</h1>
          <p className="text-gray-600">Manage core network infrastructure, installations, and system components</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Infrastructure Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="infrastructure" className="gap-2">
            <Router className="h-4 w-4" />
            Network Infrastructure
          </TabsTrigger>
          <TabsTrigger value="installations" className="gap-2">
            <Wrench className="h-4 w-4" />
            Client Installations
          </TabsTrigger>
          <TabsTrigger value="network" className="gap-2">
            <Network className="h-4 w-4" />
            Network Management
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="infrastructure" className="space-y-4">
          {canManageInstallations ? (
            <NetworkInfrastructureManager />
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-gray-500">
                  You don't have permission to manage network infrastructure.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="installations" className="space-y-4">
          {canManageInstallations ? (
            <TechnicalInstallationManager />
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-gray-500">
                  You don't have permission to manage technical installations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Network Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Advanced network management tools coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Security infrastructure management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemInfrastructure;
