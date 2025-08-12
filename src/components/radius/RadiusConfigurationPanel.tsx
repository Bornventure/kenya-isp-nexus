
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Server, 
  Users, 
  Edit, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Shield
} from 'lucide-react';
import { useRadiusServers, useRadiusGroups } from '@/hooks/useRadius';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const RadiusConfigurationPanel = () => {
  const { data: servers = [], isLoading: serversLoading } = useRadiusServers();
  const { data: groups = [], isLoading: groupsLoading } = useRadiusGroups();
  
  const [isServerDialogOpen, setIsServerDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<any>(null);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  
  const [serverFormData, setServerFormData] = useState({
    name: '',
    server_address: '',
    auth_port: 1812,
    accounting_port: 1813,
    shared_secret: '',
    timeout_seconds: 5,
    is_enabled: true,
    is_primary: false
  });

  const [groupFormData, setGroupFormData] = useState({
    name: '',
    description: '',
    upload_limit_mbps: 10,
    download_limit_mbps: 10,
    session_timeout_seconds: 0,
    idle_timeout_seconds: 0,
    is_active: true
  });

  const handleOpenServerDialog = (server?: any) => {
    if (server) {
      setEditingServer(server);
      setServerFormData(server);
    } else {
      setEditingServer(null);
      setServerFormData({
        name: '',
        server_address: '',
        auth_port: 1812,
        accounting_port: 1813,
        shared_secret: '',
        timeout_seconds: 5,
        is_enabled: true,
        is_primary: false
      });
    }
    setIsServerDialogOpen(true);
  };

  const handleOpenGroupDialog = (group?: any) => {
    if (group) {
      setEditingGroup(group);
      setGroupFormData(group);
    } else {
      setEditingGroup(null);
      setGroupFormData({
        name: '',
        description: '',
        upload_limit_mbps: 10,
        download_limit_mbps: 10,
        session_timeout_seconds: 0,
        idle_timeout_seconds: 0,
        is_active: true
      });
    }
    setIsGroupDialogOpen(true);
  };

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let secret = '';
    for (let i = 0; i < 24; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setServerFormData({ ...serverFormData, shared_secret: secret });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">RADIUS Configuration</h2>
        <p className="text-muted-foreground">
          Configure RADIUS servers and user groups for network authentication
        </p>
      </div>

      <Tabs defaultValue="servers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="servers">RADIUS Servers</TabsTrigger>
          <TabsTrigger value="groups">User Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="servers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">RADIUS Servers</h3>
            <Button onClick={() => handleOpenServerDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Server
            </Button>
          </div>

          {serversLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <Shield className="h-8 w-8 animate-spin" />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {servers.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center p-8">
                    <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h4 className="text-lg font-semibold mb-2">No RADIUS Servers</h4>
                    <p className="text-muted-foreground mb-4">
                      Configure your first RADIUS server to enable authentication
                    </p>
                    <Button onClick={() => handleOpenServerDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Server
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                servers.map((server) => (
                  <Card key={server.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Server className="h-5 w-5" />
                          {server.name}
                        </div>
                        <div className="flex gap-1">
                          {server.is_primary && (
                            <Badge variant="default">Primary</Badge>
                          )}
                          <Badge variant={server.is_enabled ? 'default' : 'secondary'}>
                            {server.is_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Address:</span> {server.server_address}
                        </div>
                        <div>
                          <span className="font-medium">Auth Port:</span> {server.auth_port}
                        </div>
                        <div>
                          <span className="font-medium">Accounting Port:</span> {server.accounting_port}
                        </div>
                        <div>
                          <span className="font-medium">Timeout:</span> {server.timeout_seconds}s
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenServerDialog(server)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">User Groups</h3>
            <Button onClick={() => handleOpenGroupDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Group
            </Button>
          </div>

          {groupsLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <Users className="h-8 w-8 animate-spin" />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {groups.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center p-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h4 className="text-lg font-semibold mb-2">No User Groups</h4>
                    <p className="text-muted-foreground mb-4">
                      Create user groups to manage bandwidth and access policies
                    </p>
                    <Button onClick={() => handleOpenGroupDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Group
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                groups.map((group) => (
                  <Card key={group.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {group.name}
                        </div>
                        <Badge variant={group.is_active ? 'default' : 'secondary'}>
                          {group.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        {group.description && (
                          <div>
                            <span className="font-medium">Description:</span> {group.description}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Download:</span> {group.download_limit_mbps} Mbps
                        </div>
                        <div>
                          <span className="font-medium">Upload:</span> {group.upload_limit_mbps} Mbps
                        </div>
                        {group.session_timeout_seconds > 0 && (
                          <div>
                            <span className="font-medium">Session Timeout:</span> {group.session_timeout_seconds}s
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenGroupDialog(group)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Server Dialog */}
      <Dialog open={isServerDialogOpen} onOpenChange={setIsServerDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingServer ? 'Edit RADIUS Server' : 'Add RADIUS Server'}
            </DialogTitle>
            <DialogDescription>
              Configure RADIUS server connection settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="server_name">Server Name</Label>
              <Input
                id="server_name"
                value={serverFormData.name}
                onChange={(e) => setServerFormData({ ...serverFormData, name: e.target.value })}
                placeholder="Primary RADIUS"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="server_address">Server Address</Label>
              <Input
                id="server_address"
                value={serverFormData.server_address}
                onChange={(e) => setServerFormData({ ...serverFormData, server_address: e.target.value })}
                placeholder="192.168.1.100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="auth_port">Auth Port</Label>
                <Input
                  id="auth_port"
                  type="number"
                  value={serverFormData.auth_port}
                  onChange={(e) => setServerFormData({ ...serverFormData, auth_port: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accounting_port">Accounting Port</Label>
                <Input
                  id="accounting_port"
                  type="number"
                  value={serverFormData.accounting_port}
                  onChange={(e) => setServerFormData({ ...serverFormData, accounting_port: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shared_secret">Shared Secret</Label>
              <div className="flex gap-2">
                <Input
                  id="shared_secret"
                  type="password"
                  value={serverFormData.shared_secret}
                  onChange={(e) => setServerFormData({ ...serverFormData, shared_secret: e.target.value })}
                  placeholder="Enter shared secret"
                />
                <Button type="button" variant="outline" onClick={generateSecret}>
                  Generate
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                value={serverFormData.timeout_seconds}
                onChange={(e) => setServerFormData({ ...serverFormData, timeout_seconds: parseInt(e.target.value) })}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_enabled"
                  checked={serverFormData.is_enabled}
                  onCheckedChange={(checked) => setServerFormData({ ...serverFormData, is_enabled: checked })}
                />
                <Label htmlFor="is_enabled">Enabled</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_primary"
                  checked={serverFormData.is_primary}
                  onCheckedChange={(checked) => setServerFormData({ ...serverFormData, is_primary: checked })}
                />
                <Label htmlFor="is_primary">Primary Server</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsServerDialogOpen(false)}>
              Cancel
            </Button>
            <Button>
              {editingServer ? 'Update' : 'Create'} Server
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? 'Edit User Group' : 'Add User Group'}
            </DialogTitle>
            <DialogDescription>
              Configure user group bandwidth and access policies
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group_name">Group Name</Label>
              <Input
                id="group_name"
                value={groupFormData.name}
                onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                placeholder="Standard Users"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group_description">Description</Label>
              <Textarea
                id="group_description"
                value={groupFormData.description}
                onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                placeholder="Description of this user group"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="download_limit">Download Limit (Mbps)</Label>
                <Input
                  id="download_limit"
                  type="number"
                  value={groupFormData.download_limit_mbps}
                  onChange={(e) => setGroupFormData({ ...groupFormData, download_limit_mbps: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload_limit">Upload Limit (Mbps)</Label>
                <Input
                  id="upload_limit"
                  type="number"
                  value={groupFormData.upload_limit_mbps}
                  onChange={(e) => setGroupFormData({ ...groupFormData, upload_limit_mbps: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session_timeout">Session Timeout (seconds)</Label>
                <Input
                  id="session_timeout"
                  type="number"
                  value={groupFormData.session_timeout_seconds}
                  onChange={(e) => setGroupFormData({ ...groupFormData, session_timeout_seconds: parseInt(e.target.value) })}
                  placeholder="0 = unlimited"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idle_timeout">Idle Timeout (seconds)</Label>
                <Input
                  id="idle_timeout"
                  type="number"
                  value={groupFormData.idle_timeout_seconds}
                  onChange={(e) => setGroupFormData({ ...groupFormData, idle_timeout_seconds: parseInt(e.target.value) })}
                  placeholder="0 = unlimited"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="group_is_active"
                checked={groupFormData.is_active}
                onCheckedChange={(checked) => setGroupFormData({ ...groupFormData, is_active: checked })}
              />
              <Label htmlFor="group_is_active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button>
              {editingGroup ? 'Update' : 'Create'} Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RadiusConfigurationPanel;
