
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useInventoryItems } from '@/hooks/useInventory';
import { Package, Search, Plus, Edit, Settings, Trash2 } from 'lucide-react';
import AddInventoryItemDialog from './AddInventoryItemDialog';
import EditInventoryItemDialog from './EditInventoryItemDialog';
import AssignEquipmentDialog from './AssignEquipmentDialog';

interface InventoryListViewProps {
  initialFilter?: string;
}

const InventoryListView: React.FC<InventoryListViewProps> = ({ 
  initialFilter = '',
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [assigningItem, setAssigningItem] = useState<{ id: string; name: string } | null>(null);

  // Set initial filters when component mounts or initialFilter changes
  React.useEffect(() => {
    if (initialFilter && initialFilter !== '') {
      // Check if it's a status filter
      const statuses = ['In Stock', 'Deployed', 'Maintenance', 'Out of Stock'];
      if (statuses.includes(initialFilter)) {
        setStatusFilter(initialFilter);
        setCategoryFilter('all');
      } else {
        setCategoryFilter(initialFilter);
        setStatusFilter('all');
      }
    }
  }, [initialFilter]);

  // Build filters object - only include non-"all" values
  const filters = React.useMemo(() => {
    const filterObj: { category?: string; status?: string; search?: string } = {};
    
    if (categoryFilter && categoryFilter !== 'all') {
      filterObj.category = categoryFilter;
    }
    if (statusFilter && statusFilter !== 'all') {
      filterObj.status = statusFilter;
    }
    if (search && search.trim()) {
      filterObj.search = search.trim();
    }
    
    return filterObj;
  }, [categoryFilter, statusFilter, search]);

  const { data: items, isLoading, error } = useInventoryItems(filters);

  const categories = ['Routers', 'Switches', 'Cables', 'Antennas', 'Power Supplies', 'Accessories'];
  const statuses = ['In Stock', 'Deployed', 'Maintenance', 'Out of Stock'];

  const handleItemAction = (itemId: string, action: 'edit' | 'assign' | 'delete') => {
    const item = items?.find(i => i.id === itemId);
    if (!item) return;

    switch (action) {
      case 'edit':
        setEditingItem(itemId);
        break;
      case 'assign':
        setAssigningItem({ id: itemId, name: item.name || item.model || 'Unnamed Item' });
        break;
      case 'delete':
        // Handle delete - you might want to add a confirmation dialog
        console.log('Delete item:', itemId);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-destructive opacity-50" />
            <h3 className="text-lg font-medium mb-2">Error Loading Inventory</h3>
            <p className="text-sm text-muted-foreground">
              {error.message}
            </p>
          </CardContent>
        </Card>
      ) : items && items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.name || item.model || 'Unnamed Item'}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleItemAction(item.id, 'edit')}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleItemAction(item.id, 'assign')}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleItemAction(item.id, 'delete')}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <Badge variant="outline">{item.category}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge 
                    variant={
                      item.status === 'In Stock' ? 'default' :
                      item.status === 'Deployed' ? 'secondary' :
                      item.status === 'Maintenance' ? 'destructive' :
                      'outline'
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Stock Qty:</span>
                  <span className="font-medium">{item.quantity_in_stock || 1}</span>
                </div>
                
                {item.serial_number && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Serial:</span>
                    <span className="text-sm font-mono">{item.serial_number}</span>
                  </div>
                )}
                
                {item.location && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Location:</span>
                    <span className="text-sm">{item.location}</span>
                  </div>
                )}
                
                {item.notes && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {item.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No inventory items found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Click "Add Item" to get started'
              }
            </p>
            {(search || categoryFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <AddInventoryItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      {editingItem && (
        <EditInventoryItemDialog
          itemId={editingItem}
          open={!!editingItem}
          onOpenChange={() => setEditingItem(null)}
        />
      )}

      {assigningItem && (
        <AssignEquipmentDialog
          open={!!assigningItem}
          onOpenChange={() => setAssigningItem(null)}
          clientId=""
          clientName=""
        />
      )}
    </div>
  );
};

export default InventoryListView;
