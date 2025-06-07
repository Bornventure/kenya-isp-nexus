
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { 
  MapPin, 
  Wifi, 
  Router, 
  Signal, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  Phone,
  Mail
} from 'lucide-react';
import InteractiveMap from '@/components/network/InteractiveMap';
import NetworkStats from '@/components/network/NetworkStats';
import { mockClients } from '@/data/mockData';

const NetworkMap = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">Suspended</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-sm">Disconnected</span>
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

      {/* Client List Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clients on Map ({filteredClients.length} of {mockClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Connection</TableHead>
                  <TableHead>Monthly Rate</TableHead>
                  <TableHead>Balance</TableHead>
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
                        {client.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {client.status === 'suspended' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {client.status}
                      </Badge>
                    </TableCell>
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
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Signal className="h-3 w-3" />
                        {client.connectionType}
                      </div>
                    </TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredClients.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-2">
                <Users className="h-8 w-8 mx-auto" />
              </div>
              <h3 className="text-lg font-medium mb-1">No clients found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkMap;
