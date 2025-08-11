
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Server, Edit, Trash2, TestTube } from 'lucide-react';
import { useNASClients } from '@/hooks/useRadius';

const NASManagementPanel = () => {
  const { data: nasClients = [], createNASClient, updateNASClient, deleteNASClient } = useNASClients();
  const [showAddForm, setShowAddForm] = useState(false);
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

  const handleSubmit = () => {
    if (editingClient) {
      updateNASClient.mutate({ 
        id: editingClient.id, 
        updates: { ...formData, isp_company_id: 'current-company' }
      });
    } else {
      createNASClient.mutate({ ...formData, isp_company_id: 'current-company' });
    }
    
    resetForm();
  };

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
    setShowAddForm(false);
    setEditingClient(null);
  };

  const handleEdit = (client: any) => {
    setFormData({
      name: client.name,
      shortname: client.shortname,
      type: client.type,
      nas_ip_address: client.nas_ip_address,
      secret: client.secret,
      ports: client.ports,
      community: client.community,
      description: client.description || '',
      is_active: client.is_active
    });
    setEditingClient(client);
    setShowAddForm(true);
  };

  const testConnection = (client: any) => {
    console.log('Testing connection to NAS client:', client.name);
    // In real implementation, this would test RADIUS connectivity
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Network Access Server (NAS) Clients</h3>
          <p className="text-sm text-muted-foreground">
            Configure devices that will authenticate users via RADIUS
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add NAS Client
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingClient ? 'Edit NAS Client' : 'Add New NAS Client'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Client Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Main Router"
                />
              </div>
              <div>
                <Label htmlFor="shortname">Short Name</Label>
                <Input
                  id="shortname"
                  value={formData.shortname}
                  onChange={(e) => setFormData({...formData, shortname: e.target.value})}
                  placeholder="router1"
                />
              </div>
              <div>
                <Label htmlFor="nas_ip">IP Address</Label>
                <Input
                  id="nas_ip"
                  value={formData.nas_ip_address}
                  onChange={(e) => setFormData({...formData, nas_ip_address: e.target.value})}
                  placeholder="192.168.1.1"
                />
              </div>
              <div>
                <Label htmlFor="type">NAS Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mikrotik">MikroTik</SelectItem>
                    <SelectItem value="cisco">Cisco</SelectItem>
                    <SelectItem value="ubiquiti">Ubiquiti</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="secret">Shared Secret</Label>
                <Input
                  id="secret"
                  type="password"
                  value={formData.secret}
                  onChange={(e) => setFormData({...formData, secret: e.target.value})}
                  placeholder="Enter shared secret"
                />
              </div>
              <div>
                <Label htmlFor="ports">RADIUS Port</Label>
                <Input
                  id="ports"
                  type="number"
                  value={formData.ports}
                  onChange={(e) => setFormData({...formData, ports: parseInt(e.target.value)})}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Optional description"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSubmit}>
                {editingClient ? 'Update Client' : 'Add Client'}
              </Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* NAS Clients List */}
      <div className="grid gap-4">
        {nasClients.map((client) => (
          <Card key={client.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Server className="h-8 w-8 text-blue-500" />
                  <div>
                    <h4 className="font-medium">{client.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {client.nas_ip_address} ({client.shortname})
                    </p>
                    {client.description && (
                      <p className="text-sm text-muted-foreground">{client.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={client.is_active ? 'default' : 'secondary'}>
                    {client.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => testConnection(client)}>
                    <TestTube className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(client)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => deleteNASClient.mutate(client.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div>
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <div className="font-medium capitalize">{client.type}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Port:</span>
                  <div className="font-medium">{client.ports}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Community:</span>
                  <div className="font-medium">{client.community}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {nasClients.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Server className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No NAS Clients Configured</h3>
              <p className="text-muted-foreground mb-4">
                Add your network devices to enable RADIUS authentication
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First NAS Client
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Info Panel */}
      <Card>
        <CardHeader>
          <CardTitle>NAS Client Configuration Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>
              Network Access Server (NAS) clients are devices like routers, switches, or access points 
              that authenticate users through your RADIUS server.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Required Information:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Device IP address</li>
                  <li>• Shared secret (password)</li>
                  <li>• Device type (MikroTik, Cisco, etc.)</li>
                  <li>• RADIUS port (usually 1812)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Device Configuration:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Enable RADIUS authentication</li>
                  <li>• Set RADIUS server IP</li>
                  <li>• Configure shared secret</li>
                  <li>• Test connectivity</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NASManagementPanel;
