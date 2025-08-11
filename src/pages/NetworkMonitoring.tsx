
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Router, 
  Users, 
  AlertTriangle, 
  Activity 
} from 'lucide-react';
import ClientControlSection from '@/components/network/ClientControlSection';
import MikroTikMonitoring from '@/components/network/MikroTikMonitoring';
import RadiusIntegrationStatus from '@/components/radius/RadiusIntegrationStatus';
import { useClients } from '@/hooks/useClients';

const NetworkMonitoring = () => {
  const { clients, getClientStats } = useClients();
  const stats = getClientStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Network Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor and manage your network infrastructure and client connections
          </p>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routers</CardTitle>
            <Router className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1</div>
            <p className="text-xs text-muted-foreground">of 1 total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeClients}</div>
            <p className="text-xs text-muted-foreground">connected users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.suspendedClients}</div>
            <p className="text-xs text-muted-foreground">blocked users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">all systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Network Overview</TabsTrigger>
          <TabsTrigger value="routers">Router Management</TabsTrigger>
          <TabsTrigger value="clients">Client Control</TabsTrigger>
          <TabsTrigger value="radius">RADIUS Config</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Network Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">98.5%</div>
                      <div className="text-sm text-green-700">Uptime</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">125 Mbps</div>
                      <div className="text-sm text-blue-700">Total Throughput</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">2.1 TB</div>
                      <div className="text-sm text-purple-700">Data Today</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">42°C</div>
                      <div className="text-sm text-orange-700">Avg Temp</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routers">
          <MikroTikMonitoring />
        </TabsContent>

        <TabsContent value="clients">
          <ClientControlSection />
        </TabsContent>

        <TabsContent value="radius">
          <RadiusIntegrationStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkMonitoring;
