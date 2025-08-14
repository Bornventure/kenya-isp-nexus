
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Package, Eye, Edit, Trash2 } from 'lucide-react';
import { useEquipment } from '@/hooks/useEquipment';
import InventoryDashboard from '@/components/inventory/InventoryDashboard';

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const {
    equipment,
    isLoading,
    createEquipment,
    updateEquipment,
    isCreating,
    isUpdating,
  } = useEquipment();

  const handleFilterByStatus = (status: string) => {
    setStatusFilter(status);
  };

  const handleViewItem = (item: any) => {
    setSelectedItem(item);
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = (item.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.serial_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.type || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'available': return 'secondary';
      case 'maintenance': return 'destructive';
      case 'retired': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your equipment inventory and stock levels
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Inventory Item
        </Button>
      </div>

      {/* Dashboard Component */}
      <InventoryDashboard 
        onFilterByStatus={handleFilterByStatus}
        onViewItem={handleViewItem}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{equipment.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-green-500 rounded-full" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">
                  {equipment.filter(e => e.status === 'available').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-orange-500 rounded-full" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Use</p>
                <p className="text-2xl font-bold">
                  {equipment.filter(e => e.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-red-500 rounded-full" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold">
                  {equipment.filter(e => e.status === 'maintenance').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'available' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('available')}
              >
                Available
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                In Use
              </Button>
              <Button
                variant={statusFilter === 'maintenance' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('maintenance')}
              >
                Maintenance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEquipment.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <div>
                    <CardTitle className="text-lg">{item.model || item.type}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {item.brand} - {item.type}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(item.status)}>
                  {item.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Serial:</span> {item.serial_number}
                </div>
                {item.mac_address && (
                  <div className="text-sm">
                    <span className="font-medium">MAC:</span> {item.mac_address}
                  </div>
                )}
                {item.ip_address && (
                  <div className="text-sm">
                    <span className="font-medium">IP:</span> {item.ip_address}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1">
                  <Eye className="h-3 w-3" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1">
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button size="sm" variant="destructive" className="gap-1">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No inventory items found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Get started by adding your first inventory item'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InventoryPage;
