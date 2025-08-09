import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, TestTube, Settings, Trash2, Router } from 'lucide-react';
import { useMikroTikRouters } from '@/hooks/useMikrotikRouters';

export const MikrotikRouterManager = () => {
  const { routers, isLoading, createRouter, updateRouter, deleteRouter, testConnection, isCreating, isDeleting, isTesting } = useMikrotikRouters();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRouter, setNewRouter] = useState({
    name: '',
    ip_address: '',
    admin_username: 'admin',
    admin_password: '',
    snmp_community: 'public',
    snmp_version: 2,
    pppoe_interface: 'pppoe-server1',
    dns_servers: '8.8.8.8,8.8.4.4',
    client_network: '10.0.0.0/24',
    gateway: '',
  });

  const handleAddRouter = () => {
    createRouter({
      ...newRouter,
      status: 'pending' as const,
      last_test_results: null,
      connection_status: 'offline' as const,
    });
    setNewRouter({
      name: '',
      ip_address: '',
      admin_username: 'admin',
      admin_password: '',
      snmp_community: 'public',
      snmp_version: 2,
      pppoe_interface: 'pppoe-server1',
      dns_servers: '8.8.8.8,8.8.4.4',
      client_network: '10.0.0.0/24',
      gateway: '',
    });
    setShowAddDialog(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Online</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      case 'testing':
        return <Badge variant="secondary">Testing</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
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
                    <Button onClick={handleAddRouter} disabled={isCreating}>
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

            <div className="grid gap-4">
              {routers.map((router) => (
                <div key={router.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{router.name}</h3>
                        {getStatusBadge(router.connection_status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{router.ip_address}</p>
                      <p className="text-sm">Interface: {router.pppoe_interface}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testConnection(router.id)}
                        disabled={isTesting}
                      >
                        <TestTube className="h-4 w-4 mr-1" />
                        Test
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
                              Are you sure you want to delete "{router.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteRouter(router.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  {router.last_test_results && (
                    <div className="text-xs text-muted-foreground">
                      Last test: {new Date(router.last_test_results.timestamp || '').toLocaleString()}
                    </div>
                  )}
                </div>
              ))}

              {routers.length === 0 && (
                <div className="text-center py-8">
                  <Router className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Routers Added</h3>
                  <p className="text-gray-500 mb-4">
                    Add your first MikroTik router to start managing network access.
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
