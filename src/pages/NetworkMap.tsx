
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Filter
} from 'lucide-react';
import InteractiveMap from '@/components/network/InteractiveMap';
import NetworkStats from '@/components/network/NetworkStats';
import { mockClients } from '@/data/mockData';

const NetworkMap = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredClients = mockClients.filter(client => {
    const statusMatch = filterStatus === 'all' || client.status === filterStatus;
    const typeMatch = filterType === 'all' || client.connectionType === filterType;
    return statusMatch && typeMatch;
  });

  const networkStats = {
    totalClients: mockClients.length,
    activeConnections: mockClients.filter(c => c.status === 'active').length,
    fiberConnections: mockClients.filter(c => c.connectionType === 'fiber').length,
    wirelessConnections: mockClients.filter(c => c.connectionType === 'wireless').length,
    suspendedClients: mockClients.filter(c => c.status === 'suspended').length,
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Map Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Status:</label>
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
              <label className="text-sm font-medium">Connection:</label>
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
            <div className="flex items-center gap-4 ml-auto">
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
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardContent className="p-0">
          <InteractiveMap clients={filteredClients} />
        </CardContent>
      </Card>

      {/* Client List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clients on Map ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <div key={client.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{client.name}</h4>
                  <Badge 
                    variant={client.status === 'active' ? 'default' : 'secondary'}
                    className={
                      client.status === 'active' ? 'bg-green-100 text-green-800' :
                      client.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      client.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {client.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {client.status === 'suspended' && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {client.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {client.location.address}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Wifi className="h-4 w-4" />
                  {client.servicePackage}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Signal className="h-4 w-4" />
                  {client.connectionType}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkMap;
