
import React, { useState } from 'react';
import { useClients } from '@/hooks/useClients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserCheck, UserX, Clock, Plus, Search, Eye, Edit } from 'lucide-react';
import ClientDetails from '@/components/clients/ClientDetails';
import CustomerRegistrationForm from '@/components/customers/CustomerRegistrationForm';
import { Client } from '@/types/client';

// Helper function to transform database client data to the Client interface
const transformDatabaseClientToClient = (dbClient: any): Client => {
  return {
    id: dbClient.id,
    name: dbClient.name,
    email: dbClient.email,
    phone: dbClient.phone,
    id_number: dbClient.id_number,
    kra_pin_number: dbClient.kra_pin_number,
    mpesa_number: dbClient.mpesa_number,
    address: dbClient.address,
    county: dbClient.county,
    sub_county: dbClient.sub_county,
    latitude: dbClient.latitude,
    longitude: dbClient.longitude,
    client_type: dbClient.client_type,
    connection_type: dbClient.connection_type,
    service_package_id: dbClient.service_package_id,
    monthly_rate: dbClient.monthly_rate,
    status: dbClient.status,
    balance: dbClient.balance,
    wallet_balance: dbClient.wallet_balance,
    is_active: dbClient.is_active,
    subscription_start_date: dbClient.subscription_start_date,
    subscription_end_date: dbClient.subscription_end_date,
    installation_date: dbClient.installation_date,
    installation_status: dbClient.installation_status,
    installation_completed_at: dbClient.installation_completed_at,
    installation_completed_by: dbClient.installation_completed_by,
    service_activated_at: dbClient.service_activated_at,
    approved_at: dbClient.approved_at,
    approved_by: dbClient.approved_by,
    submitted_by: dbClient.submitted_by,
    isp_company_id: dbClient.isp_company_id,
    created_at: dbClient.created_at,
    updated_at: dbClient.updated_at,
    service_packages: dbClient.service_packages,
    equipment_assignments: dbClient.equipment_assignments,
    // Computed properties for backward compatibility
    location: {
      address: dbClient.address,
      county: dbClient.county,
      subCounty: dbClient.sub_county,
      coordinates: dbClient.latitude && dbClient.longitude ? {
        lat: dbClient.latitude,
        lng: dbClient.longitude
      } : undefined
    },
    equipment: {
      serialNumbers: dbClient.equipment_assignments?.map((ea: any) => ea.equipment.serial_number) || []
    },
    servicePackage: dbClient.service_packages?.name || 'Unknown',
    connectionType: dbClient.connection_type,
    clientType: dbClient.client_type,
    monthlyRate: dbClient.monthly_rate,
    installationDate: dbClient.installation_date || '',
    mpesaNumber: dbClient.mpesa_number,
    idNumber: dbClient.id_number,
    kraPinNumber: dbClient.kra_pin_number
  };
};

const Clients = () => {
  const { clients, isLoading, error, updateClient, approveClient, rejectClient } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.id_number.includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const pendingClients = clients.filter(c => c.status === 'pending').length;
  const suspendedClients = clients.filter(c => c.status === 'suspended').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      case 'disconnected':
        return 'outline';
      case 'approved':
        return 'default';
      case 'inactive':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleViewDetails = (dbClient: any) => {
    const transformedClient = transformDatabaseClientToClient(dbClient);
    setSelectedClient(transformedClient);
    setDetailsOpen(true);
  };

  const handleEdit = (dbClient: any) => {
    const transformedClient = transformDatabaseClientToClient(dbClient);
    // Handle edit logic here
    console.log('Edit client:', transformedClient);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading clients...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">Error loading clients: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{suspendedClients}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Dialog open={registrationOpen} onOpenChange={setRegistrationOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Client</DialogTitle>
            </DialogHeader>
            <CustomerRegistrationForm
              onClose={() => setRegistrationOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Monthly Rate</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.email || 'N/A'}</TableCell>
                  <TableCell>{client.service_packages?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(client.status)}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>KSh {client.monthly_rate.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(client)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(client)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Client Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <ClientDetails
              client={selectedClient}
              onClose={() => setDetailsOpen(false)}
              onApprove={(params) => {
                approveClient(params);
                setDetailsOpen(false);
              }}
              onReject={(params) => {
                rejectClient(params);
                setDetailsOpen(false);
              }}
              onUpdate={(id, updates) => {
                updateClient({ id, updates });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
