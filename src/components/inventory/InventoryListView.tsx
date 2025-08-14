
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { useInventoryItems } from '@/hooks/useInventory';
import { Equipment } from '@/hooks/useInventory';
import AddInventoryItemDialog from './AddInventoryItemDialog';
import EditInventoryItemDialog from './EditInventoryItemDialog';
import InventoryItemDetail from './InventoryItemDetail';

interface InventoryListViewProps {
  initialFilter?: string;
}

const InventoryListView: React.FC<InventoryListViewProps> = ({ initialFilter = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  // Map filter values to match database status values
  const mapFilterToStatus = (filter: string) => {
    switch (filter) {
      case 'In Stock':
        return 'available';
      case 'Deployed':
        return 'deployed';
      case 'Maintenance':
        return 'maintenance';
      default:
        return filter;
    }
  };

  const { data: items, isLoading } = useInventoryItems({ 
    status: initialFilter ? mapFilterToStatus(initialFilter) : undefined 
  });

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    
    return items.filter(item =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'deployed':
        return 'secondary';
      case 'maintenance':
        return 'destructive';
      case 'damaged':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case 'available':
        return 'In Stock';
      case 'deployed':
        return 'Deployed';
      case 'maintenance':
        return 'Maintenance';
      case 'damaged':
        return 'Damaged';
      default:
        return status;
    }
  };

  const handleEdit = (item: Equipment) => {
    setSelectedItem(item);
    setShowEditDialog(true);
  };

  const handleViewDetails = (item: Equipment) => {
    setSelectedItem(item);
    setShowDetailDialog(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading inventory items...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {initialFilter ? `${initialFilter} Items` : 'All Inventory Items'}
            </CardTitle>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{item.name || item.type}</h3>
                        <Badge variant={getStatusBadgeVariant(item.status)}>
                          {getStatusDisplayText(item.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Type:</span> {item.type}
                        </div>
                        <div>
                          <span className="font-medium">Brand:</span> {item.brand || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Model:</span> {item.model || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {item.location || 'Not specified'}
                        </div>
                        <div>
                          <span className="font-medium">Serial:</span> {item.serial_number || 'N/A'}
                        </div>
                        {item.location && (
                          <div>
                            <span className="font-medium">Location:</span> {item.location}
                          </div>
                        )}
                      </div>
                      {item.notes && (
                        <div className="mt-2 text-sm text-gray-500">
                          <span className="font-medium">Notes:</span> {item.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No items match your search criteria.' : 'No inventory items found.'}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AddInventoryItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      {selectedItem && (
        <>
          <EditInventoryItemDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            item={selectedItem}
          />
          <InventoryItemDetail
            open={showDetailDialog}
            onOpenChange={setShowDetailDialog}
            item={selectedItem}
          />
        </>
      )}
    </div>
  );
};

export default InventoryListView;
