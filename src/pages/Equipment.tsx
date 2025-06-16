
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Router, 
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle
} from 'lucide-react';
import EquipmentActions from '@/components/equipment/EquipmentActions';

// Mock data for equipment
const mockEquipment = [
  {
    id: 1,
    type: 'Router',
    brand: 'Mikrotik',
    model: 'hAP ac2',
    serialNumber: 'MT2021001',
    macAddress: '4C:5E:0C:12:34:56',
    status: 'active',
    clientName: 'John Doe',
    location: 'Nairobi CBD',
    installDate: '2024-01-15',
    warrantyEnd: '2026-01-15'
  },
  {
    id: 2,
    type: 'Modem',
    brand: 'Huawei',
    model: 'HG8245H',
    serialNumber: 'HW2021002',
    macAddress: '00:25:9E:FE:12:34',
    status: 'maintenance',
    clientName: 'Jane Smith',
    location: 'Westlands',
    installDate: '2024-02-10',
    warrantyEnd: '2026-02-10'
  },
  {
    id: 3,
    type: 'Antenna',
    brand: 'Ubiquiti',
    model: 'NanoStation 5AC',
    serialNumber: 'UB2021003',
    macAddress: '24:A4:3C:12:34:56',
    status: 'available',
    clientName: null,
    location: 'Warehouse',
    installDate: null,
    warrantyEnd: '2025-12-31'
  }
];

const Equipment = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [equipment, setEquipment] = useState(mockEquipment);

  const filteredEquipment = equipment.filter(item => {
    const statusMatch = filterStatus === 'all' || item.status === filterStatus;
    const typeMatch = filterType === 'all' || item.type.toLowerCase() === filterType;
    const searchMatch = searchTerm === '' || 
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && typeMatch && searchMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'faulty': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'maintenance': return <Clock className="h-3 w-3 mr-1" />;
      case 'available': return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'faulty': return <XCircle className="h-3 w-3 mr-1" />;
      default: return <AlertCircle className="h-3 w-3 mr-1" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEquipmentAdded = () => {
    // Refresh equipment list
    console.log('Equipment added, refreshing list...');
  };

  const handleMaintenanceScheduled = () => {
    // Refresh maintenance schedule
    console.log('Maintenance scheduled, refreshing...');
  };

  const totalEquipment = equipment.length;
  const activeEquipment = equipment.filter(e => e.status === 'active').length;
  const availableEquipment = equipment.filter(e => e.status === 'available').length;
  const maintenanceEquipment = equipment.filter(e => e.status === 'maintenance').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equipment Management</h1>
          <p className="text-muted-foreground">
            Track and manage network equipment inventory
          </p>
        </div>
        <EquipmentActions
          onEquipmentAdded={handleEquipmentAdded}
          onMaintenanceScheduled={handleMaintenanceScheduled}
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Router className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Equipment</p>
                <p className="text-2xl font-bold">{totalEquipment}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{activeEquipment}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-blue-600">{availableEquipment}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{maintenanceEquipment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by serial number, brand, model, or client..."
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
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="faulty">Faulty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium whitespace-nowrap">Type:</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="router">Router</SelectItem>
                    <SelectItem value="modem">Modem</SelectItem>
                    <SelectItem value="antenna">Antenna</SelectItem>
                    <SelectItem value="cable">Cable</SelectItem>
                    <SelectItem value="switch">Switch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Equipment ({filteredEquipment.length} of {equipment.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type & Model</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Install Date</TableHead>
                  <TableHead>Warranty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.brand} {item.model}</div>
                        <div className="text-sm text-gray-500">{item.type}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.serialNumber}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)}
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.clientName || '-'}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{formatDate(item.installDate)}</TableCell>
                    <TableCell>
                      <span className={new Date(item.warrantyEnd) < new Date() ? 'text-red-600' : 'text-green-600'}>
                        {formatDate(item.warrantyEnd)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredEquipment.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Router className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Equipment;
