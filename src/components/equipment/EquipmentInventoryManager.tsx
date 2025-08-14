
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Package, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Equipment } from '@/types/equipment';

interface EquipmentInventoryManagerProps {
  equipment: Equipment[];
  onAddEquipment: (equipment: Partial<Equipment>) => void;
  onUpdateEquipment: (id: string, updates: Partial<Equipment>) => void;
  onDeleteEquipment: (id: string) => void;
}

const EquipmentInventoryManager: React.FC<EquipmentInventoryManagerProps> = ({
  equipment,
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Equipment>>({});

  // Filter equipment based on search term
  const filteredEquipment = equipment.filter(item =>
    item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get low stock items (less than 5 available)
  const lowStockItems = equipment.filter(item => {
    const availableCount = equipment.filter(e => 
      e.model === item.model && 
      e.brand === item.brand && 
      e.status === 'available'
    ).length;
    return availableCount < 5;
  });

  // Get unique low stock models
  const uniqueLowStockItems = lowStockItems.reduce((acc, item) => {
    const key = `${item.brand}-${item.model}`;
    if (!acc.find(i => `${i.brand}-${i.model}` === key)) {
      acc.push(item);
    }
    return acc;
  }, [] as Equipment[]);

  // Equipment statistics
  const totalEquipment = equipment.length;
  const availableEquipment = equipment.filter(e => e.status === 'available').length;
  const deployedEquipment = equipment.filter(e => e.status === 'deployed').length;
  const maintenanceEquipment = equipment.filter(e => e.status === 'maintenance').length;

  const handleEdit = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setEditFormData(equipment);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedEquipment && editFormData) {
      onUpdateEquipment(selectedEquipment.id, editFormData);
      setEditDialogOpen(false);
      setSelectedEquipment(null);
      setEditFormData({});
    }
  };

  const getStatusColor = (status: Equipment['status']) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'deployed':
        return 'secondary';
      case 'maintenance':
        return 'destructive';
      case 'retired':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEquipment}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableEquipment}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{deployedEquipment}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{maintenanceEquipment}</div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {uniqueLowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uniqueLowStockItems.map((item, index) => {
                const availableCount = equipment.filter(e => 
                  e.model === item.model && 
                  e.brand === item.brand && 
                  e.status === 'available'
                ).length;
                return (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-orange-800">
                      {item.brand} {item.model}
                    </span>
                    <Badge variant="outline" className="text-orange-800 border-orange-300">
                      {availableCount} available
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Actions */}
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Equipment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.brand}</TableCell>
                  <TableCell>{item.model}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.serial_number}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.location || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteEquipment(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Equipment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Equipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                value={editFormData.status || ''}
                onChange={(e) => setEditFormData(prev => ({ 
                  ...prev, 
                  status: e.target.value as Equipment['status']
                }))}
                className="w-full p-2 border rounded"
              >
                <option value="available">Available</option>
                <option value="deployed">Deployed</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={editFormData.location || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EquipmentInventoryManager;
