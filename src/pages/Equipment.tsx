
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Router, 
  Wifi, 
  Server,
  Search,
  Plus,
  Settings,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// Mock equipment data
const mockEquipment = [
  {
    id: 'EQ001',
    name: 'Main Tower - Kilimani',
    type: 'Tower',
    status: 'active',
    location: 'Kilimani, Nairobi',
    coordinates: { lat: -1.2921, lng: 36.8219 },
    installDate: '2023-01-15',
    lastMaintenance: '2024-05-20',
    nextMaintenance: '2024-08-20',
    connectedClients: 45,
    signalStrength: 95,
    uptime: 99.8,
  },
  {
    id: 'EQ002',
    name: 'Sector Antenna A1',
    type: 'Antenna',
    status: 'active',
    location: 'Westlands, Nairobi',
    coordinates: { lat: -1.2634, lng: 36.8078 },
    installDate: '2023-03-10',
    lastMaintenance: '2024-04-15',
    nextMaintenance: '2024-07-15',
    connectedClients: 32,
    signalStrength: 88,
    uptime: 98.5,
  },
  {
    id: 'EQ003',
    name: 'Fiber Node - Karen',
    type: 'Fiber Node',
    status: 'maintenance',
    location: 'Karen, Nairobi',
    coordinates: { lat: -1.3197, lng: 36.6859 },
    installDate: '2022-11-20',
    lastMaintenance: '2024-06-01',
    nextMaintenance: '2024-06-08',
    connectedClients: 28,
    signalStrength: 0,
    uptime: 0,
  },
  {
    id: 'EQ004',
    name: 'Wireless Bridge - Industrial Area',
    type: 'Bridge',
    status: 'warning',
    location: 'Industrial Area, Nairobi',
    coordinates: { lat: -1.3031, lng: 36.8506 },
    installDate: '2023-06-12',
    lastMaintenance: '2024-03-10',
    nextMaintenance: '2024-06-10',
    connectedClients: 18,
    signalStrength: 72,
    uptime: 94.2,
  },
];

const Equipment = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredEquipment = mockEquipment.filter(equipment => {
    const statusMatch = statusFilter === 'all' || equipment.status === statusFilter;
    const typeMatch = typeFilter === 'all' || equipment.type === typeFilter;
    const searchMatch = searchTerm === '' || 
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && typeMatch && searchMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'warning': return 'bg-orange-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'offline': return <XCircle className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equipment Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage network infrastructure equipment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Maintenance Schedule
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        </div>
      </div>

      {/* Equipment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Equipment</p>
                <p className="text-2xl font-bold">{mockEquipment.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-2xl font-bold">
                  {mockEquipment.filter(e => e.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Needs Attention</p>
                <p className="text-2xl font-bold">
                  {mockEquipment.filter(e => e.status === 'warning' || e.status === 'maintenance').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wifi className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Connected Clients</p>
                <p className="text-2xl font-bold">
                  {mockEquipment.reduce((sum, e) => sum + e.connectedClients, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search equipment by name, ID, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium whitespace-nowrap">Status:</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
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
                    <SelectItem value="Tower">Tower</SelectItem>
                    <SelectItem value="Antenna">Antenna</SelectItem>
                    <SelectItem value="Fiber Node">Fiber Node</SelectItem>
                    <SelectItem value="Bridge">Bridge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEquipment.map((equipment) => (
          <Card key={equipment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{equipment.name}</CardTitle>
                <Badge 
                  className={`text-white ${getStatusColor(equipment.status)}`}
                >
                  <span className="flex items-center gap-1">
                    {getStatusIcon(equipment.status)}
                    {equipment.status}
                  </span>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{equipment.id} • {equipment.type}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {equipment.location}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Connected Clients</p>
                  <p className="text-muted-foreground">{equipment.connectedClients}</p>
                </div>
                <div>
                  <p className="font-medium">Signal Strength</p>
                  <p className="text-muted-foreground">{equipment.signalStrength}%</p>
                </div>
                <div>
                  <p className="font-medium">Uptime</p>
                  <p className="text-muted-foreground">{equipment.uptime}%</p>
                </div>
                <div>
                  <p className="font-medium">Install Date</p>
                  <p className="text-muted-foreground">{formatDate(equipment.installDate)}</p>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Last Maintenance: {formatDate(equipment.lastMaintenance)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>Next Maintenance: {formatDate(equipment.nextMaintenance)}</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Schedule Maintenance
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Equipment Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or add new equipment to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Equipment;
