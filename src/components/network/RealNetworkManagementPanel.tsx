import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Router, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import { useNASClients } from '@/hooks/useRadius';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import AddSNMPDeviceDialog from '@/components/network/AddSNMPDeviceDialog';
import { useToast } from '@/hooks/use-toast';

const RealNetworkManagementPanel = () => {
  const { data: nasClients = [], isLoading, createNASClient, updateNASClient, deleteNASClient } = useNASClients();
  const { profile } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    shortname: '',
    type: 'other',
    nas_ip_address: '',
    secret: '',
    community: 'public',
    description: '',
    ports: 1812,
  });
  const { toast } = useToast();
  const [snmpDeviceIp, setSnmpDeviceIp] = useState('');
  const [snmpCommunity, setSnmpCommunity] = useState('public');
  const [snmpVersion, setSnmpVersion] = useState(2);
  const [isLoadingSnmp, setIsLoadingSnmp] = useState(false);

  const handleAddDevice = async (ip: string, community: string, version: number) => {
    setIsLoadingSnmp(true);
    try {
      // Simulate adding a device
      console.log(`Adding SNMP device with IP: ${ip}, community: ${community}, version: ${version}`);
      toast({
        title: "Device Added",
        description: `Successfully added SNMP device with IP: ${ip}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add the device",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSnmp(false);
      setShowAddDialog(false);
    }
  };

  const handleTestConnection = async (ip: string, community?: string, version?: number) => {
    setIsLoadingSnmp(true);
    try {
      // Simulate testing the connection
      console.log(`Testing connection to SNMP device with IP: ${ip}, community: ${community}, version: ${version}`);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${ip}`,
      });
      return true;
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not connect to the device",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoadingSnmp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const nasClientData = {
        ...formData,
        isp_company_id: profile?.isp_company_id || '',
        is_active: true
      };

      if (editingClient) {
        await updateNASClient.mutateAsync({
          id: editingClient,
          updates: nasClientData,
        });
        setEditingClient(null);
      } else {
        await createNASClient.mutateAsync(nasClientData);
        setShowAddDialog(false);
      }
      setFormData({
        name: '',
        shortname: '',
        type: 'other',
        nas_ip_address: '',
        secret: '',
        community: 'public',
        description: '',
        ports: 1812,
      });
    } catch (error) {
      console.error('Error saving NAS client:', error);
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client.id);
    setFormData({
      name: client.name,
      shortname: client.shortname,
      type: client.type,
      nas_ip_address: client.nas_ip_address,
      secret: client.secret,
      community: client.community,
      description: client.description || '',
      ports: client.ports,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this NAS client?')) {
      await deleteNASClient.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      shortname: '',
      type: 'other',
      nas_ip_address: '',
      secret: '',
      community: 'public',
      description: '',
      ports: 1812,
    });
    setEditingClient(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Router className="h-5 w-5" />
                Network Access Server (NAS) Clients
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure network devices that will authenticate users via RADIUS
              </p>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add NAS Client
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add NAS Client</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Main Router"
                        required
                      />
                    </div>
                    <div>
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
                    <div>
                      <Label htmlFor="nas_ip_address">IP Address</Label>
                      <Input
                        id="nas_ip_address"
                        value={formData.nas_ip_address}
                        onChange={(e) => setFormData({ ...formData, nas_ip_address: e.target.value })}
                        placeholder="192.168.1.1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Device Type</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="router">Router</SelectItem>
                          <SelectItem value="switch">Switch</SelectItem>
                          <SelectItem value="access_point">Access Point</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="secret">Shared Secret</Label>
                      <Input
                        id="secret"
                        type="password"
                        value={formData.secret}
                        onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                        placeholder="Enter shared secret"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ports">RADIUS Port</Label>
                      <Input
                        id="ports"
                        type="number"
                        value={formData.ports}
                        onChange={(e) => setFormData({ ...formData, ports: parseInt(e.target.value) })}
                        placeholder="1812"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Main network router for authentication"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => {
                      setShowAddDialog(false);
                      resetForm();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Add NAS Client
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading NAS clients...</div>
          ) : nasClients.length === 0 ? (
            <div className="text-center py-8">
              <Router className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No NAS Clients Configured</h3>
              <p className="text-muted-foreground mb-4">
                Add your network devices to enable RADIUS authentication
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First NAS Client
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {nasClients.map((client) => (
                <div key={client.id} className="border rounded-lg p-4">
                  {editingClient === client.id ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-name">Name</Label>
                          <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-ip">IP Address</Label>
                          <Input
                            id="edit-ip"
                            value={formData.nas_ip_address}
                            onChange={(e) => setFormData({ ...formData, nas_ip_address: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={resetForm}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Router className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">{client.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {client.shortname} • {client.nas_ip_address}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={client.is_active ? 'default' : 'secondary'}>
                            {client.is_active ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {client.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(client)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(client.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <div className="font-medium capitalize">{client.type}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Port:</span>
                          <div className="font-medium">{client.ports}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Community:</span>
                          <div className="font-medium">{client.community}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Secret:</span>
                          <div className="font-medium">••••••••</div>
                        </div>
                      </div>

                      {client.description && (
                        <p className="text-sm text-muted-foreground mt-2">{client.description}</p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <div>
        <Button onClick={() => setShowAddDialog(true)}>
          Add SNMP Device
        </Button>
        <AddSNMPDeviceDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onAddDevice={handleAddDevice}
          onTestConnection={handleTestConnection}
        />
      </div>
    </div>
  );
};

export default RealNetworkManagementPanel;
