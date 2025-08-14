import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, UserPlus, Search, Edit, Trash2, MapPin } from 'lucide-react';
import { useClients, type DatabaseClient } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';
import ClientAddDialog from '@/components/clients/ClientAddDialog';
import ClientEditDialog from '@/components/clients/ClientEditDialog';
import { useNavigate } from 'react-router-dom';
import type { ClientType, ConnectionType, ClientStatus } from '@/types/client';

const Clients = () => {
  const { clients, isLoading, error, createClient, updateClient, deleteClient, isCreating, isUpdating, isDeleting } = useClients();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<DatabaseClient | null>(null);

  const initialFormData = {
    name: '',
    email: '',
    phone: '',
    address: '',
    county: '',
    sub_county: '',
    id_number: '',
    kra_pin_number: '',
    mpesa_number: '',
    client_type: 'individual' as ClientType,
    connection_type: 'fiber' as ConnectionType,
    monthly_rate: 0,
    service_package_id: '',
    latitude: null as number | null,
    longitude: null as number | null,
  };

  // Filter clients based on search term and filters
  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      client.phone.includes(searchTerm);

    const matchesType = filterType === 'all' || client.client_type === filterType;
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleEdit = (client: DatabaseClient) => {
    setSelectedClient(client);
    setShowEditDialog(true);
  };

  const handleDelete = (client: DatabaseClient) => {
    if (window.confirm(`Are you sure you want to delete client ${client.name}?`)) {
      deleteClient(client.id);
      toast({
        title: "Client Deleted",
        description: `${client.name} has been successfully deleted.`,
      });
    }
  };

  const handleSave = async (id: string, updates: any) => {
    try {
      await updateClient({ id, updates });
      toast({
        title: "Client Updated",
        description: `${updates.name} has been successfully updated.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update client.`,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center p-8">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Clients</h3>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'Failed to load client items'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
          <p className="text-muted-foreground">
            Manage your clients, their services, and billing information
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} disabled={isCreating}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="government">Government</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="disconnected">Disconnected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Client List */}
      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Clients Found</h3>
              <p className="text-muted-foreground mb-4">
                No clients found matching your criteria.
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add First Client
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Phone</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-center p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map(client => (
                    <tr key={client.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{client.name}</td>
                      <td className="p-2">{client.email}</td>
                      <td className="p-2">{client.phone}</td>
                      <td className="p-2">{client.client_type}</td>
                      <td className="p-2">{client.status}</td>
                      <td className="p-2">
                        <div className="flex justify-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(client)}
                            disabled={isUpdating}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(client)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/network-map?client=${client.id}`)}
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ClientAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        initialData={initialFormData}
        onSubmit={async (data) => {
          try {
            await createClient(data);
            toast({
              title: "Client Added",
              description: `${data.name} has been successfully added.`,
            });
          } catch (error) {
            toast({
              title: "Error",
              description: `Failed to create client.`,
              variant: "destructive",
            });
          }
        }}
      />

      <ClientEditDialog
        client={selectedClient}
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            setSelectedClient(null);
          }
        }}
        onSave={handleSave}
      />
    </div>
  );
};

export default Clients;
