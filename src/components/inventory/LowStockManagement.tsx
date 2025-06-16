
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Eye, Package, ShoppingCart } from 'lucide-react';
import { useLowStockItems } from '@/hooks/useInventory';

interface LowStockManagementProps {
  onViewItem: (itemId: string) => void;
}

const LowStockManagement: React.FC<LowStockManagementProps> = ({
  onViewItem,
}) => {
  const { data: lowStockItems, isLoading } = useLowStockItems();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const criticalItems = lowStockItems?.filter(item => 
    item.quantity_in_stock !== null && 
    item.reorder_level !== null && 
    item.quantity_in_stock <= (item.reorder_level * 0.5)
  ) || [];

  const warningItems = lowStockItems?.filter(item => 
    item.quantity_in_stock !== null && 
    item.reorder_level !== null && 
    item.quantity_in_stock > (item.reorder_level * 0.5) && 
    item.quantity_in_stock <= item.reorder_level
  ) || [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-700">{criticalItems.length}</div>
            <div className="text-sm text-red-600">Critical Stock</div>
            <div className="text-xs text-red-500">≤50% of reorder level</div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-700">{warningItems.length}</div>
            <div className="text-sm text-orange-600">Low Stock</div>
            <div className="text-xs text-orange-500">At reorder level</div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <ShoppingCart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">{lowStockItems?.length || 0}</div>
            <div className="text-sm text-blue-600">Total Items</div>
            <div className="text-xs text-blue-500">Need attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Low Stock Items ({lowStockItems?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockItems && lowStockItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item ID</TableHead>
                  <TableHead>Name/Model</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((item) => {
                  const stockRatio = item.quantity_in_stock! / item.reorder_level!;
                  const isCritical = stockRatio <= 0.5;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">
                        {item.item_id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name || item.model}</div>
                          <div className="text-sm text-muted-foreground">{item.type}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.item_sku || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={isCritical ? 'text-red-600 font-semibold' : 'text-orange-600 font-semibold'}>
                            {item.quantity_in_stock}
                          </span>
                          {isCritical && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        </div>
                      </TableCell>
                      <TableCell>{item.reorder_level}</TableCell>
                      <TableCell>
                        {item.unit_cost ? `$${item.unit_cost.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isCritical ? 'destructive' : 'secondary'}>
                          {isCritical ? 'Critical' : 'Low Stock'}
                        </Badge>
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
                            className={isCritical ? 'bg-red-600 hover:bg-red-700' : ''}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Reorder
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No low stock items found</p>
              <p className="text-sm text-muted-foreground">All consumable items are above their reorder levels</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {lowStockItems && lowStockItems.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-700">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>• Review and update reorder levels for frequently used items</p>
              <p>• Set up automatic purchase orders for critical consumables</p>
              <p>• Consider bulk purchasing for items with high usage rates</p>
              <p>• Establish supplier relationships for emergency restocking</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LowStockManagement;
