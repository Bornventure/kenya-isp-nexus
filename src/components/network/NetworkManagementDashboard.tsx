import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { useClients } from '@/hooks/useClients';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';
import { useRadiusAutomation } from '@/hooks/useRadiusAutomation';
import { useAuth } from '@/contexts/AuthContext';
import { RouterClientAssignment } from './RouterClientAssignment';
import { ClientNetworkStatus } from './ClientNetworkStatus';
import { RadiusSystemStatus } from './RadiusSystemStatus';
import { 
  Network, 
  Users, 
  Server, 
  Settings, 
  UserCheck, 
  Router,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface NetworkClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  router_assignment?: string;
  radius_status: string;
  last_activity?: string;
  monthly_rate: number;
}

const NetworkManagementDashboard = () => {
  const { clients, isLoading: clientsLoading } = useClients();
  const { routers, isLoading: routersLoading } = useMikrotikRouters();
  const { radiusStatus, statusLoading } = useRadiusAutomation();
  const { profile } = useAuth();
  const [selectedTab, setSelectedTab] = useState('overview');

  // Permission check
  const canManageNetwork = profile?.role && ['super_admin', 'isp_admin', 'network_manager'].includes(profile.role);

  if (!canManageNetwork) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <span>You don't have permission to manage network infrastructure.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const networkClients: NetworkClient[] = clients.map(client => ({
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    status: client.status,
    radius_status: (client as any).radius_sync_status || 'pending',
    monthly_rate: client.monthly_rate,
    last_activity: (client as any).last_radius_sync_at,
  }));

  const clientColumns: Column<NetworkClient>[] = [
    {
      accessorKey: 'name',
      header: 'Client Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const variant = status === 'active' ? 'default' : 
                      status === 'suspended' ? 'destructive' : 'secondary';
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'radius_status',
      header: 'RADIUS Status',
      cell: ({ row }) => {
        const status = row.getValue('radius_status') as string;
        const icon = status === 'synced' ? CheckCircle2 : 
                    status === 'failed' ? AlertTriangle : Clock;
        const variant = status === 'synced' ? 'default' : 
                      status === 'failed' ? 'destructive' : 'secondary';
        return (
          <Badge variant={variant} className="flex items-center gap-1">
            {React.createElement(icon, { className: 'h-3 w-3' })}
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'monthly_rate',
      header: 'Monthly Rate',
      cell: ({ row }) => `KES ${row.getValue('monthly_rate')}`,
    },
  ];

  const routerColumns: Column<any>[] = [
    {
      accessorKey: 'name',
      header: 'Router Name',
    },
    {
      accessorKey: 'ip_address',
      header: 'IP Address',
    },
    {
      accessorKey: 'connection_status',
      header: 'Connection',
      cell: ({ row }) => {
        const status = row.getValue('connection_status') as string;
        const variant = status === 'connected' ? 'default' : 'destructive';
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'client_network',
      header: 'Client Network',
    },
    {
      id: 'assigned_clients',
      header: 'Assigned Clients',
      cell: ({ row }) => {
        const routerId = row.original.id;
        const assignedCount = networkClients.filter(c => c.router_assignment === routerId).length;
        return <Badge variant="outline">{assignedCount} clients</Badge>;
      },
    },
  ];

  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    connectedRouters: routers.filter(r => r.connection_status === 'connected').length,
    totalRouters: routers.length,
    radiusSynced: clients.filter(c => (c as any).radius_sync_status === 'synced').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Network Management</h1>
          <p className="text-muted-foreground">
            Manage client assignments, router connections, and RADIUS authentication
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Clients</p>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Active Clients</p>
                <p className="text-2xl font-bold">{stats.activeClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Router className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Connected Routers</p>
                <p className="text-2xl font-bold">{stats.connectedRouters}/{stats.totalRouters}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">RADIUS Synced</p>
                <p className="text-2xl font-bold">{stats.radiusSynced}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">System Health</p>
                <p className="text-sm font-bold text-green-600">Operational</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Client Assignments
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Network Clients
          </TabsTrigger>
          <TabsTrigger value="routers" className="flex items-center gap-2">
            <Router className="h-4 w-4" />
            Router Management
          </TabsTrigger>
          <TabsTrigger value="radius" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            RADIUS Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClientNetworkStatus clients={networkClients} />
            <RadiusSystemStatus 
              radiusData={radiusStatus} 
              loading={statusLoading}
              routers={routers}
            />
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <RouterClientAssignment 
            clients={networkClients}
            routers={routers.map(r => ({
              id: r.id,
              name: r.name,
              ip_address: r.ip_address,
              connection_status: r.connection_status || 'disconnected',
              client_network: r.client_network || 'N/A'
            }))}
            onAssignmentChange={() => {
              // Refresh data after assignment changes
              window.location.reload();
            }}
          />
        </TabsContent>

        <TabsContent value="clients" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Network Clients Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={clientColumns}
                data={networkClients}
                searchKey="name"
                loading={clientsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Router className="h-5 w-5" />
                Router Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={routerColumns}
                data={routers.map(r => ({
                  id: r.id,
                  name: r.name,
                  ip_address: r.ip_address,
                  connection_status: r.connection_status || 'disconnected',
                  client_network: r.client_network || 'N/A'
                }))}
                searchKey="name"
                loading={routersLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radius" className="mt-6">
          <RadiusSystemStatus 
            radiusData={radiusStatus} 
            loading={statusLoading}
            routers={routers}
            detailed={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkManagementDashboard;