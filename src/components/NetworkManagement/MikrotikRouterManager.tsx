
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';
import { Plus, Router, Trash2, Settings, Wifi } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const MikrotikRouterManager = () => {
  const { routers, isLoading, createRouter, updateRouter, deleteRouter, isCreating, isDeleting } = useMikrotikRouters();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    admin_username: 'admin',
    admin_password: '',
    snmp_community: 'public',
    snmp_version: 2,
    pppoe_interface: 'ether1',
    dns_servers: '8.8.8.8,8.8.4.4',
    client_network: '192.168.1.0/24',
    gateway: '',
    status: 'active' as const,
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.ip_address || !formData.admin_password) {
      return;
    }

    createRouter(formData);
    setFormData({
      name: '',
      ip_address: '',
      admin_username: 'admin',
      admin_password: '',
      snmp_community: 'public',
      snmp_version: 2,
      pppoe_interface: 'ether1',
      dns_servers: '8.8.8.8,8.8.4.4',
      client_network: '192.168.1.0/24',
      gateway: '',
      status: 'active' as const,
    });
    setShowAddDialog(false);
  };

  const toggleRouterStatus = (routerId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateRouter({
      id: routerId,
      updates: { status: newStatus }
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading routers...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Router className="h-5 w-5" />
              MikroTik Router Inventory
            </CardTitle>
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
                    <Label htmlFor="name">Router Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Branch Office Router"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ip_address">IP Address *</Label>
                    <Input
                      id="ip_address"
                      value={formData.ip_address}
                      onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                      placeholder="192.168.1.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin_username">Admin Username</Label>
                    <Input
                      id="admin_username"
                      value={formData.admin_username}
                      onChange={(e) => setFormData({ ...formData, admin_username: e.target.value })}
                      placeholder="admin"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin_password">Admin Password *</Label>
                    <Input
                      id="admin_password"
                      type="password"
                      value={formData.admin_password}
                      onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                      placeholder="Enter admin password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="snmp_community">SNMP Community</Label>
                    <Input
                      id="snmp_community"
                      value={formData.snmp_community}
                      onChange={(e) => setFormData({ ...formData, snmp_community: e.target.value })}
                      placeholder="public"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pppoe_interface">PPPoE Interface</Label>
                    <Input
                      id="pppoe_interface"
                      value={formData.pppoe_interface}
                      onChange={(e) => setFormData({ ...formData, pppoe_interface: e.target.value })}
                      placeholder="ether1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dns_servers">DNS Servers</Label>
                    <Input
                      id="dns_servers"
                      value={formData.dns_servers}
                      onChange={(e) => setFormData({ ...formData, dns_servers: e.target.value })}
                      placeholder="8.8.8.8,8.8.4.4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_network">Client Network</Label>
                    <Input
                      id="client_network"
                      value={formData.client_network}
                      onChange={(e) => setFormData({ ...formData, client_network: e.target.value })}
                      placeholder="192.168.1.0/24"
                    />
                  </div>

                  <div className="col-span-2 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isCreating}>
                      {isCreating ? 'Adding...' : 'Add Router'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Total routers: {routers.length} | Active: {routers.filter(r => r.status === 'active').length}
            </div>

            <div className="grid gap-4">
              {routers.map((router) => (
                <div key={router.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{router.name}</h3>
                        {router.status === 'active' ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        {router.connection_status === 'connected' && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Wifi className="h-3 w-3" />
                            Connected
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        IP: {router.ip_address} | Network: {router.client_network}
                      </p>
                      <p className="text-sm">
                        Interface: {router.pppoe_interface} | DNS: {router.dns_servers}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleRouterStatus(router.id, router.status || 'inactive')}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        {router.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Router</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{router.name}"? This will also remove any RADIUS configuration associated with this router.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteRouter(router.id)}>
                              Delete Router
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}

              {routers.length === 0 && (
                <div className="text-center py-8">
                  <Router className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Routers Added</h3>
                  <p className="text-gray-500 mb-4">
                    Add your first MikroTik router to get started with network management.
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Router
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
