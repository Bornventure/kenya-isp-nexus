
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Search,
  Filter,
  UserPlus,
  Wifi,
  WifiOff,
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Users,
  CheckCircle
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

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'suspended':
        return <WifiOff className="h-3 w-3 mr-1" />;
      case 'disconnected':
        return <AlertCircle className="h-3 w-3 mr-1" />;
      case 'pending':
        return <Clock className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
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

        {/* Enhanced Search and Filters */}
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

      {/* Client List Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Client List ({filteredClients.length} of {mockClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Connection</TableHead>
                  <TableHead>Monthly Rate</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{client.name}</div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(client.status)}>
                        {getStatusIcon(client.status)}
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{client.clientType}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {client.location.subCounty}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {client.location.address}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Wifi className="h-3 w-3" />
                        {client.servicePackage}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{client.connectionType}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(client.monthlyRate)}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        client.balance < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(client.balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewClient(client)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || connectionFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first client.'
                }
              </p>
            </div>
          )}
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
