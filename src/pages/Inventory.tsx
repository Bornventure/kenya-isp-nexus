
import React, { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Eye, Edit, Trash2, Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddInventoryItemDialog from '@/components/inventory/AddInventoryItemDialog';
import EditInventoryItemDialog from '@/components/inventory/EditInventoryItemDialog';
import AssignEquipmentDialog from '@/components/inventory/AssignEquipmentDialog';
import type { Equipment } from '@/hooks/useInventory';

const Inventory = () => {
  const { 
    equipment: inventoryItems, 
    isLoading, 
    error, 
    createEquipment, 
    updateEquipment, 
    deleteEquipment,
    isCreating,
    isUpdating,
    isDeleting
  } = useInventory();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Equipment | null>(null);

  // Filter inventory based on search term
  const filteredItems = inventoryItems.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const totalItems = inventoryItems.length;
  const availableItems = inventoryItems.filter(item => item.status === 'available').length;
  const deployedItems = inventoryItems.filter(item => item.status === 'deployed').length;
  const maintenanceItems = inventoryItems.filter(item => item.status === 'maintenance').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'deployed':
        return 'default';
      case 'maintenance':
        return 'secondary';
      case 'damaged':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'deployed':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'maintenance':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'damaged':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const handleEdit = (item: Equipment) => {
    setItemToEdit(item);
    setEditOpen(true);
  };

  const handleDelete = async (itemId: string, itemName: string) => {
    if (window.confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      try {
        await deleteEquipment(itemId);
        toast({
          title: "Item Deleted",
          description: `${itemName} has been deleted successfully.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete item. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAssign = (item: Equipment) => {
    setSelectedItem(item);
    setAssignOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading inventory...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">Error loading inventory: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{deployedItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{maintenanceItems}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Inventory Item
        </Button>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Brand/Model</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <div>
                        <div className="font-medium">{item.name || item.type}</div>
                        {item.name && item.type && (
                          <div className="text-sm text-muted-foreground">{item.type}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.brand}</div>
                      <div className="text-sm text-muted-foreground">{item.model}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{item.serial_number}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.location || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        title="Edit Item"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {item.status === 'available' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssign(item)}
                          title="Assign to Client"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id, item.name || item.type || 'Unknown')}
                        title="Delete Item"
                        className="text-red-600 hover:text-red-700"
                        disabled={isDeleting}
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

      {/* Add Inventory Item Dialog */}
      <AddInventoryItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
      />

      {/* Edit Inventory Item Dialog */}
      <EditInventoryItemDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        item={itemToEdit}
      />

      {/* Assign Equipment Dialog */}
      <AssignEquipmentDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        equipment={selectedItem}
      />
    </div>
  );
};

export default Inventory;
