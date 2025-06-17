
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Search, Eye, ArrowUp, Plus } from 'lucide-react';
import { useInventoryItems } from '@/hooks/useInventory';
import AddInventoryItemDialog from './AddInventoryItemDialog';
import PromoteToEquipmentDialog from './PromoteToEquipmentDialog';

interface InventoryListViewProps {
  onViewItem: (itemId: string) => void;
  initialFilter?: string;
}

const InventoryListView: React.FC<InventoryListViewProps> = ({
  onViewItem,
  initialFilter = '',
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(initialFilter || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: items = [], isLoading } = useInventoryItems({
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: search || undefined,
  });

  const handlePromoteToEquipment = (item: any) => {
    setSelectedItem(item);
    setShowPromoteDialog(true);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'default';
      case 'Deployed':
        return 'secondary';
      case 'Returned':
        return 'outline';
      case 'Maintenance':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const canPromoteToEquipment = (item: any) => {
    return (
      (item.category === 'Network Hardware' || item.category === 'Infrastructure') &&
      !item.is_network_equipment &&
      item.status === 'In Stock'
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Inventory Items</h2>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
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
              <SelectItem value="Network Hardware">Network Hardware</SelectItem>
              <SelectItem value="CPE">CPE</SelectItem>
              <SelectItem value="Infrastructure">Infrastructure</SelectItem>
              <SelectItem value="Logical Resource">Logical Resource</SelectItem>
              <SelectItem value="Consumable">Consumable</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="In Stock">In Stock</SelectItem>
              <SelectItem value="Deployed">Deployed</SelectItem>
              <SelectItem value="Returned">Returned</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Items ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Network Equipment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">
                        {item.item_id}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>
                        <div>
                          {item.manufacturer && (
                            <div className="text-xs text-muted-foreground">
                              {item.manufacturer}
                            </div>
                          )}
                          <div>{item.model || item.name || '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.serial_number || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.is_network_equipment ? (
                          <Badge variant="secondary">Promoted</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
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
                          {canPromoteToEquipment(item) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePromoteToEquipment(item)}
                            >
                              <ArrowUp className="h-4 w-4 mr-1" />
                              Promote
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No inventory items found</p>
              <p className="text-sm">Add some items to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddInventoryItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      <PromoteToEquipmentDialog
        open={showPromoteDialog}
        onOpenChange={setShowPromoteDialog}
        inventoryItem={selectedItem}
      />
    </div>
  );
};

export default InventoryListView;
