
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Eye, Edit, Package, Network, User, AlertTriangle } from 'lucide-react';
import { useInventoryItems, useUnassignEquipmentFromClient } from '@/hooks/useInventory';
import AddInventoryItemDialog from './AddInventoryItemDialog';
import EditInventoryItemDialog from './EditInventoryItemDialog';
import AssignEquipmentDialog from './AssignEquipmentDialog';
import PromoteToEquipmentDialog from './PromoteToEquipmentDialog';
import { format } from 'date-fns';

interface InventoryListViewProps {
  onViewItem: (itemId: string) => void;
  initialFilter?: string;
}

const InventoryListView: React.FC<InventoryListViewProps> = ({
  onViewItem,
  initialFilter = '',
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [assigningItem, setAssigningItem] = useState<{ id: string; name: string } | null>(null);
  const [promotingItem, setPromotingItem] = useState<any>(null);

  const { mutate: unassignEquipment, isPending: isUnassigning } = useUnassignEquipmentFromClient();

  // Set initial filter when component mounts or initialFilter changes
  useEffect(() => {
    console.log('InventoryListView - Setting initial filter:', initialFilter);
    if (initialFilter) {
      // Check if initialFilter is a status or category
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
      filterObj.search = search;
    }
    
    console.log('InventoryListView - Built filters:', filterObj);
    return filterObj;
  }, [categoryFilter, statusFilter, search]);

  const { data: inventoryItems = [], isLoading, error } = useInventoryItems(filters);

  console.log('InventoryListView - Render state:', {
    itemsCount: inventoryItems.length,
    isLoading,
    error: error?.message,
    filters,
    initialFilter,
    categoryFilter,
    statusFilter,
    search
  });

  const handleUnassign = (itemId: string) => {
    if (confirm('Are you sure you want to unassign this equipment?')) {
      unassignEquipment(itemId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'default';
      case 'Deployed':
        return 'secondary';
      case 'Maintenance':
        return 'destructive';
      case 'Out of Stock':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const categories = ['Network Hardware', 'CPE', 'Infrastructure', 'Logical Resource', 'Consumable'];
  const statuses = ['In Stock', 'Deployed', 'Maintenance', 'Out of Stock'];

  if (error) {
    console.error('InventoryListView - Error rendering:', error);
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Inventory</h3>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory Items</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : `${inventoryItems.length} items found`}
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Package className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Debug Info */}
      <div className="bg-gray-50 p-4 rounded-lg text-sm">
        <p><strong>Debug Info:</strong></p>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Items Count: {inventoryItems.length}</p>
        <p>Error: {error ? error.message : 'None'}</p>
        <p>Filters: {JSON.stringify(filters)}</p>
        <p>Initial Filter: {initialFilter}</p>
        <p>Category Filter: {categoryFilter}</p>
        <p>Status Filter: {statusFilter}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
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
      </div>

      {/* Items Table */}
      <div className="border rounded-lg">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading inventory items...</p>
          </div>
        ) : inventoryItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item ID</TableHead>
                <TableHead>Name/Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">
                    {item.item_id || item.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name || item.type}</div>
                      {item.manufacturer && item.model && (
                        <div className="text-sm text-muted-foreground">
                          {item.manufacturer} {item.model}
                        </div>
                      )}
                      {item.serial_number && (
                        <div className="text-xs text-muted-foreground font-mono">
                          S/N: {item.serial_number}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.location || '-'}</TableCell>
                  <TableCell>
                    {item.clients ? (
                      <div>
                        <div className="font-medium">{item.clients.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.clients.phone}
                        </div>
                        {item.assignment_date && (
                          <div className="text-xs text-muted-foreground">
                            Assigned: {format(new Date(item.assignment_date), 'PPP')}
                          </div>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewItem(item.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingItem(item.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {/* Promote to Equipment button for eligible items */}
                      {(item.category === 'Network Hardware' || item.category === 'CPE') && 
                       !item.is_network_equipment && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPromotingItem(item)}
                          title="Promote to Network Equipment"
                        >
                          <Network className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Assignment actions */}
                      {item.status === 'In Stock' && item.category === 'CPE' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAssigningItem({
                            id: item.id,
                            name: item.name || item.type || 'Equipment'
                          })}
                        >
                          <User className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {item.assigned_customer_id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnassign(item.id)}
                          disabled={isUnassigning}
                        >
                          Unassign
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center">
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
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddInventoryItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      {editingItem && (
        <EditInventoryItemDialog
          itemId={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        />
      )}

      {assigningItem && (
        <AssignEquipmentDialog
          open={!!assigningItem}
          onOpenChange={(open) => !open && setAssigningItem(null)}
          clientId=""
          clientName=""
        />
      )}

      {promotingItem && (
        <PromoteToEquipmentDialog
          open={!!promotingItem}
          onOpenChange={(open) => !open && setPromotingItem(null)}
          inventoryItem={promotingItem}
        />
      )}
    </div>
  );
};

export default InventoryListView;
