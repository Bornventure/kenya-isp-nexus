
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useRadiusServers } from '@/hooks/useRadiusServers';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';
import { useRadiusUsers } from '@/hooks/useRadiusUsers';
import { Plus, Server, Trash2, Settings, Clock, CheckCircle, Users, Database, Shield, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const formatSyncStatus = (lastSyncedAt?: string) => {
  if (!lastSyncedAt) {
    return { text: 'Never synced', variant: 'secondary' as const, icon: Clock };
  }
  
  const syncDate = new Date(lastSyncedAt);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - syncDate.getTime()) / (1000 * 60));
  
  if (diffMinutes < 5) {
    return { text: 'Recently synced', variant: 'default' as const, icon: CheckCircle };
  } else if (diffMinutes < 60) {
    return { text: `${diffMinutes}m ago`, variant: 'outline' as const, icon: Clock };
  } else {
    const diffHours = Math.floor(diffMinutes / 60);
    return { text: `${diffHours}h ago`, variant: 'secondary' as const, icon: Clock };
  }
};

export const RadiusServerManager = () => {
  const { radiusServers, isLoading, createRadiusServer, updateRadiusServer, deleteRadiusServer, isCreating, isDeleting } = useRadiusServers();
  const { routers } = useMikrotikRouters();
  const { users } = useRadiusUsers();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    server_address: '',
    auth_port: 1812,
    accounting_port: 1813,
    shared_secret: '',
    timeout_seconds: 30,
    is_enabled: true,
    is_primary: false,
    router_id: '',
  });

  // Get routers that are not already assigned to RADIUS servers
  const availableRouters = routers.filter(router => 
    !radiusServers.some(server => server.router_id === router.id)
  );

  const handleSubmit = () => {
    if (!formData.router_id || !formData.name || !formData.shared_secret) {
      return;
    }

    createRadiusServer(formData);
    setFormData({
      name: '',
      server_address: '',
      auth_port: 1812,
      accounting_port: 1813,
      shared_secret: '',
      timeout_seconds: 30,
      is_enabled: true,
      is_primary: false,
      router_id: '',
    });
    setShowAddDialog(false);
  };

  const toggleServerStatus = (serverId: string, currentStatus: boolean) => {
    updateRadiusServer({
      id: serverId,
      updates: { is_enabled: !currentStatus }
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading RADIUS servers...</div>
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
              <Server className="h-5 w-5" />
              RADIUS Server Configuration
            </CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Enable Router for RADIUS
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Enable Router for RADIUS Authentication</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="router_id">Select Router *</Label>
                    <Select value={formData.router_id} onValueChange={(value) => {
                      const selectedRouter = routers.find(r => r.id === value);
                      setFormData({ 
                        ...formData, 
                        router_id: value,
                        name: selectedRouter?.name || '',
                        server_address: selectedRouter?.ip_address || ''
                      });
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a router" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRouters.map((router) => (
                          <SelectItem key={router.id} value={router.id}>
                            {router.name} ({router.ip_address})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">RADIUS Client Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Branch Office Router"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="server_address">Server Address</Label>
                    <Input
                      id="server_address"
                      value={formData.server_address}
                      onChange={(e) => setFormData({ ...formData, server_address: e.target.value })}
                      placeholder="Will use router IP if empty"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shared_secret">Shared Secret *</Label>
                    <Input
                      id="shared_secret"
                      type="password"
                      value={formData.shared_secret}
                      onChange={(e) => setFormData({ ...formData, shared_secret: e.target.value })}
                      placeholder="Enter strong shared secret"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="auth_port">Auth Port</Label>
                    <Input
                      id="auth_port"
                      type="number"
                      value={formData.auth_port}
                      onChange={(e) => setFormData({ ...formData, auth_port: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accounting_port">Accounting Port</Label>
                    <Input
                      id="accounting_port"
                      type="number"
                      value={formData.accounting_port}
                      onChange={(e) => setFormData({ ...formData, accounting_port: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout (seconds)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={formData.timeout_seconds}
                      onChange={(e) => setFormData({ ...formData, timeout_seconds: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_enabled"
                      checked={formData.is_enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
                    />
                    <Label htmlFor="is_enabled">Enable RADIUS</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_primary"
                      checked={formData.is_primary}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
                    />
                    <Label htmlFor="is_primary">Primary Server</Label>
                  </div>

                  <div className="col-span-2 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isCreating}>
                      {isCreating ? 'Creating...' : 'Enable for RADIUS'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">RADIUS Servers</p>
                      <p className="text-2xl font-bold">{radiusServers.length}</p>
                    </div>
                    <Server className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Active Servers</p>
                      <p className="text-2xl font-bold text-green-600">{radiusServers.filter(s => s.is_enabled).length}</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">RADIUS Users</p>
                      <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Sync Status</p>
                      <p className="text-sm font-bold text-green-600">EC2 Connected</p>
                    </div>
                    <Database className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4">
              {radiusServers.map((server) => {
                const syncStatus = formatSyncStatus(server.last_synced_at);
                const SyncIcon = syncStatus.icon;
                
                return (
                  <div key={server.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{server.name}</h3>
                          {server.is_enabled ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">Enabled</Badge>
                          ) : (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                          {server.is_primary && (
                            <Badge variant="outline">Primary</Badge>
                          )}
                          <Badge variant={syncStatus.variant} className="flex items-center gap-1">
                            <SyncIcon className="h-3 w-3" />
                            {syncStatus.text}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <p>🖥️ Router: {server.router?.name}</p>
                          <p>🌐 IP: {server.router?.ip_address}</p>
                          <p>🔐 Auth Port: {server.auth_port}</p>
                          <p>📊 Accounting: {server.accounting_port}</p>
                          <p>⏱️ Timeout: {server.timeout_seconds}s</p>
                          <p>👥 Users: {users.filter(u => u.isp_company_id === server.router?.name).length}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleServerStatus(server.id, server.is_enabled)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          {server.is_enabled ? 'Disable' : 'Enable'}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove RADIUS Configuration</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove RADIUS configuration for "{server.name}"? 
                                The router will remain in your inventory but won't authenticate via RADIUS.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteRadiusServer(server.id)}>
                                Remove RADIUS Config
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                );
              })}

              {radiusServers.length === 0 && (
                <div className="text-center py-8">
                  <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No RADIUS Servers Configured</h3>
                  <p className="text-gray-500 mb-4">
                    Enable routers for RADIUS authentication to manage client access.
                  </p>
                  {availableRouters.length > 0 ? (
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Enable Router for RADIUS
                    </Button>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Add routers to your inventory first to enable RADIUS authentication.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
