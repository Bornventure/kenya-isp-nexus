
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { useEquipment } from '@/hooks/useEquipment';
import { useClients } from '@/hooks/useClients';
import EquipmentForm from '@/components/equipment/EquipmentForm';

const Equipment = () => {
  const { equipment, isLoading } = useEquipment();
  const { clients } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredEquipment = equipment.filter(equipment => {
    const statusMatch = statusFilter === 'all' || equipment.status === statusFilter;
    const typeMatch = typeFilter === 'all' || equipment.type === typeFilter;
    const searchMatch = searchTerm === '' || 
      equipment.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.model?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && typeMatch && searchMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'assigned': return 'bg-blue-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'damaged': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'assigned': return <Wifi className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      case 'damaged': return <XCircle className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getClientName = (clientId: string | null) => {
    if (!clientId) return 'Unassigned';
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading equipment...</div>
      </div>
    );
  }

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
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Equipment</DialogTitle>
              </DialogHeader>
              <EquipmentForm />
            </DialogContent>
          </Dialog>
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
                <p className="text-2xl font-bold">{equipment.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Available</p>
                <p className="text-2xl font-bold">
                  {equipment.filter(e => e.status === 'available').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wifi className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Assigned</p>
                <p className="text-2xl font-bold">
                  {equipment.filter(e => e.status === 'assigned').length}
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
                  {equipment.filter(e => e.status === 'maintenance' || e.status === 'damaged').length}
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
                placeholder="Search equipment by serial, type, brand, or model..."
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
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
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
                    <SelectItem value="Router">Router</SelectItem>
                    <SelectItem value="Switch">Switch</SelectItem>
                    <SelectItem value="Access Point">Access Point</SelectItem>
                    <SelectItem value="Modem">Modem</SelectItem>
                    <SelectItem value="Antenna">Antenna</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEquipment.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{item.type}</CardTitle>
                <Badge 
                  className={`text-white ${getStatusColor(item.status)}`}
                >
                  <span className="flex items-center gap-1">
                    {getStatusIcon(item.status)}
                    {item.status}
                  </span>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                S/N: {item.serial_number}
                {item.brand && item.model && ` • ${item.brand} ${item.model}`}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Assigned to</p>
                  <p className="text-muted-foreground">{getClientName(item.client_id)}</p>
                </div>
                <div>
                  <p className="font-medium">MAC Address</p>
                  <p className="text-muted-foreground">{item.mac_address || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium">Purchase Date</p>
                  <p className="text-muted-foreground">{formatDate(item.purchase_date)}</p>
                </div>
                <div>
                  <p className="font-medium">Warranty End</p>
                  <p className="text-muted-foreground">{formatDate(item.warranty_end_date)}</p>
                </div>
              </div>
              
              {item.notes && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium">Notes:</p>
                  <p className="text-sm text-muted-foreground">{item.notes}</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Assign
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
