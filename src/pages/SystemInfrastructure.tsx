
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wrench, Network, Shield, Settings, Router, Server, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import TechnicalInstallationManager from '@/components/onboarding/TechnicalInstallationManager';
import NetworkInfrastructureManager from '@/components/infrastructure/NetworkInfrastructureManager';
import { MikrotikRouterManager } from '@/components/network/MikroTikRouterManager';

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
            <div className="space-y-6">
              <NetworkInfrastructureManager />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Router className="h-5 w-5" />
                    MikroTik Router Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MikrotikRouterManager />
                </CardContent>
              </Card>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  RADIUS Server Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Manage FreeRADIUS authentication server settings and user policies.
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded">
                    <div className="font-medium">Active Users</div>
                    <div className="text-2xl font-bold">1,247</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="font-medium">Authentication Rate</div>
                    <div className="text-2xl font-bold">99.8%</div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Configure RADIUS
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  DHCP Server Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Monitor and configure DHCP pools and lease assignments.
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded">
                    <div className="font-medium">Active Leases</div>
                    <div className="text-2xl font-bold">892</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="font-medium">Pool Utilization</div>
                    <div className="text-2xl font-bold">67%</div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Manage DHCP Pools
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network Topology
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  View and manage network topology including switches, routers, and access points.
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded">
                    <div className="font-medium">Network Devices</div>
                    <div className="text-2xl font-bold">47</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="font-medium">Network Health</div>
                    <div className="text-2xl font-bold">98%</div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  View Topology
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Router className="h-5 w-5" />
                  Bandwidth Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Configure Quality of Service (QoS) policies and bandwidth limits.
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded">
                    <div className="font-medium">Total Bandwidth</div>
                    <div className="text-2xl font-bold">10 Gbps</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="font-medium">Utilization</div>
                    <div className="text-2xl font-bold">45%</div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Configure QoS
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Firewall Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Configure and monitor firewall rules and security policies.
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded">
                    <div className="font-medium">Active Rules</div>
                    <div className="text-2xl font-bold">234</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="font-medium">Blocked Threats</div>
                    <div className="text-2xl font-bold">1,847</div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Manage Firewall
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Intrusion Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Monitor network for suspicious activities and potential security threats.
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded">
                    <div className="font-medium">Alerts Today</div>
                    <div className="text-2xl font-bold">3</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="font-medium">Security Score</div>
                    <div className="text-2xl font-bold">97%</div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  View Security Logs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  VPN Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Manage VPN connections and remote access policies.
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded">
                    <div className="font-medium">Active Connections</div>
                    <div className="text-2xl font-bold">23</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="font-medium">Data Transferred</div>
                    <div className="text-2xl font-bold">1.2 TB</div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Configure VPN
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Manage user access permissions and authentication policies.
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded">
                    <div className="font-medium">User Policies</div>
                    <div className="text-2xl font-bold">12</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="font-medium">Login Success Rate</div>
                    <div className="text-2xl font-bold">99.1%</div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Manage Access Control
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemInfrastructure;
