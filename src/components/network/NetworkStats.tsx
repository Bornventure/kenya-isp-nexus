
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, Users, Activity, Signal } from 'lucide-react';
import { useClients } from '@/hooks/useClients';

const NetworkStats = () => {
  const { clients } = useClients();

  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(client => client.status === 'active').length,
    suspendedClients: clients.filter(client => client.status === 'suspended').length,
    pendingClients: clients.filter(client => client.status === 'pending').length,
    fiberConnections: clients.filter(client => client.connection_type === 'fiber').length,
    wirelessConnections: clients.filter(client => client.connection_type === 'wireless').length,
    satelliteConnections: clients.filter(client => client.connection_type === 'satellite').length,
    dslConnections: clients.filter(client => client.connection_type === 'dsl').length,
  };

  const connectionTypes = [
    { type: 'fiber', count: stats.fiberConnections, color: 'bg-green-100 text-green-800' },
    { type: 'wireless', count: stats.wirelessConnections, color: 'bg-blue-100 text-blue-800' },
    { type: 'satellite', count: stats.satelliteConnections, color: 'bg-purple-100 text-purple-800' },
    { type: 'dsl', count: stats.dslConnections, color: 'bg-orange-100 text-orange-800' },
  ];

  const clientStatuses = [
    { status: 'active', count: stats.activeClients, color: 'bg-green-100 text-green-800' },
    { status: 'suspended', count: stats.suspendedClients, color: 'bg-red-100 text-red-800' },
    { status: 'pending', count: stats.pendingClients, color: 'bg-yellow-100 text-yellow-800' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Network Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Uptime</CardTitle>
            <Signal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">99.9%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bandwidth Usage</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 GB/s</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Connection Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {connectionTypes.map(({ type, count, color }) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="capitalize">{type}</span>
                  <Badge className={color}>{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clientStatuses.map(({ status, count, color }) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="capitalize">{status}</span>
                  <Badge className={color}>{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NetworkStats;
