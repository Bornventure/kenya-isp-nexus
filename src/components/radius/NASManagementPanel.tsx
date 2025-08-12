
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Router, 
  Edit, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import { useNASClients } from '@/hooks/useRadius';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const NASManagementPanel = () => {
  const { data: nasClients, isLoading, createNASClient, updateNASClient, deleteNASClient } = useNASClients();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    shortname: '',
    type: 'other',
    nas_ip_address: '',
    secret: '',
    ports: 1812,
    community: 'public',
    description: '',
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      shortname: '',
      type: 'other',
      nas_ip_address: '',
      secret: '',
      ports: 1812,
      community: 'public',
      description: '',
      is_active: true
    });
    setEditingClient(null);
  };

  const handleOpenDialog = (client?: any) => {
    if (client) {
      setEditingClient(client);
      setFormData(client);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingClient) {
        await updateNASClient.mutateAsync({
          id: editingClient.id,
          updates: formData
        });
      } else {
        await createNASClient.mutateAsync(formData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving NAS client:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this NAS client?')) {
      try {
        await deleteNASClient.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting NAS client:', error);
      }
    }
  };

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let secret = '';
    for (let i = 0; i < 16; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, secret });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">NAS Client Management</h2>
          <p className="text-muted-foreground">
            Configure Network Access Server (NAS) clients for RADIUS authentication
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add NAS Client
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <Settings className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nasClients.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="text-center p-8">
                <Router className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No NAS Clients</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first NAS client to enable RADIUS authentication
                </p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add NAS Client
                </Button>
              </CardContent>
            </Card>
          ) : (
            nasClients.map((client) => (
              <Card key={client.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Router className="h-5 w-5" />
                      {client.name}
                    </div>
                    <Badge variant={client.is_active ? 'default' : 'secondary'}>
                      {client.is_active ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {client.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Short Name:</span> {client.shortname}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {client.type}
                    </div>
                    <div>
                      <span className="font-medium">IP Address:</span> {client.nas_ip_address}
                    </div>
                    <div>
                      <span className="font-medium">Ports:</span> {client.ports}
                    </div>
                    <div>
                      <span className="font-medium">Community:</span> {client.community}
                    </div>
                    {client.description && (
                      <div>
                        <span className="font-medium">Description:</span> {client.description}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(client)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(client.id)}
                      className="flex-1"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Edit NAS Client' : 'Add NAS Client'}
            </DialogTitle>
            <DialogDescription>
              {editingClient 
                ? 'Update the NAS client configuration'
                : 'Configure a new Network Access Server client'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Router 1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortname">Short Name</Label>
                <Input
                  id="shortname"
                  value={formData.shortname}
                  onChange={(e) => setFormData({ ...formData, shortname: e.target.value })}
                  placeholder="router1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cisco">Cisco</SelectItem>
                    <SelectItem value="mikrotik">MikroTik</SelectItem>
                    <SelectItem value="ubiquiti">Ubiquiti</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nas_ip_address">IP Address</Label>
                <Input
                  id="nas_ip_address"
                  value={formData.nas_ip_address}
                  onChange={(e) => setFormData({ ...formData, nas_ip_address: e.target.value })}
                  placeholder="192.168.1.1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ports">RADIUS Port</Label>
                <Input
                  id="ports"
                  type="number"
                  value={formData.ports}
                  onChange={(e) => setFormData({ ...formData, ports: parseInt(e.target.value) })}
                  placeholder="1812"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="community">SNMP Community</Label>
                <Input
                  id="community"
                  value={formData.community}
                  onChange={(e) => setFormData({ ...formData, community: e.target.value })}
                  placeholder="public"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret">Shared Secret</Label>
              <div className="flex gap-2">
                <Input
                  id="secret"
                  type="password"
                  value={formData.secret}
                  onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                  placeholder="Enter shared secret"
                  required
                />
                <Button type="button" variant="outline" onClick={generateSecret}>
                  Generate
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingClient ? 'Update' : 'Create'} NAS Client
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NASManagementPanel;
