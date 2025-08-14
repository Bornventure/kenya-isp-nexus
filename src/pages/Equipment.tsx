
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Plus, 
  Download, 
  Router, 
  Wifi, 
  Smartphone,
  Settings,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  MapPin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Equipment } from '@/types/equipment';
import { useEquipment } from '@/hooks/useEquipment';

const EquipmentPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    equipment,
    equipmentTypes,
    isLoading: equipmentLoading,
    typesLoading,
    createEquipment,
    updateEquipment,
    deleteEquipment
  } = useEquipment();

  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    serial_number: '',
    model: '',
    type: '',
    status: 'available',
    purchase_date: new Date().toISOString().split('T')[0],
    warranty_end_date: '',
    mac_address: '',
    location: '',
    notes: ''
  });

  // Filter equipment
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.mac_address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Statistics
  const stats = {
    total: equipment.length,
    available: equipment.filter(e => e.status === 'available').length,
    deployed: equipment.filter(e => e.status === 'deployed').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    retired: equipment.filter(e => e.status === 'retired').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'deployed':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'retired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'router':
        return <Router className="h-4 w-4" />;
      case 'access point':
        return <Wifi className="h-4 w-4" />;
      case 'modem':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createEquipment(newEquipment);
      setShowAddDialog(false);
      setNewEquipment({
        serial_number: '',
        model: '',
        type: '',
        status: 'available',
        purchase_date: new Date().toISOString().split('T')[0],
        warranty_end_date: '',
        mac_address: '',
        location: '',
        notes: ''
      });
      toast({
        title: "Success",
        description: "Equipment added successfully",
      });
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast({
        title: "Error",
        description: "Failed to add equipment",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEquipment = async (equipment: Equipment) => {
    try {
      await updateEquipment({ id: equipment.id, updates: equipment });
      setEditingEquipment(null);
      toast({
        title: "Success",
        description: "Equipment updated successfully",
      });
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast({
        title: "Error",
        description: "Failed to update equipment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return;
    
    try {
      await deleteEquipment(id);
      toast({
        title: "Success",
        description: "Equipment deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast({
        title: "Error",
        description: "Failed to delete equipment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipment Management</h1>
          <p className="text-muted-foreground">
            Manage your network equipment inventory and assignments
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed</CardTitle>
            <Router className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.deployed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.maintenance}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retired</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.retired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search equipment by serial number, model, or MAC address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="deployed">Deployed</option>
          <option value="maintenance">Maintenance</option>
          <option value="retired">Retired</option>
        </select>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2"
        >
          <option value="all">All Types</option>
          {equipmentTypes.map(type => (
            <option key={type.id} value={type.name}>{type.name}</option>
          ))}
        </select>
        
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Equipment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment ({filteredEquipment.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {equipmentLoading ? (
            <div className="text-center py-8">Loading equipment...</div>
          ) : filteredEquipment.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No equipment found matching your criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Equipment</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Location</th>
                    <th className="text-left py-3 px-4">Warranty</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEquipment.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{item.model}</div>
                          <div className="text-sm text-gray-500">SN: {item.serial_number}</div>
                          {item.mac_address && (
                            <div className="text-sm text-gray-500">MAC: {item.mac_address}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          {item.type}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {item.location || 'Not specified'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {item.warranty_end_date ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              {new Date(item.warranty_end_date).toLocaleDateString()}
                            </div>
                          ) : (
                            'Not specified'
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingEquipment(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEquipment(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Equipment Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEquipment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serial_number">Serial Number *</Label>
                <Input
                  id="serial_number"
                  value={newEquipment.serial_number}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, serial_number: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={newEquipment.model}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, model: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Equipment Type *</Label>
                <select
                  id="type"
                  value={newEquipment.type}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Type</option>
                  {equipmentTypes.map(type => (
                    <option key={type.id} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={newEquipment.status}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, status: e.target.value as Equipment['status'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="available">Available</option>
                  <option value="deployed">Deployed</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              <div>
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={newEquipment.purchase_date}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, purchase_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="warranty_end_date">Warranty Expiry</Label>
                <Input
                  id="warranty_end_date"
                  type="date"
                  value={newEquipment.warranty_end_date}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, warranty_end_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="mac_address">MAC Address</Label>
                <Input
                  id="mac_address"
                  value={newEquipment.mac_address}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, mac_address: e.target.value }))}
                  placeholder="XX:XX:XX:XX:XX:XX"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newEquipment.location}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newEquipment.notes}
                onChange={(e) => setNewEquipment(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Equipment</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EquipmentPage;
