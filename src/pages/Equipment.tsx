import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Package, Search, Plus, Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import AddEquipmentDialog from '@/components/equipment/AddEquipmentDialog';
import EditEquipmentDialog from '@/components/equipment/EditEquipmentDialog';
import EquipmentDetailsDialog from '@/components/equipment/EquipmentDetailsDialog';
import { useEquipment } from '@/hooks/useEquipment';

const Equipment = () => {
  const { 
    equipmentList, 
    isLoading, 
    error, 
    createEquipment, 
    updateEquipment, 
    deleteEquipment,
    testEquipmentConnection,
    isCreating,
    isUpdating,
    isDeleting,
    isTestingConnection
  } = useEquipment();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);

  // Filter equipment items
  const filteredItems = equipmentList.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setShowEditDialog(true);
  };

  const handleDetails = (item: any) => {
    setSelectedItem(item);
    setShowDetailsDialog(true);
  };

  const handleDelete = (item: any) => {
    if (window.confirm('Are you sure you want to delete this equipment item?')) {
      deleteEquipment(item.id);
    }
  };

  const handleTestConnection = (item: any) => {
    testEquipmentConnection(item.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'deployed': return 'green';
      case 'maintenance': return 'orange';
      case 'retired': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center p-8">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Equipment</h3>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'Failed to load equipment items'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipment Management</h1>
          <p className="text-muted-foreground">
            Manage your network equipment, routers, and CPE devices
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment Item
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipmentList.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {equipmentList.filter(item => item.status === 'available').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {equipmentList.filter(item => item.status === 'deployed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {equipmentList.filter(item => item.status === 'maintenance').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search equipment items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Router">Router</SelectItem>
                <SelectItem value="Switch">Switch</SelectItem>
                <SelectItem value="CPE">CPE</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="deployed">Deployed</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Items</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Equipment Items</h3>
              <p className="text-muted-foreground mb-4">
                No equipment items found matching your criteria.
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Item</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Serial Number</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Location</th>
                    <th className="text-center p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">
                            {item.name || `${item.manufacturer} ${item.model}` || item.type}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.manufacturer} {item.model}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">{item.type}</td>
                      <td className="p-2 font-mono text-sm">{item.serial_number}</td>
                      <td className="p-2">
                        <Badge variant={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-2">{item.location || 'Not specified'}</td>
                      <td className="p-2">
                        <div className="flex justify-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDetails(item)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            disabled={isUpdating}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTestConnection(item)}
                            disabled={isTestingConnection}
                          >
                            {item.connection_status === 'connected' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
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

      {/* Dialogs */}
      <AddEquipmentDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
      
      <EditEquipmentDialog
        equipment={selectedEquipment}
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedItem(null);
        }}
      />
      
      <EquipmentDetailsDialog
        equipment={selectedEquipment}
        open={showDetailsDialog}
        onClose={() => {
          setShowDetailsDialog(false);
          setSelectedItem(null);
        }}
      />
    </div>
  );
};

export default Equipment;
