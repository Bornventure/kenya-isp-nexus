
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Router, 
  Signal, 
  Filter,
  Search,
} from 'lucide-react';
import InteractiveMap from '@/components/network/InteractiveMap';
import NetworkStats from '@/components/network/NetworkStats';
import ClientListView from '@/components/clients/ClientListView';
import { mockClients } from '@/data/mockData';

const NetworkMap = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientList, setShowClientList] = useState(false);

  const filteredClients = mockClients.filter(client => {
    const statusMatch = filterStatus === 'all' || client.status === filterStatus;
    const typeMatch = filterType === 'all' || client.connectionType === filterType;
    const searchMatch = searchTerm === '' || 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.location.subCounty.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && typeMatch && searchMatch;
  });

  const networkStats = {
    totalClients: mockClients.length,
    activeConnections: mockClients.filter(c => c.status === 'active').length,
    fiberConnections: mockClients.filter(c => c.connectionType === 'fiber').length,
    wirelessConnections: mockClients.filter(c => c.connectionType === 'wireless').length,
    suspendedClients: mockClients.filter(c => c.status === 'suspended').length,
  };

  const handleViewClient = (client: any) => {
    console.log('View client:', client);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Network Map</h1>
          <p className="text-muted-foreground">
            Interactive view of network infrastructure and client locations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Router className="h-4 w-4 mr-2" />
            Add Tower
          </Button>
          <Button variant="outline" size="sm">
            <Signal className="h-4 w-4 mr-2" />
            Signal Test
          </Button>
        </div>
      </div>

      {/* Network Statistics */}
      <NetworkStats stats={networkStats} />

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Map Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search clients by name, email, phone, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium whitespace-nowrap">Status:</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="disconnected">Disconnected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium whitespace-nowrap">Connection:</label>
                <Select value={filterType} onValueChange={setFilterType}>
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
              <Button 
                variant="outline" 
                onClick={() => setShowClientList(!showClientList)}
              >
                {showClientList ? 'Hide' : 'Show'} Client List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardContent className="p-0">
          <InteractiveMap clients={filteredClients} />
        </CardContent>
      </Card>

      {/* Client List (Optional) */}
      {showClientList && (
        <Card>
          <CardHeader>
            <CardTitle>
              Clients on Map ({filteredClients.length} of {mockClients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ClientListView clients={filteredClients} onViewClient={handleViewClient} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NetworkMap;
