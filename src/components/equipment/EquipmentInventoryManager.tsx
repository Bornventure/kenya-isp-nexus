
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, AlertTriangle } from 'lucide-react';
import { Equipment, EquipmentType } from '@/types/equipment';
import EquipmentApprovalDialog from './EquipmentApprovalDialog';

interface EquipmentInventoryManagerProps {
  equipment: Equipment[];
  equipmentTypes: EquipmentType[];
  onAddEquipment: (equipment: Partial<Equipment>) => void;
  approveEquipment: (id: string, notes?: string) => void;
  rejectEquipment: (id: string, notes: string) => void;
}

const EquipmentInventoryManager: React.FC<EquipmentInventoryManagerProps> = ({
  equipment,
  equipmentTypes,
  onAddEquipment,
  approveEquipment,
  rejectEquipment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    type: '',
    brand: '',
    model: '',
    serial_number: '',
    mac_address: '',
    status: 'available',
    equipment_type_id: '',
    ip_address: '',
    snmp_community: 'public',
    snmp_version: 2
  });

  // Filter equipment based on search and status
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Get equipment statistics
  const stats = {
    total: equipment.length,
    available: equipment.filter(e => e.status === 'available').length,
    deployed: equipment.filter(e => e.status === 'deployed').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    retired: equipment.filter(e => e.status === 'retired').length,
    pending: equipment.filter(e => e.approval_status === 'pending').length
  };

  // Low stock items (items that need attention)
  const lowStockItems = equipment.filter(item => 
    item.status === 'maintenance' || 
    (item.warranty_end_date && new Date(item.warranty_end_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  );

  const handleAddEquipment = () => {
    onAddEquipment({
      ...newEquipment,
      status: newEquipment.status as Equipment['status']
    });
    setNewEquipment({
      type: '',
      brand: '',
      model: '',
      serial_number: '',
      mac_address: '',
      status: 'available',
      equipment_type_id: '',
      ip_address: '',
      snmp_community: 'public',
      snmp_version: 2
    });
    setShowAddDialog(false);
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

  const handleApprovalClick = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowApprovalDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Equipment Inventory</h2>
          <p className="text-muted-foreground">Manage your network equipment inventory</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Deployed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.deployed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.maintenance}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Retired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.retired}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Equipment Requiring Attention ({lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <span className="font-medium">{item.brand} {item.model}</span>
                    <span className="text-sm text-muted-foreground ml-2">({item.serial_number})</span>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              ))}
              {lowStockItems.length > 5 && (
                <p className="text-sm text-muted-foreground">
                  ...and {lowStockItems.length - 5} more items
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search equipment by serial number, model, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Equipment List */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment ({filteredEquipment.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEquipment.length === 0 ? (
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
                    <th className="text-left py-3 px-4">Approval</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEquipment.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{item.brand} {item.model}</div>
                          <div className="text-sm text-gray-500">SN: {item.serial_number}</div>
                          {item.mac_address && (
                            <div className="text-sm text-gray-500">MAC: {item.mac_address}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{item.type}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{item.location || 'Not specified'}</td>
                      <td className="py-3 px-4">
                        {item.approval_status === 'pending' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprovalClick(item)}
                          >
                            Review
                          </Button>
                        ) : (
                          <Badge variant={item.approval_status === 'approved' ? 'default' : 'destructive'}>
                            {item.approval_status || 'approved'}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="ghost">
                          View Details
                        </Button>
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
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Add New Equipment</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <Input
                  value={newEquipment.type}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, type: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <Input
                  value={newEquipment.brand}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, brand: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <Input
                  value={newEquipment.model}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, model: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Serial Number</label>
                <Input
                  value={newEquipment.serial_number}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, serial_number: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">MAC Address</label>
                <Input
                  value={newEquipment.mac_address}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, mac_address: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={newEquipment.status}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="available">Available</option>
                  <option value="deployed">Deployed</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEquipment}>
                Add Equipment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Dialog */}
      <EquipmentApprovalDialog
        open={showApprovalDialog}
        onOpenChange={setShowApprovalDialog}
        equipment={selectedEquipment}
        onApprove={approveEquipment}
        onReject={rejectEquipment}
      />
    </div>
  );
};

export default EquipmentInventoryManager;
