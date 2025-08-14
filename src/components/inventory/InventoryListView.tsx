import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Filter, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useInventory, Equipment } from '@/hooks/useInventory';
import AddInventoryItemDialog from './AddInventoryItemDialog';
import EditInventoryItemDialog from './EditInventoryItemDialog';
import InventoryItemDetail from './InventoryItemDetail';

interface InventoryListViewProps {
  initialFilter?: string;
}

const InventoryListView: React.FC<InventoryListViewProps> = ({ initialFilter = '' }) => {
  const { equipment, equipmentLoading, deleteEquipment } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  // Apply initial filter if provided
  React.useEffect(() => {
    if (initialFilter) {
      setSearchTerm(initialFilter);
    }
  }, [initialFilter]);

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'deployed':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'damaged':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (item: Equipment) => {
    setSelectedItem(item);
    setDetailDialogOpen(true);
  };

  const handleEdit = (item: Equipment) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleDelete = (item: Equipment) => {
    if (confirm(`Are you sure you want to delete ${item.name || item.type}?`)) {
      deleteEquipment.mutate(item.id);
    }
  };

  if (equipmentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your equipment and inventory items</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="deployed">Deployed</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="damaged">Damaged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{item.name || item.type}</CardTitle>
                <Badge className={getStatusColor(item.status)} variant="secondary">
                  {item.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {item.brand} {item.model}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Serial:</span>
                  <span className="font-mono">{item.serial_number}</span>
                </div>
                {item.location && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{item.location}</span>
                  </div>
                )}
                {item.mac_address && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MAC:</span>
                    <span className="font-mono">{item.mac_address}</span>
                  </div>
                )}
                {item.clients && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Assigned to:</span>
                    <span>{item.clients.name}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(item)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(item)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item)}
                  disabled={deleteEquipment.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">No inventory items found</div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Item
          </Button>
        </div>
      )}

      <AddInventoryItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      {selectedItem && (
        <>
          <EditInventoryItemDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            item={selectedItem}
          />
          
          <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Equipment Details</DialogTitle>
              </DialogHeader>
              <InventoryItemDetail item={selectedItem} />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default InventoryListView;
