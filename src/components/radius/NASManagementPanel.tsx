
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Server, Settings } from 'lucide-react';
import { useNASClients } from '@/hooks/useNASClients';

interface NASClient {
  id: string;
  name: string;
  shortname: string;
  type: string;
  nas_ip_address: string;
  secret: string;
  ports: number;
  community: string;
  description?: string;
  is_active: boolean;
  isp_company_id?: string;
  created_at: string;
  updated_at: string;
}

const NASManagementPanel = () => {
  const { nasClients, isLoading, createNASClient, deleteNASClient, isCreating, isDeleting } = useNASClients();
  const [isAddingNAS, setIsAddingNAS] = useState(false);
  const [newNAS, setNewNAS] = useState({
    name: '',
    shortname: '',
    type: 'mikrotik',
    nas_ip_address: '',
    secret: '',
    ports: 1812,
    community: 'public',
    description: '',
    is_active: true
  });

  const handleAddNAS = async () => {
    try {
      await createNASClient(newNAS);
      setNewNAS({
        name: '',
        shortname: '',
        type: 'mikrotik',
        nas_ip_address: '',
        secret: '',
        ports: 1812,
        community: 'public',
        description: '',
        is_active: true
      });
      setIsAddingNAS(false);
    } catch (error) {
      console.error('Failed to add NAS client:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Loading NAS Clients...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              NAS Clients
            </span>
            <Button onClick={() => setIsAddingNAS(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add NAS Client
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nasClients.map((nas) => (
              <div key={nas.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{nas.name}</h3>
                    <p className="text-sm text-muted-foreground">{nas.nas_ip_address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={nas.is_active ? "default" : "secondary"}>
                      {nas.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteNASClient(nas.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {nas.type}
                  </div>
                  <div>
                    <span className="font-medium">Port:</span> {nas.ports}
                  </div>
                  <div>
                    <span className="font-medium">Shortname:</span> {nas.shortname}
                  </div>
                  <div>
                    <span className="font-medium">Community:</span> {nas.community}
                  </div>
                </div>
                {nas.description && (
                  <p className="text-sm text-muted-foreground">{nas.description}</p>
                )}
              </div>
            ))}

            {nasClients.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No NAS clients configured yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isAddingNAS && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Add New NAS Client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newNAS.name}
                  onChange={(e) => setNewNAS({ ...newNAS, name: e.target.value })}
                  placeholder="MikroTik Router"
                />
              </div>
              <div>
                <Label htmlFor="shortname">Short Name</Label>
                <Input
                  id="shortname"
                  value={newNAS.shortname}
                  onChange={(e) => setNewNAS({ ...newNAS, shortname: e.target.value })}
                  placeholder="mikrotik"
                />
              </div>
              <div>
                <Label htmlFor="nas_ip">IP Address</Label>
                <Input
                  id="nas_ip"
                  value={newNAS.nas_ip_address}
                  onChange={(e) => setNewNAS({ ...newNAS, nas_ip_address: e.target.value })}
                  placeholder="192.168.1.1"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newNAS.type} onValueChange={(value) => setNewNAS({ ...newNAS, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mikrotik">MikroTik</SelectItem>
                    <SelectItem value="cisco">Cisco</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="secret">Shared Secret</Label>
                <Input
                  id="secret"
                  type="password"
                  value={newNAS.secret}
                  onChange={(e) => setNewNAS({ ...newNAS, secret: e.target.value })}
                  placeholder="Enter shared secret"
                />
              </div>
              <div>
                <Label htmlFor="ports">Port</Label>
                <Input
                  id="ports"
                  type="number"
                  value={newNAS.ports}
                  onChange={(e) => setNewNAS({ ...newNAS, ports: parseInt(e.target.value) || 1812 })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="community">SNMP Community</Label>
              <Input
                id="community"
                value={newNAS.community}
                onChange={(e) => setNewNAS({ ...newNAS, community: e.target.value })}
                placeholder="public"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newNAS.description}
                onChange={(e) => setNewNAS({ ...newNAS, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddNAS} disabled={isCreating}>
                {isCreating ? 'Adding...' : 'Add NAS Client'}
              </Button>
              <Button variant="outline" onClick={() => setIsAddingNAS(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NASManagementPanel;
