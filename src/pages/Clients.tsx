
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
import { mockClients } from '@/data/mockData';
import { Client } from '@/types/client';
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
} from 'lucide-react';

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [connectionFilter, setConnectionFilter] = useState<string>('all');
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('list');

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm) ||
                         client.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.location.subCounty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesType = typeFilter === 'all' || client.clientType === typeFilter;
    const matchesConnection = connectionFilter === 'all' || client.connectionType === connectionFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesConnection;
  });

  const handleAddClient = (newClientData: Partial<Client>) => {
    const newClient = { ...newClientData } as Client;
    setClients(prev => [...prev, newClient]);
    setShowRegistrationForm(false);
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  const handleEditClient = () => {
    setShowClientDetails(false);
  };

  const handleStatusChange = (newStatus: Client['status']) => {
    if (selectedClient) {
      setClients(prev => prev.map(client => 
        client.id === selectedClient.id 
          ? { ...client, status: newStatus }
          : client
      ));
      setSelectedClient({ ...selectedClient, status: newStatus });
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'grid':
        return <ClientGridView clients={filteredClients} onViewClient={handleViewClient} />;
      case 'map':
        return <InteractiveMap clients={filteredClients} />;
      case 'list':
      default:
        return <ClientListView clients={filteredClients} onViewClient={handleViewClient} />;
    }
  };

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
          <Button className="gap-2" onClick={() => setShowRegistrationForm(true)}>
            <UserPlus className="h-4 w-4" />
            Add New Client
          </Button>
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
              {mockClients.filter(c => c.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active Clients</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {mockClients.filter(c => c.status === 'suspended').length}
            </div>
            <div className="text-sm text-gray-600">Suspended</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {mockClients.filter(c => c.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {mockClients.length}
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
            Client {currentView === 'list' ? 'List' : currentView === 'grid' ? 'Grid' : 'Map'} ({filteredClients.length} of {mockClients.length})
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
          client={selectedClient}
          onClose={() => setShowClientDetails(false)}
          onEdit={handleEditClient}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default Clients;
