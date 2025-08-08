
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { MikrotikRouter } from '@/services/radiusService';
import { Plus, TestTube, Wifi } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const MikrotikRouterManager = () => {
  const { routers, isLoading, addRouter, testConnection, isAddingRouter, isTestingConnection } = useMikrotikRouters();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRouter, setNewRouter] = useState({
    name: '',
    ip_address: '',
    admin_username: '',
    admin_password: '',
    snmp_community: 'public',
    snmp_version: 2,
    pppoe_interface: 'pppoe-server1',
    dns_servers: '8.8.8.8,8.8.4.4',
    client_network: '10.0.0.0/24',
    gateway: '',
    status: 'pending' as const,
    last_test_results: null,
    connection_status: 'offline' as const,
  });

  const handleAddRouter = () => {
    addRouter(newRouter);
    setNewRouter({
      name: '',
      ip_address: '',
      admin_username: '',
      admin_password: '',
      snmp_community: 'public',
      snmp_version: 2,
      pppoe_interface: 'pppoe-server1',
      dns_servers: '8.8.8.8,8.8.4.4',
      client_network: '10.0.0.0/24',
      gateway: '',
      status: 'pending',
      last_test_results: null,
      connection_status: 'offline',
    });
    setShowAddDialog(false);
  };

  const columns: ColumnDef<MikrotikRouter>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'ip_address',
      header: 'IP Address',
    },
    {
      accessorKey: 'pppoe_interface',
      header: 'PPPoE Interface',
    },
    {
      accessorKey: 'connection_status',
      header: 'Connection',
      cell: ({ row }) => (
        <Badge variant={row.original.connection_status === 'online' ? 'success' : 'destructive'}>
          <Wifi className="h-3 w-3 mr-1" />
          {row.original.connection_status}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'success' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => testConnection(row.original.ip_address)}
          disabled={isTestingConnection}
        >
          <TestTube className="h-4 w-4 mr-2" />
          Test
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>MikroTik Router Management</CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Router
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add MikroTik Router</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Router Name</Label>
                    <Input
                      id="name"
                      value={newRouter.name}
                      onChange={(e) => setNewRouter({ ...newRouter, name: e.target.value })}
                      placeholder="Main Router"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ip_address">IP Address</Label>
                    <Input
                      id="ip_address"
                      value={newRouter.ip_address}
                      onChange={(e) => setNewRouter({ ...newRouter, ip_address: e.target.value })}
                      placeholder="192.168.1.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin_username">Admin Username</Label>
                    <Input
                      id="admin_username"
                      value={newRouter.admin_username}
                      onChange={(e) => setNewRouter({ ...newRouter, admin_username: e.target.value })}
                      placeholder="admin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin_password">Admin Password</Label>
                    <Input
                      id="admin_password"
                      type="password"
                      value={newRouter.admin_password}
                      onChange={(e) => setNewRouter({ ...newRouter, admin_password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pppoe_interface">PPPoE Interface</Label>
                    <Input
                      id="pppoe_interface"
                      value={newRouter.pppoe_interface}
                      onChange={(e) => setNewRouter({ ...newRouter, pppoe_interface: e.target.value })}
                      placeholder="pppoe-server1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_network">Client Network</Label>
                    <Input
                      id="client_network"
                      value={newRouter.client_network}
                      onChange={(e) => setNewRouter({ ...newRouter, client_network: e.target.value })}
                      placeholder="10.0.0.0/24"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddRouter} disabled={isAddingRouter}>
                      Add Router
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Total Routers: {routers.length} | Online: {routers.filter(r => r.connection_status === 'online').length}
              </div>
            </div>

            <DataTable
              columns={columns}
              data={routers}
              loading={isLoading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
