
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Filter, Eye, Edit, Plus } from 'lucide-react';
import { useInventoryItems } from '@/hooks/useInventory';
import AddInventoryItemDialog from './AddInventoryItemDialog';
import EditInventoryItemDialog from './EditInventoryItemDialog';

interface InventoryListViewProps {
  onViewItem: (itemId: string) => void;
  initialFilter?: string;
}

const InventoryListView: React.FC<InventoryListViewProps> = ({
  onViewItem,
  initialFilter = '',
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const filters = {
    search: search || undefined,
    category: categoryFilter || undefined,
    status: statusFilter || undefined,
  };

  const { data: items, isLoading } = useInventoryItems(filters);

  useEffect(() => {
    if (initialFilter) {
      setStatusFilter(initialFilter);
    }
  }, [initialFilter]);

  const categories = [
    'Network Hardware',
    'CPE',
    'Infrastructure',
    'Logical Resource',
    'Consumable',
  ];

  const statuses = [
    'In Stock',
    'Deployed',
    'Live/Deployed',
    'Provisioning',
    'Maintenance',
    'Faulty',
    'In Repair',
    'Returned',
    'Retired',
    'Available',
    'Reserved',
    'Assigned',
    'Active',
    'Under Construction',
    'Decommissioned',
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
      case 'Available':
        return 'default';
      case 'Deployed':
      case 'Live/Deployed':
      case 'Active':
        return 'default';
      case 'Maintenance':
      case 'In Repair':
      case 'Under Construction':
        return 'secondary';
      case 'Faulty':
      case 'Retired':
      case 'Decommissioned':
        return 'destructive';
      case 'Provisioning':
      case 'Reserved':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inventory Items ({items?.length || 0})</CardTitle>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setCategoryFilter('');
                setStatusFilter('');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          {/* Items Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location/Customer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No inventory items found. Add your first item to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">
                        {item.item_id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.type}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.category}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {item.manufacturer && (
                            <div className="text-sm text-muted-foreground">
                              {item.manufacturer}
                            </div>
                          )}
                          <div className="font-medium">{item.model || item.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.serial_number || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.clients?.name || item.location || '-'}
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddInventoryItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      {editingItem && (
        <EditInventoryItemDialog
          open={true}
          onOpenChange={() => setEditingItem(null)}
          itemId={editingItem}
        />
      )}
    </div>
  );
};

export default InventoryListView;
