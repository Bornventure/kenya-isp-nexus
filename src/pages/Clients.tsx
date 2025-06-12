import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClients, DatabaseClient } from '@/hooks/useClients';
import ClientRegistrationForm from '@/components/clients/ClientRegistrationForm';
import ClientDetails from '@/components/clients/ClientDetails';
import ClientViewSwitcher, { ViewMode } from '@/components/clients/ClientViewSwitcher';
import ClientListView from '@/components/clients/ClientListView';
import ClientGridView from '@/components/clients/ClientGridView';
import InteractiveMap from '@/components/network/InteractiveMap';
import {
  Search,
  Filter,
  UserPlus,
  Users,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [connectionFilter, setConnectionFilter] = useState<string>('all');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<DatabaseClient | null>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('list');

  const { clients, isLoading, updateClient, deleteClient, isUpdatingClient, isDeletingClient } = useClients();
  const queryClient = useQueryClient();

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         client.phone.includes(searchTerm) ||
                         client.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.sub_county.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesType = typeFilter === 'all' || client.client_type === typeFilter;
    const matchesConnection = connectionFilter === 'all' || client.connection_type === connectionFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesConnection;
  });

  // Transform database clients to match the expected format for existing components
  const transformedClients = filteredClients.map(client => ({
    id: client.id,
    name: client.name,
    email: client.email || '',
    phone: client.phone,
    mpesaNumber: client.mpesa_number || '',
    idNumber: client.id_number,
    kraPinNumber: client.kra_pin_number || '',
    clientType: client.client_type,
    status: client.status,
    connectionType: client.connection_type,
    servicePackage: client.service_packages?.name || `${client.monthly_rate} KES/month`,
    monthlyRate: client.monthly_rate,
    installationDate: client.installation_date || '',
    location: {
      address: client.address,
      county: client.county,
      subCounty: client.sub_county,
      coordinates: client.latitude && client.longitude ? {
        lat: client.latitude,
        lng: client.longitude,
      } : undefined,
    },
    balance: client.balance,
    lastPayment: undefined, // TODO: Fetch from payments table
  }));

  const handleAddClient = () => {
    // The edge function handles everything, just close the form
    setShowRegistrationForm(false);
    // Refresh the client list by invalidating queries
    window.location.reload();
  };

  const handleViewClient = (client: any) => {
    // Find the original database client
    const dbClient = clients.find(c => c.id === client.id);
    if (dbClient) {
      setSelectedClient(dbClient);
      setShowClientDetails(true);
    }
  };

  const handleEditClient = () => {
    setShowClientDetails(false);
  };

  const handleStatusChange = (newStatus: DatabaseClient['status']) => {
    if (selectedClient) {
      updateClient({
        id: selectedClient.id,
        updates: { status: newStatus }
      });
      setSelectedClient({ ...selectedClient, status: newStatus });
    }
  };

  const handleDeleteClient = (clientId: string) => {
    deleteClient(clientId);
    setShowClientDetails(false);
    setSelectedClient(null);
  };

  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'grid':
        return <ClientGridView clients={transformedClients} onViewClient={handleViewClient} />;
      case 'map':
        return <InteractiveMap clients={transformedClients} />;
      case 'list':
      default:
        return <ClientListView clients={transformedClients} onViewClient={handleViewClient} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-2">
              Manage your internet service subscribers
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button 
              className="gap-2" 
              onClick={() => setShowRegistrationForm(true)}
            >
              <UserPlus className="h-4 w-4" />
              Add New Client
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search clients by name, email, phone, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium whitespace-nowrap">Status:</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="disconnected">Disconnected</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium whitespace-nowrap">Type:</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium whitespace-nowrap">Connection:</label>
                  <Select value={connectionFilter} onValueChange={setConnectionFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="fiber">Fiber</SelectItem>
                      <SelectItem value="wireless">Wireless</SelectItem>
                      <SelectItem value="satellite">Satellite</SelectItem>
                      <SelectItem value="dsl">DSL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Switcher */}
        <div className="mb-6">
          <ClientViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
        </div>
      </div>

      {/* Client Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {clients.filter(c => c.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active Clients</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {clients.filter(c => c.status === 'suspended').length}
            </div>
            <div className="text-sm text-gray-600">Suspended</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {clients.filter(c => c.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {clients.length}
            </div>
            <div className="text-sm text-gray-600">Total Clients</div>
          </CardContent>
        </Card>
      </div>

      {/* Current View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Client {currentView === 'list' ? 'List' : currentView === 'grid' ? 'Grid' : 'Map'} ({filteredClients.length} of {clients.length})
          </CardTitle>
        </CardHeader>
        <CardContent className={currentView === 'map' ? 'p-0' : undefined}>
          {renderCurrentView()}
        </CardContent>
      </Card>

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <ClientRegistrationForm
          onClose={() => setShowRegistrationForm(false)}
          onSave={handleAddClient}
        />
      )}

      {/* Client Details Modal */}
      {showClientDetails && selectedClient && (
        <ClientDetails
          client={{
            id: selectedClient.id,
            name: selectedClient.name,
            email: selectedClient.email || '',
            phone: selectedClient.phone,
            mpesaNumber: selectedClient.mpesa_number || '',
            idNumber: selectedClient.id_number,
            kraPinNumber: selectedClient.kra_pin_number || '',
            clientType: selectedClient.client_type,
            status: selectedClient.status,
            connectionType: selectedClient.connection_type,
            servicePackage: selectedClient.service_packages?.name || `${selectedClient.monthly_rate} KES/month`,
            monthlyRate: selectedClient.monthly_rate,
            installationDate: selectedClient.installation_date || '',
            location: {
              address: selectedClient.address,
              county: selectedClient.county,
              subCounty: selectedClient.sub_county,
              coordinates: selectedClient.latitude && selectedClient.longitude ? {
                lat: selectedClient.latitude,
                lng: selectedClient.longitude,
              } : undefined,
            },
            balance: selectedClient.balance,
          }}
          onClose={() => setShowClientDetails(false)}
          onEdit={handleEditClient}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteClient}
          isUpdating={isUpdatingClient}
          isDeleting={isDeletingClient}
        />
      )}
    </div>
  );
};

export default Clients;
