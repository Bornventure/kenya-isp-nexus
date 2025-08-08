
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMikroTikRouters, MikroTikRouter } from '@/hooks/useMikroTikRouters';
import { Plus, Edit, Trash2, TestTube, Router, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const MikroTikRouterManager = () => {
  const { routers, isLoading, createRouter, updateRouter, deleteRouter, testConnection, isCreating, isTesting } = useMikroTikRouters();
  const [selectedRouter, setSelectedRouter] = useState<MikroTikRouter | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    admin_username: 'admin',
    admin_password: '',
    snmp_community: 'public',
    snmp_version: 2,
    pppoe_interface: 'ether1',
    dns_servers: '8.8.8.8,8.8.4.4',
    client_network: '10.10.0.0/16',
    gateway: '192.168.1.1',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      ip_address: '',
      admin_username: 'admin',
      admin_password: '',
      snmp_community: 'public',
      snmp_version: 2,
      pppoe_interface: 'ether1',
      dns_servers: '8.8.8.8,8.8.4.4',
      client_network: '10.10.0.0/16',
      gateway: '192.168.1.1',
    });
  };

  const handleAdd = () => {
    createRouter({
      ...formData,
      status: 'pending',
      last_test_results: {},
      connection_status: 'offline',
    });
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = () => {
    if (!selectedRouter) return;
    updateRouter({
      id: selectedRouter.id,
      updates: formData
    });
    resetForm();
    setIsEditDialogOpen(false);
    setSelectedRouter(null);
  };

  const handleDelete = (router: MikroTikRouter) => {
    deleteRouter(router.id);
  };

  const handleTest = (router: MikroTikRouter) => {
    testConnection(router.id);
  };

  const openEditDialog = (router: MikroTikRouter) => {
    setSelectedRouter(router);
    setFormData({
      name: router.name,
      ip_address: router.ip_address,
      admin_username: router.admin_username,
      admin_password: router.admin_password,
      snmp_community: router.snmp_community,
      snmp_version: router.snmp_version,
      pppoe_interface: router.pppoe_interface,
      dns_servers: router.dns_servers,
      client_network: router.client_network,
      gateway: router.gateway,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusIcon = (router: MikroTikRouter) => {
    if (router.connection_status === 'testing') return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
    if (router.connection_status === 'online') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (router.connection_status === 'offline') return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertCircle className="h-4 w-4 text-gray-500" />;
  };

  const getStatusBadge = (router: MikroTikRouter) => {
    const variants: any = {
      online: 'default',
      offline: 'destructive',
      testing: 'secondary',
    };
    return (
      <Badge variant={variants[router.connection_status] || 'secondary'}>
        {router.connection_status}
      </Badge>
    );
  };

  const renderTestResults = (results: any) => {
    if (!results || Object.keys(results).length === 0) return null;

    return (
      <div className="mt-2 space-y-1">
        <p className="text-sm font-medium">Last Test Results:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            {results.ping ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
            Ping: {results.ping ? 'OK' : 'Failed'}
          </div>
          <div className="flex items-center gap-1">
            {results.snmp ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
            SNMP: {results.snmp ? 'OK' : 'Failed'}
          </div>
          <div className="flex items-center gap-1">
            {results.ssh ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
            SSH: {results.ssh ? 'OK' : 'Failed'}
          </div>
          <div className="flex items-center gap-1">
            {results.api ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
            API: {results.api ? 'OK' : 'Failed'}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-6">Loading MikroTik routers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">MikroTik Router Management</h2>
          <p className="text-muted-foreground">
            Manage your MikroTik routers for network control and RADIUS integration
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList>
                <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                <TabsTrigger value="network">Network Config</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Router Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Main Router"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ip_address">IP Address</Label>
                    <Input
                      id="ip_address"
                      value={formData.ip_address}
                      onChange={(e) => setFormData(prev => ({ ...prev, ip_address: e.target.value }))}
                      placeholder="192.168.1.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin_username">Admin Username</Label>
                    <Input
                      id="admin_username"
                      value={formData.admin_username}
                      onChange={(e) => setFormData(prev => ({ ...prev, admin_username: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin_password">Admin Password</Label>
                    <Input
                      id="admin_password"
                      type="password"
                      value={formData.admin_password}
                      onChange={(e) => setFormData(prev => ({ ...prev, admin_password: e.target.value }))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="network" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client_network">Client Network</Label>
                    <Input
                      id="client_network"
                      value={formData.client_network}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_network: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gateway">Gateway</Label>
                    <Input
                      id="gateway"
                      value={formData.gateway}
                      onChange={(e) => setFormData(prev => ({ ...prev, gateway: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pppoe_interface">PPPoE Interface</Label>
                    <Input
                      id="pppoe_interface"
                      value={formData.pppoe_interface}
                      onChange={(e) => setFormData(prev => ({ ...prev, pppoe_interface: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dns_servers">DNS Servers</Label>
                    <Input
                      id="dns_servers"
                      value={formData.dns_servers}
                      onChange={(e) => setFormData(prev => ({ ...prev, dns_servers: e.target.value }))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="snmp_community">SNMP Community</Label>
                    <Input
                      id="snmp_community"
                      value={formData.snmp_community}
                      onChange={(e) => setFormData(prev => ({ ...prev, snmp_community: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="snmp_version">SNMP Version</Label>
                    <Select value={formData.snmp_version.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, snmp_version: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">v1</SelectItem>
                        <SelectItem value="2">v2c</SelectItem>
                        <SelectItem value="3">v3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => { resetForm(); setIsAddDialogOpen(false); }}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={isCreating}>
                {isCreating ? 'Adding...' : 'Add Router'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routers.map((router) => (
          <Card key={router.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Router className="h-5 w-5" />
                  <CardTitle className="text-lg">{router.name}</CardTitle>
                </div>
                {getStatusIcon(router)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{router.ip_address}</span>
                {getStatusBadge(router)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p><strong>Interface:</strong> {router.pppoe_interface}</p>
                <p><strong>Network:</strong> {router.client_network}</p>
                <p><strong>Gateway:</strong> {router.gateway}</p>
              </div>

              {renderTestResults(router.last_test_results)}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTest(router)}
                  disabled={isTesting || router.connection_status === 'testing'}
                >
                  <TestTube className="h-3 w-3 mr-1" />
                  {router.connection_status === 'testing' ? 'Testing...' : 'Test'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(router)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-3 w-3 mr-1" />
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
                      <AlertDialogAction onClick={() => handleDelete(router)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}

        {routers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Router className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Routers Added</h3>
            <p className="text-gray-500 mb-4">
              Add your first MikroTik router to start managing network access and speed limits.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Router
            </Button>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Router: {selectedRouter?.name}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="network">Network Config</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_name">Router Name</Label>
                  <Input
                    id="edit_name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_ip_address">IP Address</Label>
                  <Input
                    id="edit_ip_address"
                    value={formData.ip_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, ip_address: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_admin_username">Admin Username</Label>
                  <Input
                    id="edit_admin_username"
                    value={formData.admin_username}
                    onChange={(e) => setFormData(prev => ({ ...prev, admin_username: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_admin_password">Admin Password</Label>
                  <Input
                    id="edit_admin_password"
                    type="password"
                    value={formData.admin_password}
                    onChange={(e) => setFormData(prev => ({ ...prev, admin_password: e.target.value }))}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="network" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_client_network">Client Network</Label>
                  <Input
                    id="edit_client_network"
                    value={formData.client_network}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_network: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_gateway">Gateway</Label>
                  <Input
                    id="edit_gateway"
                    value={formData.gateway}
                    onChange={(e) => setFormData(prev => ({ ...prev, gateway: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_pppoe_interface">PPPoE Interface</Label>
                  <Input
                    id="edit_pppoe_interface"
                    value={formData.pppoe_interface}
                    onChange={(e) => setFormData(prev => ({ ...prev, pppoe_interface: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_dns_servers">DNS Servers</Label>
                  <Input
                    id="edit_dns_servers"
                    value={formData.dns_servers}
                    onChange={(e) => setFormData(prev => ({ ...prev, dns_servers: e.target.value }))}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_snmp_community">SNMP Community</Label>
                  <Input
                    id="edit_snmp_community"
                    value={formData.snmp_community}
                    onChange={(e) => setFormData(prev => ({ ...prev, snmp_community: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_snmp_version">SNMP Version</Label>
                  <Select value={formData.snmp_version.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, snmp_version: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">v1</SelectItem>
                      <SelectItem value="2">v2c</SelectItem>
                      <SelectItem value="3">v3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => { resetForm(); setIsEditDialogOpen(false); setSelectedRouter(null); }}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Update Router
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MikroTikRouterManager;
